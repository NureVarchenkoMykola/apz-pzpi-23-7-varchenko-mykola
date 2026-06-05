import { api } from "../core/api.js";
import { requireRole, logout } from "../core/authGuard.js";
import { applyTranslations, getLanguage, setLanguage, t, formatNumber, formatDate } from "../core/i18n.js";
import { currentMonthStartIso, currentMonthEndIso } from "../user/overview.js";
import { initTariffsSection } from "../user/tariffs.js";
import { initAppliancesSection } from "../user/appliances.js";
import { initConsumptionSection } from "../user/consumption.js";
import { initLimitsSection } from "../user/limits.js";
import { initReportsSection } from "../user/reports.js";

const pageTitle = document.getElementById("pageTitle");
const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const languageSelect = document.getElementById("languageSelect");
const toast = document.getElementById("toast");

const statTariffs = document.getElementById("statTariffs");
const statAppliances = document.getElementById("statAppliances");
const statRecords = document.getElementById("statRecords");
const statLimits = document.getElementById("statLimits");
const summaryBox = document.getElementById("summaryBox");
const alertsBox = document.getElementById("alertsBox");

let activeSection = "overview";

function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = "toast";
    }, 3200);
}

function sectionTitle(sectionName) {
    const keys = {
        overview: "overview",
        tariffs: "tariffs",
        appliances: "appliances",
        consumption: "consumption",
        limits: "limits",
        reports: "reports"
    };

    return t(keys[sectionName] || "overview");
}

function setActiveSection(sectionName) {
    activeSection = sectionName;

    navButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.section === sectionName);
    });

    sections.forEach((section) => {
        section.classList.remove("active");
    });

    const target = document.getElementById(`${sectionName}Section`);

    if (target) {
        target.classList.add("active");
    }

    pageTitle.textContent = sectionTitle(sectionName);
}

function renderSummary(summary) {
    if (!summary) {
        summaryBox.textContent = t("noData");
        return;
    }

    summaryBox.innerHTML = `
        <div class="data-list">
            <div class="data-item">
                <strong>${t("period")}</strong>
                ${formatDate(summary.period.date_from)} — ${formatDate(summary.period.date_to)}
            </div>
            <div class="data-item">
                <strong>${t("totalConsumption")}</strong>
                ${formatNumber(summary.totals.total_kwh)} ${t("kwh")}
            </div>
            <div class="data-item">
                <strong>${t("cost")}</strong>
                ${formatNumber(summary.totals.total_cost)} ${t("currency")}
            </div>
            <div class="data-item">
                <strong>${t("records")}</strong>
                ${formatNumber(summary.totals.records_count)}
            </div>
        </div>
    `;
}

function renderAlerts(progresses) {
    const warnings = progresses.filter((item) => {
        return item.alert_enabled && (item.threshold_reached || item.limit_exceeded);
    });

    if (progresses.length === 0) {
        alertsBox.textContent = t("noLimits");
        return;
    }

    if (warnings.length === 0) {
        alertsBox.textContent = t("noActiveAlerts");
        return;
    }

    alertsBox.innerHTML = warnings.map((item) => {
        const status = item.limit_exceeded
            ? t("limitExceeded")
            : `${t("thresholdReached")} ${item.alert_threshold_percent}%`;

        return `
            <div class="data-item">
                <strong>${status}</strong>
                ${formatNumber(item.used_kwh)} / ${formatNumber(item.limit_kwh)} ${t("kwh")}<br>
                ${formatDate(item.period_start)} — ${formatDate(item.period_end)}
            </div>
        `;
    }).join("");
}

async function loadLimitProgresses(limits) {
    const progresses = [];

    for (const limit of limits) {
        const progress = await api.get(`/limits/${limit.id}/progress`);
        progresses.push(progress);
    }

    return progresses;
}

async function loadOverview() {
    try {
        const [tariffs, appliances, records, limits, summary] = await Promise.all([
            api.get("/tariffs"),
            api.get("/appliances"),
            api.get("/consumption"),
            api.get("/limits"),
            api.get(`/reports/summary?date_from=${currentMonthStartIso()}&date_to=${currentMonthEndIso()}`)
        ]);

        statTariffs.textContent = formatNumber(tariffs.length);
        statAppliances.textContent = formatNumber(appliances.length);
        statRecords.textContent = formatNumber(records.length);
        statLimits.textContent = formatNumber(limits.length);

        renderSummary(summary);

        const progresses = await loadLimitProgresses(limits);
        renderAlerts(progresses);
    } catch (error) {
        showToast(error.message || t("overviewLoadError"), "error");
    }
}

async function updateLanguage(language) {
    setLanguage(language);
    applyTranslations();
    setActiveSection(activeSection);

    await initTariffsSection({ showToast });
    await initAppliancesSection({ showToast });
    await initConsumptionSection({ showToast });
    await initLimitsSection({ showToast });
    await initReportsSection({ showToast });

    applyTranslations();
    loadOverview();
}

navButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setActiveSection(button.dataset.section);
    });
});

logoutBtn.addEventListener("click", logout);

refreshBtn.addEventListener("click", () => {
    loadOverview();
});

languageSelect.value = getLanguage();

languageSelect.addEventListener("change", async () => {
    await updateLanguage(languageSelect.value);
});

applyTranslations();

const currentUser = await requireRole("user");

if (currentUser) {
    setActiveSection("overview");
    await initTariffsSection({ showToast });
    await initAppliancesSection({ showToast });
    await initConsumptionSection({ showToast });
    await initLimitsSection({ showToast });
    await initReportsSection({ showToast });
    applyTranslations();
    loadOverview();
}