import { api } from "../core/api.js";
import { t, formatDate, formatDateTime, formatNumber, compareText } from "../core/i18n.js";
import { todayIso } from "./overview.js";

let appliances = [];
let records = [];
let editingRecordId = null;
let currentRoot = null;
let currentElements = null;
let currentShowToast = null;
let appliancesListenerRegistered = false;

function normalizeNumber(value) {
    return value.trim().replace(",", ".");
}

function getApplianceName(id) {
    const appliance = appliances.find((item) => item.id === id);
    return appliance ? appliance.name : t("withoutAppliance");
}

function validateConsumptionForm(elements) {
    let isValid = true;

    elements.dateError.textContent = "";
    elements.kwhError.textContent = "";
    elements.hoursError.textContent = "";
    elements.applianceError.textContent = "";

    const date = elements.dateInput.value.trim();
    const mode = elements.modeInput.value;
    const kwhValue = elements.kwhInput.value.trim();
    const hoursValue = elements.hoursInput.value.trim();
    const applianceId = elements.applianceSelect.value;

    if (!date) {
        elements.dateError.textContent = t("dateRequired");
        isValid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        elements.dateError.textContent = t("dateInvalid");
        isValid = false;
    }

    if (mode === "manual") {
        const kwh = Number(normalizeNumber(kwhValue));

        if (!kwhValue) {
            elements.kwhError.textContent = t("kwhRequired");
            isValid = false;
        } else if (!Number.isFinite(kwh) || kwh <= 0) {
            elements.kwhError.textContent = t("kwhInvalid");
            isValid = false;
        }
    }

    if (mode === "hours") {
        const hours = Number(normalizeNumber(hoursValue));

        if (!applianceId) {
            elements.applianceError.textContent = t("applianceRequiredForHours");
            isValid = false;
        }

        const selectedAppliance = appliances.find((item) => item.id === Number(applianceId));

        if (selectedAppliance && !selectedAppliance.estimated_power) {
            elements.applianceError.textContent = t("appliancePowerRequired");
            isValid = false;
        }

        if (!hoursValue) {
            elements.hoursError.textContent = t("hoursRequired");
            isValid = false;
        } else if (!Number.isFinite(hours) || hours <= 0) {
            elements.hoursError.textContent = t("hoursInvalid");
            isValid = false;
        }
    }

    return isValid;
}

function renderModeFields(elements) {
    const mode = elements.modeInput.value;

    elements.manualGroup.classList.toggle("hidden", mode !== "manual");
    elements.hoursGroup.classList.toggle("hidden", mode !== "hours");

    elements.kwhError.textContent = "";
    elements.hoursError.textContent = "";
    elements.applianceError.textContent = "";
}

function clearForm(elements) {
    editingRecordId = null;

    elements.formTitle.textContent = t("consumptionNew");
    elements.submitBtn.textContent = t("consumptionAdd");

    elements.applianceSelect.value = "";
    elements.modeInput.value = "manual";
    elements.dateInput.value = todayIso();
    elements.kwhInput.value = "3.5";
    elements.hoursInput.value = "2.0";
    elements.notesInput.value = "";

    elements.dateError.textContent = "";
    elements.kwhError.textContent = "";
    elements.hoursError.textContent = "";
    elements.applianceError.textContent = "";

    renderModeFields(elements);
}

function fillFormForEdit(record, elements) {
    editingRecordId = record.id;

    elements.formTitle.textContent = t("consumptionEdit");
    elements.submitBtn.textContent = t("consumptionSave");

    elements.applianceSelect.value = record.appliance_id ? String(record.appliance_id) : "";
    elements.modeInput.value = "manual";
    elements.dateInput.value = record.record_date;
    elements.kwhInput.value = record.consumption_kwh;
    elements.hoursInput.value = "2.0";
    elements.notesInput.value = record.notes || "";

    elements.dateError.textContent = "";
    elements.kwhError.textContent = "";
    elements.hoursError.textContent = "";
    elements.applianceError.textContent = "";

    renderModeFields(elements);
}

