import { api } from "../core/api.js";
import { t, formatNumber, formatDate, compareText } from "../core/i18n.js";

let tariffs = [];
let editingTariffId = null;

function normalizeNumber(value) {
    return value.trim().replace(",", ".");
}

function validateTariffForm(elements) {
    let isValid = true;

    elements.nameError.textContent = "";
    elements.priceError.textContent = "";
    elements.validFromError.textContent = "";
    elements.validToError.textContent = "";

    const name = elements.nameInput.value.trim();
    const price = Number(normalizeNumber(elements.priceInput.value));
    const validFrom = elements.validFromInput.value.trim();
    const validTo = elements.validToInput.value.trim();

    if (!name) {
        elements.nameError.textContent = t("tariffNameRequired");
        isValid = false;
    }

    if (!elements.priceInput.value.trim()) {
        elements.priceError.textContent = t("priceRequired");
        isValid = false;
    } else if (!Number.isFinite(price) || price <= 0) {
        elements.priceError.textContent = t("priceInvalid");
        isValid = false;
    }

    if (!validFrom) {
        elements.validFromError.textContent = t("dateFromRequired");
        isValid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(validFrom)) {
        elements.validFromError.textContent = t("dateInvalid");
        isValid = false;
    }

    if (validTo && !/^\d{4}-\d{2}-\d{2}$/.test(validTo)) {
        elements.validToError.textContent = t("dateInvalid");
        isValid = false;
    }

    if (validFrom && validTo && validFrom > validTo) {
        elements.validToError.textContent = t("dateToBeforeFrom");
        isValid = false;
    }

    return isValid;
}

function getTodayIso() {
    return new Date().toISOString().slice(0, 10);
}

function clearForm(elements) {
    editingTariffId = null;

    elements.formTitle.textContent = t("tariffNew");
    elements.submitBtn.textContent = t("tariffAdd");

    elements.nameInput.value = "Basic tariff";
    elements.priceInput.value = "4.32";
    elements.validFromInput.value = getTodayIso();
    elements.validToInput.value = "";
    elements.activeInput.checked = true;

    elements.nameError.textContent = "";
    elements.priceError.textContent = "";
    elements.validFromError.textContent = "";
    elements.validToError.textContent = "";
}

function fillFormForEdit(tariff, elements) {
    editingTariffId = tariff.id;

    elements.formTitle.textContent = t("tariffEdit");
    elements.submitBtn.textContent = t("tariffSave");

    elements.nameInput.value = tariff.tariff_name;
    elements.priceInput.value = tariff.price_per_kwh;
    elements.validFromInput.value = tariff.valid_from;
    elements.validToInput.value = tariff.valid_to || "";
    elements.activeInput.checked = Boolean(tariff.is_active);

    elements.nameError.textContent = "";
    elements.priceError.textContent = "";
    elements.validFromError.textContent = "";
    elements.validToError.textContent = "";
}

function renderTariffsTable(root, elements, showToast) {
    const tableRoot = root.querySelector("#tariffsTableRoot");

    tariffs.sort((a, b) => compareText(a.tariff_name, b.tariff_name));

    if (tariffs.length === 0) {
        tableRoot.innerHTML = `
            <div class="empty-state">
                ${t("tariffsEmpty")}
            </div>
        `;
        return;
    }

    tableRoot.innerHTML = `
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${t("tariffName")}</th>
                        <th>${t("price")}</th>
                        <th>${t("period")}</th>
                        <th>${t("active")}</th>
                        <th>${t("actions")}</th>
                    </tr>
                </thead>
                <tbody>
                    ${tariffs.map((tariff) => `
                        <tr>
                            <td>
                                <strong>${tariff.tariff_name}</strong>
                            </td>
                            <td>${formatNumber(tariff.price_per_kwh)} ${t("currency")}/${t("kwh")}</td>
                            <td>${formatDate(tariff.valid_from)} — ${tariff.valid_to ? formatDate(tariff.valid_to) : t("withoutEnd")}</td>
                            <td>
                                <span class="badge ${tariff.is_active ? "badge-success" : "badge-muted"}">
                                    ${tariff.is_active ? t("yes") : t("no")}
                                </span>
                            </td>
                            <td>
                                <div class="actions-cell">
                                    <button class="btn btn-secondary btn-small" data-action="edit" data-id="${tariff.id}">
                                        ${t("edit")}
                                    </button>
                                    <button class="btn btn-warning btn-small" data-action="activate" data-id="${tariff.id}" ${tariff.is_active ? "disabled" : ""}>
                                        ${t("activate")}
                                    </button>
                                    <button class="btn btn-danger btn-small" data-action="delete" data-id="${tariff.id}">
                                        ${t("delete")}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;

    tableRoot.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", async () => {
            const id = Number(button.dataset.id);
            const action = button.dataset.action;
            const tariff = tariffs.find((item) => item.id === id);

            if (!tariff) {
                return;
            }

            if (action === "edit") {
                fillFormForEdit(tariff, elements);
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }

            if (action === "activate") {
                try {
                    await api.post(`/tariffs/${id}/activate`, {});
                    showToast(t("tariffActivated"), "success");
                    await loadTariffs(root, elements, showToast);
                } catch (error) {
                    showToast(error.message || t("tariffActivateError"), "error");
                }

                return;
            }

            if (action === "delete") {
                const confirmed = window.confirm(`${t("deleteTariffConfirm")} "${tariff.tariff_name}"?`);

                if (!confirmed) {
                    return;
                }

                try {
                    await api.delete(`/tariffs/${id}`);
                    showToast(t("tariffDeleted"), "success");

                    if (editingTariffId === id) {
                        clearForm(elements);
                    }

                    await loadTariffs(root, elements, showToast);
                } catch (error) {
                    showToast(error.message || t("tariffDeleteError"), "error");
                }
            }
        });
    });
}

