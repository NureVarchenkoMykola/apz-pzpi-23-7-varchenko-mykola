import { api } from "../core/api.js";
import { t, formatNumber, formatDate } from "../core/i18n.js";
import { currentMonthStartIso, currentMonthEndIso } from "./overview.js";

let limits = [];
let progresses = new Map();
let editingLimitId = null;

function normalizeNumber(value) {
    return value.trim().replace(",", ".");
}

function limitStatusText(progress, limit) {
    const percent = Number(progress?.percent_used || 0);
    const threshold = Number(limit.alert_threshold_percent || 80);

    if (percent >= 100) {
        return t("statusExceeded");
    }

    if (percent >= threshold) {
        return t("statusThreshold");
    }

    return t("statusOk");
}

function limitStatusBadgeClass(progress, limit) {
    const percent = Number(progress?.percent_used || 0);
    const threshold = Number(limit.alert_threshold_percent || 80);

    if (percent >= 100) {
        return "badge-danger";
    }

    if (percent >= threshold) {
        return "badge-warning";
    }

    return "badge-success";
}

function validateLimitForm(elements) {
    let isValid = true;

    elements.limitKwhError.textContent = "";
    elements.periodStartError.textContent = "";
    elements.periodEndError.textContent = "";
    elements.thresholdError.textContent = "";

    const limitKwhValue = elements.limitKwhInput.value.trim();
    const limitKwh = Number(normalizeNumber(limitKwhValue));
    const periodType = elements.periodTypeInput.value;
    const periodStart = elements.periodStartInput.value.trim();
    const periodEnd = elements.periodEndInput.value.trim();
    const thresholdValue = elements.thresholdInput.value.trim();
    const threshold = Number(thresholdValue);

    if (!limitKwhValue) {
        elements.limitKwhError.textContent = t("limitRequired");
        isValid = false;
    } else if (!Number.isFinite(limitKwh) || limitKwh <= 0) {
        elements.limitKwhError.textContent = t("limitInvalid");
        isValid = false;
    }

    if (!periodStart) {
        elements.periodStartError.textContent = t("periodStartRequired");
        isValid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(periodStart)) {
        elements.periodStartError.textContent = t("dateInvalid");
        isValid = false;
    }

    if (periodType === "custom") {
        if (!periodEnd) {
            elements.periodEndError.textContent = t("periodEndRequired");
            isValid = false;
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(periodEnd)) {
            elements.periodEndError.textContent = t("dateInvalid");
            isValid = false;
        } else if (periodStart && periodStart > periodEnd) {
            elements.periodEndError.textContent = t("periodEndBeforeStart");
            isValid = false;
        }
    }

    if (!thresholdValue) {
        elements.thresholdError.textContent = t("thresholdRequired");
        isValid = false;
    } else if (!Number.isInteger(threshold) || threshold < 1 || threshold > 100) {
        elements.thresholdError.textContent = t("thresholdInvalid");
        isValid = false;
    }

    return isValid;
}

function renderPeriodEndField(elements) {
    const isCustom = elements.periodTypeInput.value === "custom";

    elements.periodEndGroup.classList.toggle("hidden", !isCustom);
    elements.periodEndHint.classList.toggle("hidden", isCustom);
    elements.periodEndError.textContent = "";
}

function clearForm(elements) {
    editingLimitId = null;

    elements.formTitle.textContent = t("limitNew");
    elements.submitBtn.textContent = t("limitAdd");

    elements.limitKwhInput.value = "150";
    elements.periodTypeInput.value = "month";
    elements.periodStartInput.value = currentMonthStartIso();
    elements.periodEndInput.value = currentMonthEndIso();
    elements.alertEnabledInput.checked = true;
    elements.thresholdInput.value = "80";

    elements.limitKwhError.textContent = "";
    elements.periodStartError.textContent = "";
    elements.periodEndError.textContent = "";
    elements.thresholdError.textContent = "";

    renderPeriodEndField(elements);
}

function fillFormForEdit(limit, elements) {
    editingLimitId = limit.id;

    elements.formTitle.textContent = t("limitEdit");
    elements.submitBtn.textContent = t("limitSave");

    elements.limitKwhInput.value = limit.limit_kwh;
    elements.periodTypeInput.value = limit.period_type;
    elements.periodStartInput.value = limit.period_start;
    elements.periodEndInput.value = limit.period_end;
    elements.alertEnabledInput.checked = Boolean(limit.alert_enabled);
    elements.thresholdInput.value = String(limit.alert_threshold_percent);

    elements.limitKwhError.textContent = "";
    elements.periodStartError.textContent = "";
    elements.periodEndError.textContent = "";
    elements.thresholdError.textContent = "";

    renderPeriodEndField(elements);
}