function renderApplianceOptions(elements) {
    appliances.sort((a, b) => compareText(a.name, b.name));

    elements.applianceSelect.innerHTML = `
        <option value="">${t("withoutAppliance")}</option>
        ${appliances.map((appliance) => `
            <option value="${appliance.id}">
                ${appliance.name} (${appliance.estimated_power ? formatNumber(appliance.estimated_power) : "—"} ${t("kw")})
            </option>
        `).join("")}
    `;
}

function renderRecordsTable(root, elements, showToast) {
    const tableRoot = root.querySelector("#consumptionTableRoot");

    if (records.length === 0) {
        tableRoot.innerHTML = `
            <div class="empty-state">
                ${t("consumptionEmpty")}
            </div>
        `;
        return;
    }

    tableRoot.innerHTML = `
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${t("recordDate")}</th>
                        <th>${t("appliance")}</th>
                        <th>${t("totalConsumption")}</th>
                        <th>${t("tariff")}</th>
                        <th>${t("cost")}</th>
                        <th>${t("notes")}</th>
                        <th>${t("updatedAt")}</th>
                        <th>${t("actions")}</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map((record) => `
                        <tr>
                            <td>${formatDate(record.record_date)}</td>
                            <td>${getApplianceName(record.appliance_id)}</td>
                            <td>${formatNumber(record.consumption_kwh)} ${t("kwh")}</td>
                            <td>${formatNumber(record.applied_price_per_kwh)} ${t("currency")}</td>
                            <td><strong>${formatNumber(record.cost)} ${t("currency")}</strong></td>
                            <td>${record.notes || "—"}</td>
                            <td>${formatDateTime(record.updated_at)}</td>
                            <td>
                                <div class="actions-cell">
                                    <button class="btn btn-secondary btn-small" data-action="edit" data-id="${record.id}">
                                        ${t("edit")}
                                    </button>
                                    <button class="btn btn-danger btn-small" data-action="delete" data-id="${record.id}">
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
            const record = records.find((item) => item.id === id);

            if (!record) {
                return;
            }

            if (action === "edit") {
                fillFormForEdit(record, elements);
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }

            if (action === "delete") {
                const confirmed = window.confirm(`${t("deleteConsumptionConfirm")} ${record.record_date}?`);

                if (!confirmed) {
                    return;
                }

                try {
                    await api.delete(`/consumption/${id}`);
                    showToast(t("consumptionDeleted"), "success");

                    if (editingRecordId === id) {
                        clearForm(elements);
                    }

                    await loadConsumption(root, elements, showToast);
                } catch (error) {
                    showToast(error.message || t("consumptionDeleteError"), "error");
                }
            }
        });
    });
}

async function loadConsumption(root, elements, showToast) {
    try {
        appliances = await api.get("/appliances");
        records = await api.get("/consumption");

        renderApplianceOptions(elements);
        renderRecordsTable(root, elements, showToast);
    } catch (error) {
        showToast(error.message || t("consumptionLoadError"), "error");
    }
}

function getElements(root) {
    return {
        form: root.querySelector("#consumptionForm"),
        formTitle: root.querySelector("#consumptionFormTitle"),
        applianceSelect: root.querySelector("#consumptionApplianceSelect"),
        modeInput: root.querySelector("#consumptionModeInput"),
        dateInput: root.querySelector("#consumptionDateInput"),
        kwhInput: root.querySelector("#consumptionKwhInput"),
        hoursInput: root.querySelector("#consumptionHoursInput"),
        notesInput: root.querySelector("#consumptionNotesInput"),
        submitBtn: root.querySelector("#consumptionSubmitBtn"),
        resetBtn: root.querySelector("#consumptionResetBtn"),
        manualGroup: root.querySelector("#consumptionManualGroup"),
        hoursGroup: root.querySelector("#consumptionHoursGroup"),
        applianceError: root.querySelector("#consumptionApplianceError"),
        dateError: root.querySelector("#consumptionDateError"),
        kwhError: root.querySelector("#consumptionKwhError"),
        hoursError: root.querySelector("#consumptionHoursError")
    };
}

