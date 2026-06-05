import { api } from "../core/api.js";
import { t, formatDateTime, formatNumber, compareText } from "../core/i18n.js";

let auditLogs = [];
let total = 0;

function formatDetails(details) {
    if (!details) {
        return "—";
    }

    function formatValue(value) {
        if (value === null || value === undefined) {
            return "—";
        }

        if (typeof value === "object" && !Array.isArray(value)) {
            return Object.entries(value)
                .map(([key, nestedValue]) => `${key}: ${nestedValue}`)
                .join(", ");
        }

        if (Array.isArray(value)) {
            return value.join(", ");
        }

        return String(value);
    }

    try {
        const parsed = typeof details === "string" ? JSON.parse(details) : details;

        return Object.entries(parsed)
            .map(([key, value]) => `${key}: ${formatValue(value)}`)
            .join("; ");
    } catch {
        return String(details);
    }
}

function renderAudit(root) {
    const tableRoot = root.querySelector("#adminAuditTableRoot");

    auditLogs.sort((a, b) => compareText(b.created_at, a.created_at));

    if (auditLogs.length === 0) {
        tableRoot.innerHTML = `
            <div class="empty-state">
                ${t("noAuditLogs")}
            </div>
        `;
        return;
    }

    tableRoot.innerHTML = `
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${t("id")}</th>
                        <th>${t("auditAction")}</th>
                        <th>${t("auditAdmin")}</th>
                        <th>${t("auditTarget")}</th>
                        <th>${t("auditDetails")}</th>
                        <th>${t("auditCreatedAt")}</th>
                    </tr>
                </thead>
                <tbody>
                    ${auditLogs.map((log) => `
                        <tr>
                            <td>${formatNumber(log.id)}</td>
                            <td>
                                <span class="badge badge-muted">${log.action}</span>
                            </td>
                            <td>${log.admin?.email || `${t("adminId")}: ${formatNumber(log.admin_id)}`}</td>
                            <td>${log.target_user?.email || log.target_user_id || "—"}</td>
                            <td>${formatDetails(log.details)}</td>
                            <td>${formatDateTime(log.created_at)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>

        <div class="muted-box">
            ${t("records")}: ${formatNumber(auditLogs.length)} / ${formatNumber(total)}
        </div>
    `;
}

async function loadAudit(root, elements, showToast) {
    try {
        const params = new URLSearchParams();

        const adminId = elements.adminIdInput.value.trim();

        if (adminId) {
            params.set("admin_id", adminId);
        }

        params.set("limit", "200");
        params.set("offset", "0");

        const response = await api.get(`/admin/audit-logs?${params.toString()}`);

        auditLogs = response.items || [];
        total = response.total || 0;

        renderAudit(root);
    } catch (error) {
        showToast(error.message || t("adminAuditLoadError"), "error");
    }
}

function getElements(root) {
    return {
        form: root.querySelector("#adminAuditFilterForm"),
        adminIdInput: root.querySelector("#adminAuditAdminIdInput"),
        resetBtn: root.querySelector("#adminAuditResetBtn")
    };
}

export async function initAdminAuditSection({ showToast }) {
    const root = document.getElementById("adminAuditRoot");

    root.innerHTML = `
        <div class="data-list">
            <article class="panel">
                <h3>${t("auditLog")}</h3>

                <form id="adminAuditFilterForm" class="form-panel" novalidate>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="adminAuditAdminIdInput">${t("adminId")}</label>
                            <input class="form-input" id="adminAuditAdminIdInput" type="number" min="1">
                        </div>

                        <button class="btn btn-primary" type="submit">
                            ${t("applyFilters")}
                        </button>

                        <button class="btn btn-outline" id="adminAuditResetBtn" type="button">
                            ${t("resetFilters")}
                        </button>
                    </div>
                </form>
            </article>

            <article class="panel">
                <div id="adminAuditTableRoot"></div>
            </article>
        </div>
    `;

    const elements = getElements(root);

    elements.form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await loadAudit(root, elements, showToast);
    });

    elements.resetBtn.addEventListener("click", async () => {
        elements.adminIdInput.value = "";
        await loadAudit(root, elements, showToast);
    });

    await loadAudit(root, elements, showToast);
}