import { api } from "../core/api.js";
import { t, formatDateTime, formatNumber, compareText } from "../core/i18n.js";

let appliances = [];
let editingApplianceId = null;

function normalizeNumber(value) {
    return value.trim().replace(",", ".");
}

function validateApplianceForm(elements) {
    let isValid = true;

    elements.nameError.textContent = "";
    elements.powerError.textContent = "";

    const name = elements.nameInput.value.trim();
    const powerValue = elements.powerInput.value.trim();
    const power = Number(normalizeNumber(powerValue));

    if (!name) {
        elements.nameError.textContent = t("applianceNameRequired");
        isValid = false;
    }

    if (powerValue && (!Number.isFinite(power) || power <= 0)) {
        elements.powerError.textContent = t("powerInvalid");
        isValid = false;
    }

    return isValid;
}

function clearForm(elements) {
    editingApplianceId = null;

    elements.formTitle.textContent = t("applianceNew");
    elements.submitBtn.textContent = t("applianceAdd");

    elements.nameInput.value = "Boiler";
    elements.descriptionInput.value = "";
    elements.powerInput.value = "2.0";

    elements.nameError.textContent = "";
    elements.powerError.textContent = "";
}

function fillFormForEdit(appliance, elements) {
    editingApplianceId = appliance.id;

    elements.formTitle.textContent = t("applianceEdit");
    elements.submitBtn.textContent = t("applianceSave");

    elements.nameInput.value = appliance.name;
    elements.descriptionInput.value = appliance.description || "";
    elements.powerInput.value = appliance.estimated_power || "";

    elements.nameError.textContent = "";
    elements.powerError.textContent = "";
}

function renderAppliancesTable(root, elements, showToast) {
    const tableRoot = root.querySelector("#appliancesTableRoot");

    appliances.sort((a, b) => compareText(a.name, b.name));

    if (appliances.length === 0) {
        tableRoot.innerHTML = `
            <div class="empty-state">
                ${t("appliancesEmpty")}
            </div>
        `;
        return;
    }

    tableRoot.innerHTML = `
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${t("applianceName")}</th>
                        <th>${t("description")}</th>
                        <th>${t("estimatedPower")}</th>
                        <th>${t("createdAt")}</th>
                        <th>${t("actions")}</th>
                    </tr>
                </thead>
                <tbody>
                    ${appliances.map((appliance) => `
                        <tr>
                            <td>
                                <strong>${appliance.name}</strong>
                            </td>
                            <td>${appliance.description || "—"}</td>
                            <td>${appliance.estimated_power ? `${formatNumber(appliance.estimated_power)} ${t("kw")}` : "—"}</td>
                            <td>${formatDateTime(appliance.created_at)}</td>
                            <td>
                                <div class="actions-cell">
                                    <button class="btn btn-secondary btn-small" data-action="edit" data-id="${appliance.id}">
                                        ${t("edit")}
                                    </button>
                                    <button class="btn btn-danger btn-small" data-action="delete" data-id="${appliance.id}">
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
            const appliance = appliances.find((item) => item.id === id);

            if (!appliance) {
                return;
            }

            if (action === "edit") {
                fillFormForEdit(appliance, elements);
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }

            if (action === "delete") {
                const confirmed = window.confirm(`${t("deleteApplianceConfirm")} "${appliance.name}"?`);

                if (!confirmed) {
                    return;
                }

                try {
                    await api.delete(`/appliances/${id}`);
                    showToast(t("applianceDeleted"), "success");

                    document.dispatchEvent(new CustomEvent("appliancesChanged"));
                    document.dispatchEvent(new CustomEvent("userDataChanged"));

                    if (editingApplianceId === id) {
                        clearForm(elements);
                    }

                    await loadAppliances(root, elements, showToast);
                } catch (error) {
                    showToast(error.message || t("applianceDeleteError"), "error");
                }
            }
        });
    });
}

async function loadAppliances(root, elements, showToast) {
    try {
        appliances = await api.get("/appliances");
        renderAppliancesTable(root, elements, showToast);
    } catch (error) {
        showToast(error.message || t("applianceLoadError"), "error");
    }
}

function getElements(root) {
    return {
        form: root.querySelector("#applianceForm"),
        formTitle: root.querySelector("#applianceFormTitle"),
        nameInput: root.querySelector("#applianceNameInput"),
        descriptionInput: root.querySelector("#applianceDescriptionInput"),
        powerInput: root.querySelector("#appliancePowerInput"),
        submitBtn: root.querySelector("#applianceSubmitBtn"),
        resetBtn: root.querySelector("#applianceResetBtn"),
        nameError: root.querySelector("#applianceNameError"),
        powerError: root.querySelector("#appliancePowerError")
    };
}

export async function initAppliancesSection({ showToast }) {
    const root = document.getElementById("appliancesRoot");

    root.innerHTML = `
        <div class="section-grid">
            <article class="panel">
                <h3 id="applianceFormTitle">${t("applianceNew")}</h3>

                <form id="applianceForm" class="form-panel" novalidate>
                    <div class="form-group">
                        <label class="form-label" for="applianceNameInput">${t("applianceName")}</label>
                        <input class="form-input" id="applianceNameInput" type="text" value="Boiler">
                        <div class="form-error" id="applianceNameError"></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="applianceDescriptionInput">${t("description")}</label>
                        <textarea class="form-input" id="applianceDescriptionInput" rows="4"></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="appliancePowerInput">${t("estimatedPower")}</label>
                        <input class="form-input" id="appliancePowerInput" type="text" inputmode="decimal" value="2.0">
                        <div class="form-error" id="appliancePowerError"></div>
                    </div>

                    <button class="btn btn-primary" id="applianceSubmitBtn" type="submit">
                        ${t("applianceAdd")}
                    </button>

                    <button class="btn btn-outline" id="applianceResetBtn" type="button">
                        ${t("clear")}
                    </button>
                </form>
            </article>

            <article class="panel">
                <h3>${t("applianceList")}</h3>
                <div id="appliancesTableRoot" class="data-list"></div>
            </article>
        </div>
    `;

    const elements = getElements(root);

    elements.resetBtn.addEventListener("click", () => {
        clearForm(elements);
    });

    elements.form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validateApplianceForm(elements)) {
            showToast(t("applianceFormError"), "error");
            return;
        }

        const powerValue = elements.powerInput.value.trim();

        const payload = {
            name: elements.nameInput.value.trim(),
            description: elements.descriptionInput.value.trim() || null,
            estimated_power: powerValue ? Number(normalizeNumber(powerValue)) : null
        };

        try {
            if (editingApplianceId) {
                await api.patch(`/appliances/${editingApplianceId}`, payload);
                showToast(t("applianceUpdated"), "success");
            } else {
                await api.post("/appliances", payload);
                showToast(t("applianceCreated"), "success");
            }

            document.dispatchEvent(new CustomEvent("appliancesChanged"));
            document.dispatchEvent(new CustomEvent("userDataChanged"));

            clearForm(elements);
            await loadAppliances(root, elements, showToast);
        } catch (error) {
            showToast(error.message || t("applianceSaveError"), "error");
        }
    });

    await loadAppliances(root, elements, showToast);
}