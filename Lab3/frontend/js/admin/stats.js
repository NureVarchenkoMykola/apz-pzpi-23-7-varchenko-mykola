import { api } from "../core/api.js";
import { t, formatNumber } from "../core/i18n.js";

let stats = null;

function renderStats(root) {
    if (!stats) {
        root.innerHTML = `
            <div class="empty-state">
                ${t("noData")}
            </div>
        `;
        return;
    }

    root.innerHTML = `
        <div class="stats-grid">
            <article class="stat-card">
                <span>${t("accountsTotal")}</span>
                <strong>${formatNumber(stats.accounts_total)}</strong>
            </article>

            <article class="stat-card">
                <span>${t("accountsBlocked")}</span>
                <strong>${formatNumber(stats.accounts_blocked_total)}</strong>
            </article>

            <article class="stat-card">
                <span>${t("usersTotal")}</span>
                <strong>${formatNumber(stats.users_total)}</strong>
            </article>

            <article class="stat-card">
                <span>${t("usersBlocked")}</span>
                <strong>${formatNumber(stats.users_blocked_total)}</strong>
            </article>

            <article class="stat-card">
                <span>${t("adminsTotal")}</span>
                <strong>${formatNumber(stats.admins_total)}</strong>
            </article>

            <article class="stat-card">
                <span>${t("adminsBlocked")}</span>
                <strong>${formatNumber(stats.admins_blocked_total)}</strong>
            </article>
        </div>
    `;
}

export async function initAdminStatsSection({ showToast }) {
    const root = document.getElementById("adminStatsRoot");

    try {
        stats = await api.get("/admin/stats");
        renderStats(root);
    } catch (error) {
        root.innerHTML = `
            <div class="empty-state">
                ${error.message || t("adminStatsLoadError")}
            </div>
        `;
        showToast(error.message || t("adminStatsLoadError"), "error");
    }
}