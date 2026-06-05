import { api } from "../core/api.js";
import { t, formatDate, formatNumber } from "../core/i18n.js";
import { currentMonthStartIso, currentMonthEndIso } from "./overview.js";

let summaryReport = null;
let dailyReport = [];
let applianceReport = [];
let limitsReport = null;

function validateReportsForm(elements) {
    let isValid = true;

    elements.dateFromError.textContent = "";
    elements.dateToError.textContent = "";

    const dateFrom = elements.dateFromInput.value.trim();
    const dateTo = elements.dateToInput.value.trim();

    if (!dateFrom) {
        elements.dateFromError.textContent = t("dateFromRequired");
        isValid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
        elements.dateFromError.textContent = t("dateInvalid");
        isValid = false;
    }

    if (!dateTo) {
        elements.dateToError.textContent = t("dateRequired");
        isValid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
        elements.dateToError.textContent = t("dateInvalid");
        isValid = false;
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
        elements.dateToError.textContent = t("dateToBeforeFrom");
        isValid = false;
    }

    return isValid;
}

function limitStatusText(status) {
    if (status === "ok") {
        return t("statusOk");
    }

    if (status === "threshold_reached") {
        return t("statusThreshold");
    }

    if (status === "limit_exceeded") {
        return t("statusExceeded");
    }

    return status || "—";
}

function limitStatusBadgeClass(status) {
    if (status === "limit_exceeded") {
        return "badge-danger";
    }

    if (status === "threshold_reached") {
        return "badge-warning";
    }

    if (status === "ok") {
        return "badge-success";
    }

    return "badge-muted";
}

function renderSummary(root) {
    const summaryRoot = root.querySelector("#reportsSummaryRoot");

    if (!summaryReport) {
        summaryRoot.innerHTML = `
            <div class="empty-state">
                ${t("summaryReportNotLoaded")}
            </div>
        `;
        return;
    }

    const maxDayHtml = summaryReport.max_day
        ? `
            <div class="data-item">
                <strong>${t("maxDay")}</strong>
                ${formatDate(summaryReport.max_day.date)}:
                ${formatNumber(summaryReport.max_day.kwh)} ${t("kwh")},
                ${formatNumber(summaryReport.max_day.cost)} ${t("currency")}
            </div>
        `
        : `
            <div class="data-item">
                <strong>${t("maxDay")}</strong>
                ${t("noData")}
            </div>
        `;

    summaryRoot.innerHTML = `
        <div class="stats-grid">
            <article class="stat-card">
                <span>${t("totalConsumption")}</span>
                <strong>${formatNumber(summaryReport.totals.total_kwh)}</strong>
                <p>${t("kwh")}</p>
            </article>

            <article class="stat-card">
                <span>${t("cost")}</span>
                <strong>${formatNumber(summaryReport.totals.total_cost)}</strong>
                <p>${t("currency")}</p>
            </article>

            <article class="stat-card">
                <span>${t("records")}</span>
                <strong>${formatNumber(summaryReport.totals.records_count)}</strong>
                <p>${t("period")}</p>
            </article>

            <article class="stat-card">
                <span>${t("averagePerDay")}</span>
                <strong>${formatNumber(summaryReport.averages.kwh_per_day)}</strong>
                <p>${t("kwh")}</p>
            </article>
        </div>

        <div class="data-list">
            <div class="data-item">
                <strong>${t("period")}</strong>
                ${formatDate(summaryReport.period.date_from)} — ${formatDate(summaryReport.period.date_to)},
                ${t("days")}: ${formatNumber(summaryReport.period.days)}
            </div>

            <div class="data-item">
                <strong>${t("averageCostPerDay")}</strong>
                ${formatNumber(summaryReport.averages.cost_per_day)} ${t("currency")}
            </div>

            <div class="data-item">
                <strong>${t("averageKwhPerRecord")}</strong>
                ${formatNumber(summaryReport.averages.kwh_per_record)} ${t("kwh")}
            </div>

            <div class="data-item">
                <strong>${t("averageCostPerRecord")}</strong>
                ${formatNumber(summaryReport.averages.cost_per_record)} ${t("currency")}
            </div>

            ${maxDayHtml}
        </div>
    `;
}