async function loadTariffs(root, elements, showToast) {
    try {
        tariffs = await api.get("/tariffs");
        renderTariffsTable(root, elements, showToast);
    } catch (error) {
        showToast(error.message || t("tariffLoadError"), "error");
    }
}

function getElements(root) {
    return {
        form: root.querySelector("#tariffForm"),
        formTitle: root.querySelector("#tariffFormTitle"),
        nameInput: root.querySelector("#tariffNameInput"),
        priceInput: root.querySelector("#tariffPriceInput"),
        validFromInput: root.querySelector("#tariffValidFromInput"),
        validToInput: root.querySelector("#tariffValidToInput"),
        activeInput: root.querySelector("#tariffActiveInput"),
        submitBtn: root.querySelector("#tariffSubmitBtn"),
        resetBtn: root.querySelector("#tariffResetBtn"),
        nameError: root.querySelector("#tariffNameError"),
        priceError: root.querySelector("#tariffPriceError"),
        validFromError: root.querySelector("#tariffValidFromError"),
        validToError: root.querySelector("#tariffValidToError")
    };
}

export async function initTariffsSection({ showToast }) {
    const root = document.getElementById("tariffsRoot");

    root.innerHTML = `
        <div class="section-grid">
            <article class="panel">
                <h3 id="tariffFormTitle">${t("tariffNew")}</h3>

                <form id="tariffForm" class="form-panel" novalidate>
                    <div class="form-group">
                        <label class="form-label" for="tariffNameInput">${t("tariffName")}</label>
                        <input class="form-input" id="tariffNameInput" type="text" value="Basic tariff">
                        <div class="form-error" id="tariffNameError"></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="tariffPriceInput">${t("tariffPrice")}</label>
                        <input class="form-input" id="tariffPriceInput" type="text" inputmode="decimal" value="4.32">
                        <div class="form-error" id="tariffPriceError"></div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="tariffValidFromInput">${t("validFrom")}</label>
                            <input class="form-input" id="tariffValidFromInput" type="date">
                            <div class="form-error" id="tariffValidFromError"></div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="tariffValidToInput">${t("validTo")}</label>
                            <input class="form-input" id="tariffValidToInput" type="date">
                            <div class="form-error" id="tariffValidToError"></div>
                        </div>
                    </div>

                    <label class="checkbox-row">
                        <span>${t("makeActive")}</span>
                        <input id="tariffActiveInput" type="checkbox" checked>
                    </label>

                    <button class="btn btn-primary" id="tariffSubmitBtn" type="submit">
                        ${t("tariffAdd")}
                    </button>

                    <button class="btn btn-outline" id="tariffResetBtn" type="button">
                        ${t("clear")}
                    </button>
                </form>
            </article>

            <article class="panel">
                <h3>${t("tariffList")}</h3>
                <div id="tariffsTableRoot" class="data-list"></div>
            </article>
        </div>
    `;

    const elements = getElements(root);
    elements.validFromInput.value = getTodayIso();

    elements.resetBtn.addEventListener("click", () => {
        clearForm(elements);
    });

    elements.form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validateTariffForm(elements)) {
            showToast(t("tariffFormError"), "error");
            return;
        }

        const payload = {
            tariff_name: elements.nameInput.value.trim(),
            price_per_kwh: Number(normalizeNumber(elements.priceInput.value)),
            valid_from: elements.validFromInput.value,
            valid_to: elements.validToInput.value || null,
            is_active: elements.activeInput.checked
        };

        try {
            if (editingTariffId) {
                await api.patch(`/tariffs/${editingTariffId}`, payload);
                showToast(t("tariffUpdated"), "success");
            } else {
                await api.post("/tariffs", payload);
                showToast(t("tariffCreated"), "success");
            }

            clearForm(elements);
            await loadTariffs(root, elements, showToast);
        } catch (error) {
            showToast(error.message || t("tariffSaveError"), "error");
        }
    });

    await loadTariffs(root, elements, showToast);
}