function renderLimitsTable(root, elements, showToast) {
    const tableRoot = root.querySelector("#limitsTableRoot");

    if (limits.length === 0) {
        tableRoot.innerHTML = `
            <div class="empty-state">
                ${t("limitsEmpty")}
            </div>
        `;
        return;
    }

    tableRoot.innerHTML = `
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${t("period")}</th>
                        <th>${t("limitKwh")}</th>
                        <th>${t("progress")}</th>
                        <th>${t("threshold")}</th>
                        <th>${t("notifications")}</th>
                        <th>${t("status")}</th>
                        <th>${t("actions")}</th>
                    </tr>
                </thead>
                <tbody>
                    ${limits.map((limit) => {
                        const progress = progresses.get(limit.id);
                        const status = progress ? limitStatusText(progress, limit) : t("limitProgressNotLoaded");
                        const badgeClass = progress ? limitStatusBadgeClass(progress, limit) : "badge-muted";

                        return `
                            <tr>
                                <td>
                                    <strong>${t(limit.period_type) || limit.period_type}</strong><br>
                                    ${formatDate(limit.period_start)} — ${formatDate(limit.period_end)}
                                </td>
                                <td>${formatNumber(limit.limit_kwh)} ${t("kwh")}</td>
                                <td>
                                    ${
                                        progress
                                            ? `${formatNumber(progress.used_kwh)} / ${formatNumber(progress.limit_kwh)} ${t("kwh")}<br>${formatNumber(progress.percent_used ?? 0)}%`
                                            : "—"
                                    }
                                </td>
                                <td>${formatNumber(limit.alert_threshold_percent)}%</td>
                                <td>
                                    <span class="badge ${limit.alert_enabled ? "badge-success" : "badge-muted"}">
                                        ${limit.alert_enabled ? t("enabled") : t("disabled")}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge ${badgeClass}">
                                        ${status}
                                    </span>
                                </td>
                                <td>
                                    <div class="actions-cell">
                                        <button class="btn btn-secondary btn-small" data-action="edit" data-id="${limit.id}">
                                            ${t("edit")}
                                        </button>
                                        <button class="btn btn-danger btn-small" data-action="delete" data-id="${limit.id}">
                                            ${t("delete")}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;

    tableRoot.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", async () => {
            const id = Number(button.dataset.id);
            const action = button.dataset.action;
            const limit = limits.find((item) => item.id === id);

            if (!limit) {
                return;
            }

            if (action === "edit") {
                fillFormForEdit(limit, elements);
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }

            if (action === "delete") {
                const confirmed = window.confirm(
                    `${t("deleteLimitConfirm")} ${t(limit.period_type) || limit.period_type} ${formatDate(limit.period_start)} — ${formatDate(limit.period_end)}?`
                );

                if (!confirmed) {
                    return;
                }

                try {
                    await api.delete(`/limits/${id}`);
                    showToast(t("limitDeleted"), "success");

                    if (editingLimitId === id) {
                        clearForm(elements);
                    }

                    await loadLimits(root, elements, showToast);
                } catch (error) {
                    showToast(error.message || t("limitDeleteError"), "error");
                }
            }
        });
    });
}

async function loadLimitProgresses() {
    progresses = new Map();

    for (const limit of limits) {
        const progress = await api.get(`/limits/${limit.id}/progress`);
        progresses.set(limit.id, progress);
    }
}

async function loadLimits(root, elements, showToast) {
    try {
        limits = await api.get("/limits");
        await loadLimitProgresses();
        renderLimitsTable(root, elements, showToast);
    } catch (error) {
        showToast(error.message || t("limitLoadError"), "error");
    }
}