function renderDailyReport(root) {
    const dailyRoot = root.querySelector("#reportsDailyRoot");

    if (dailyReport.length === 0) {
        dailyRoot.innerHTML = `
            <div class="empty-state">
                ${t("dailyReportEmpty")}
            </div>
        `;
        return;
    }

    dailyRoot.innerHTML = `
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${t("recordDate")}</th>
                        <th>${t("totalConsumption")}</th>
                        <th>${t("cost")}</th>
                        <th>${t("records")}</th>
                    </tr>
                </thead>
                <tbody>
                    ${dailyReport.map((item) => `
                        <tr>
                            <td><strong>${formatDate(item.record_date)}</strong></td>
                            <td>${formatNumber(item.total_kwh)} ${t("kwh")}</td>
                            <td>${formatNumber(item.total_cost)} ${t("currency")}</td>
                            <td>${formatNumber(item.records_count)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderApplianceReport(root) {
    const applianceRoot = root.querySelector("#reportsApplianceRoot");

    if (applianceReport.length === 0) {
        applianceRoot.innerHTML = `
            <div class="empty-state">
                ${t("applianceReportEmpty")}
            </div>
        `;
        return;
    }

    applianceRoot.innerHTML = `
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${t("appliance")}</th>
                        <th>${t("totalConsumption")}</th>
                        <th>${t("cost")}</th>
                        <th>${t("records")}</th>
                    </tr>
                </thead>
                <tbody>
                    ${applianceReport.map((item) => `
                        <tr>
                            <td><strong>${item.appliance_name || t("withoutAppliance")}</strong></td>
                            <td>${formatNumber(item.total_kwh)} ${t("kwh")}</td>
                            <td>${formatNumber(item.total_cost)} ${t("currency")}</td>
                            <td>${formatNumber(item.records_count)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderLimitsReport(root) {
    const limitsRoot = root.querySelector("#reportsLimitsRoot");

    if (!limitsReport) {
        limitsRoot.innerHTML = `
            <div class="empty-state">
                ${t("limitsReportNotLoaded")}
            </div>
        `;
        return;
    }

    const itemsHtml = limitsReport.items.length === 0
        ? `
            <div class="empty-state">
                ${t("limitsReportEmpty")}
            </div>
        `
        : `
            <div class="table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>${t("period")}</th>
                            <th>${t("limitKwh")}</th>
                            <th>${t("used")}</th>
                            <th>${t("remaining")}</th>
                            <th>${t("threshold")}</th>
                            <th>${t("status")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${limitsReport.items.map((item) => `
                            <tr>
                                <td>
                                    <strong>${t(item.period_type) || item.period_type}</strong><br>
                                    ${formatDate(item.period_start)} — ${formatDate(item.period_end)}
                                </td>
                                <td>${formatNumber(item.limit_kwh)} ${t("kwh")}</td>
                                <td>${formatNumber(item.used_kwh)} ${t("kwh")}<br>${formatNumber(item.percent_used)}%</td>
                                <td>${formatNumber(item.remaining_kwh)} ${t("kwh")}</td>
                                <td>${formatNumber(item.alert_threshold_percent)}%</td>
                                <td>
                                    <span class="badge ${limitStatusBadgeClass(item.status)}">
                                        ${limitStatusText(item.status)}
                                    </span>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;

    limitsRoot.innerHTML = `
        <div class="stats-grid">
            <article class="stat-card">
                <span>${t("limits")}</span>
                <strong>${formatNumber(limitsReport.totals.limits_count)}</strong>
            </article>

            <article class="stat-card">
                <span>${t("statusOk")}</span>
                <strong>${formatNumber(limitsReport.totals.ok_count)}</strong>
            </article>

            <article class="stat-card">
                <span>${t("thresholdReached")}</span>
                <strong>${formatNumber(limitsReport.totals.threshold_reached_count)}</strong>
            </article>

            <article class="stat-card">
                <span>${t("limitExceeded")}</span>
                <strong>${formatNumber(limitsReport.totals.limit_exceeded_count)}</strong>
            </article>
        </div>

        <div class="data-list">
            <div class="data-item">
                <strong>${t("totalLimit")}</strong>
                ${formatNumber(limitsReport.totals.total_limit_kwh)} ${t("kwh")}
            </div>

            <div class="data-item">
                <strong>${t("totalUsed")}</strong>
                ${formatNumber(limitsReport.totals.total_used_kwh)} ${t("kwh")}
            </div>
        </div>

        ${itemsHtml}
    `;
}

function renderReports(root) {
    renderSummary(root);
    renderDailyReport(root);
    renderApplianceReport(root);
    renderLimitsReport(root);
}

async function loadReports(root, elements, showToast) {
    if (!validateReportsForm(elements)) {
        showToast(t("reportPeriodError"), "error");
        return;
    }

    const dateFrom = elements.dateFromInput.value;
    const dateTo = elements.dateToInput.value;

    try {
        elements.submitBtn.disabled = true;
        elements.submitBtn.textContent = t("loading");

        const query = `date_from=${encodeURIComponent(dateFrom)}&date_to=${encodeURIComponent(dateTo)}`;

        const [summary, daily, byAppliance, limits] = await Promise.all([
            api.get(`/reports/summary?${query}`),
            api.get(`/reports/daily?${query}`),
            api.get(`/reports/by-appliance?${query}`),
            api.get(`/reports/limits?${query}`)
        ]);

        summaryReport = summary;
        dailyReport = daily;
        applianceReport = byAppliance;
        limitsReport = limits;

        renderReports(root);
        showToast(t("reportUpdated"), "success");
    } catch (error) {
        showToast(error.message || t("reportLoadError"), "error");
    } finally {
        elements.submitBtn.disabled = false;
        elements.submitBtn.textContent = t("generateReports");
    }
}

function getElements(root) {
    return {
        form: root.querySelector("#reportsForm"),
        dateFromInput: root.querySelector("#reportsDateFromInput"),
        dateToInput: root.querySelector("#reportsDateToInput"),
        submitBtn: root.querySelector("#reportsSubmitBtn"),
        dateFromError: root.querySelector("#reportsDateFromError"),
        dateToError: root.querySelector("#reportsDateToError")
    };
}

export async function initReportsSection({ showToast }) {
    const root = document.getElementById("reportsRoot");

    root.innerHTML = `
        <div class="reports-layout">
            <article class="panel">
                <h3>${t("reportPeriod")}</h3>

                <form id="reportsForm" class="form-panel" novalidate>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="reportsDateFromInput">${t("dateFrom")}</label>
                            <input class="form-input" id="reportsDateFromInput" type="date">
                            <div class="form-error" id="reportsDateFromError"></div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="reportsDateToInput">${t("dateTo")}</label>
                            <input class="form-input" id="reportsDateToInput" type="date">
                            <div class="form-error" id="reportsDateToError"></div>
                        </div>
                    </div>

                    <button class="btn btn-primary" id="reportsSubmitBtn" type="submit">
                        ${t("generateReports")}
                    </button>
                </form>
            </article>

            <article class="panel">
                <h3>${t("summary")}</h3>
                <div id="reportsSummaryRoot" class="reports-block"></div>
            </article>

            <article class="panel">
                <h3>${t("dailyReport")}</h3>
                <div id="reportsDailyRoot" class="reports-block"></div>
            </article>

            <article class="panel">
                <h3>${t("reportByAppliances")}</h3>
                <div id="reportsApplianceRoot" class="reports-block"></div>
            </article>

            <article class="panel">
                <h3>${t("reportByLimits")}</h3>
                <div id="reportsLimitsRoot" class="reports-block"></div>
            </article>
        </div>
    `;

    const elements = getElements(root);

    elements.dateFromInput.value = currentMonthStartIso();
    elements.dateToInput.value = currentMonthEndIso();

    elements.form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await loadReports(root, elements, showToast);
    });

    await loadReports(root, elements, showToast);
}