export async function initConsumptionSection({ showToast }) {
    const root = document.getElementById("consumptionRoot");

    root.innerHTML = `
        <div class="section-grid">
            <article class="panel">
                <h3 id="consumptionFormTitle">${t("consumptionNew")}</h3>

                <form id="consumptionForm" class="form-panel" novalidate>
                    <div class="form-group">
                        <label class="form-label" for="consumptionApplianceSelect">${t("appliance")}</label>
                        <select class="form-select" id="consumptionApplianceSelect"></select>
                        <div class="form-error" id="consumptionApplianceError"></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="consumptionModeInput">${t("calculationMode")}</label>
                        <select class="form-select" id="consumptionModeInput">
                            <option value="manual">${t("manualKwh")}</option>
                            <option value="hours">${t("byApplianceHours")}</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="consumptionDateInput">${t("recordDate")}</label>
                        <input class="form-input" id="consumptionDateInput" type="date">
                        <div class="form-error" id="consumptionDateError"></div>
                    </div>

                    <div class="form-group" id="consumptionManualGroup">
                        <label class="form-label" for="consumptionKwhInput">${t("consumptionKwh")}</label>
                        <input class="form-input" id="consumptionKwhInput" type="text" inputmode="decimal" value="3.5">
                        <div class="form-error" id="consumptionKwhError"></div>
                    </div>

                    <div class="form-group hidden" id="consumptionHoursGroup">
                        <label class="form-label" for="consumptionHoursInput">${t("usageHours")}</label>
                        <input class="form-input" id="consumptionHoursInput" type="text" inputmode="decimal" value="2.0">
                        <div class="form-error" id="consumptionHoursError"></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="consumptionNotesInput">${t("notes")}</label>
                        <textarea class="form-input" id="consumptionNotesInput" rows="4"></textarea>
                    </div>

                    <button class="btn btn-primary" id="consumptionSubmitBtn" type="submit">
                        ${t("consumptionAdd")}
                    </button>

                    <button class="btn btn-outline" id="consumptionResetBtn" type="button">
                        ${t("clear")}
                    </button>
                </form>
            </article>

            <article class="panel">
                <h3>${t("consumptionHistory")}</h3>
                <div id="consumptionTableRoot" class="data-list"></div>
            </article>
        </div>
    `;

    const elements = getElements(root);
    currentRoot = root;
    currentElements = elements;
    currentShowToast = showToast;

    if (!appliancesListenerRegistered) {
        appliancesListenerRegistered = true;

        document.addEventListener("appliancesChanged", async () => {
            if (currentRoot && currentElements && currentShowToast) {
                await loadConsumption(currentRoot, currentElements, currentShowToast);
            }
        });
    }

    elements.dateInput.value = todayIso();

    elements.modeInput.addEventListener("change", () => {
        renderModeFields(elements);
    });

    elements.resetBtn.addEventListener("click", () => {
        clearForm(elements);
    });

    elements.form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validateConsumptionForm(elements)) {
            showToast(t("consumptionFormError"), "error");
            return;
        }

        const isManualMode = elements.modeInput.value === "manual";

        const payload = {
            appliance_id: elements.applianceSelect.value ? Number(elements.applianceSelect.value) : null,
            consumption_kwh: isManualMode ? Number(normalizeNumber(elements.kwhInput.value)) : null,
            usage_hours: isManualMode ? null : Number(normalizeNumber(elements.hoursInput.value)),
            record_date: elements.dateInput.value,
            notes: elements.notesInput.value.trim() || null
        };

        try {
            if (editingRecordId) {
                await api.patch(`/consumption/${editingRecordId}`, payload);
                showToast(t("consumptionUpdated"), "success");
            } else {
                await api.post("/consumption", payload);
                showToast(t("consumptionCreated"), "success");
            }

            clearForm(elements);
            await loadConsumption(root, elements, showToast);
        } catch (error) {
            showToast(error.message || t("consumptionSaveError"), "error");
        }
    });

    await loadConsumption(root, elements, showToast);
}