function getElements(root) {
    return {
        form: root.querySelector("#limitForm"),
        formTitle: root.querySelector("#limitFormTitle"),
        limitKwhInput: root.querySelector("#limitKwhInput"),
        periodTypeInput: root.querySelector("#limitPeriodTypeInput"),
        periodStartInput: root.querySelector("#limitPeriodStartInput"),
        periodEndInput: root.querySelector("#limitPeriodEndInput"),
        periodEndGroup: root.querySelector("#limitPeriodEndGroup"),
        periodEndHint: root.querySelector("#limitPeriodEndHint"),
        alertEnabledInput: root.querySelector("#limitAlertEnabledInput"),
        thresholdInput: root.querySelector("#limitThresholdInput"),
        submitBtn: root.querySelector("#limitSubmitBtn"),
        resetBtn: root.querySelector("#limitResetBtn"),
        limitKwhError: root.querySelector("#limitKwhError"),
        periodStartError: root.querySelector("#limitPeriodStartError"),
        periodEndError: root.querySelector("#limitPeriodEndError"),
        thresholdError: root.querySelector("#limitThresholdError")
    };
}

export async function initLimitsSection({ showToast }) {
    const root = document.getElementById("limitsRoot");

    root.innerHTML = `
        <div class="section-grid">
            <article class="panel">
                <h3 id="limitFormTitle">${t("limitNew")}</h3>

                <form id="limitForm" class="form-panel" novalidate>
                    <div class="form-group">
                        <label class="form-label" for="limitKwhInput">${t("limitKwh")}</label>
                        <input class="form-input" id="limitKwhInput" type="text" inputmode="decimal" value="150">
                        <div class="form-error" id="limitKwhError"></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="limitPeriodTypeInput">${t("periodType")}</label>
                        <select class="form-select" id="limitPeriodTypeInput">
                            <option value="week">${t("week")}</option>
                            <option value="month" selected>${t("month")}</option>
                            <option value="year">${t("year")}</option>
                            <option value="custom">${t("customPeriod")}</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="limitPeriodStartInput">${t("periodStart")}</label>
                        <input class="form-input" id="limitPeriodStartInput" type="date">
                        <div class="form-error" id="limitPeriodStartError"></div>
                    </div>

                    <div class="form-group hidden" id="limitPeriodEndGroup">
                        <label class="form-label" for="limitPeriodEndInput">${t("periodEnd")}</label>
                        <input class="form-input" id="limitPeriodEndInput" type="date">
                        <div class="form-error" id="limitPeriodEndError"></div>
                    </div>

                    <div class="muted-box" id="limitPeriodEndHint">
                        ${t("periodEndAutoHint")}
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="limitThresholdInput">${t("alertThreshold")}</label>
                        <input class="form-input" id="limitThresholdInput" type="number" min="1" max="100" value="80">
                        <div class="form-error" id="limitThresholdError"></div>
                    </div>

                    <label class="checkbox-row">
                        <span>${t("showOnHome")}</span>
                        <input id="limitAlertEnabledInput" type="checkbox" checked>
                    </label>

                    <button class="btn btn-primary" id="limitSubmitBtn" type="submit">
                        ${t("limitAdd")}
                    </button>

                    <button class="btn btn-outline" id="limitResetBtn" type="button">
                        ${t("clear")}
                    </button>
                </form>
            </article>

            <article class="panel">
                <h3>${t("limitState")}</h3>
                <div id="limitsTableRoot" class="data-list"></div>
            </article>
        </div>
    `;

    const elements = getElements(root);

    elements.periodStartInput.value = currentMonthStartIso();
    elements.periodEndInput.value = currentMonthEndIso();

    elements.periodTypeInput.addEventListener("change", () => {
        renderPeriodEndField(elements);
    });

    elements.resetBtn.addEventListener("click", () => {
        clearForm(elements);
    });

    elements.form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validateLimitForm(elements)) {
            showToast(t("limitFormError"), "error");
            return;
        }

        const isCustom = elements.periodTypeInput.value === "custom";

        const payload = {
            limit_kwh: Number(normalizeNumber(elements.limitKwhInput.value)),
            period_type: elements.periodTypeInput.value,
            period_start: elements.periodStartInput.value,
            alert_enabled: elements.alertEnabledInput.checked,
            alert_threshold_percent: Number(elements.thresholdInput.value)
        };

        if (isCustom) {
            payload.period_end = elements.periodEndInput.value;
        }

        try {
            if (editingLimitId) {
                await api.patch(`/limits/${editingLimitId}`, payload);
                showToast(t("limitUpdated"), "success");
            } else {
                await api.post("/limits", payload);
                showToast(t("limitCreated"), "success");
            }

            clearForm(elements);
            await loadLimits(root, elements, showToast);
        } catch (error) {
            showToast(error.message || t("limitSaveError"), "error");
        }
    });

    renderPeriodEndField(elements);
    await loadLimits(root, elements, showToast);
}