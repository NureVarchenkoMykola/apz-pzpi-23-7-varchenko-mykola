import { api } from "../core/api.js";
import { t, formatDateTime, formatNumber, compareText } from "../core/i18n.js";

let users = [];
let total = 0;

function roleText(role) {
    if (role === "admin") {
        return t("admin");
    }

    return t("user");
}

function statusText(isBlocked) {
    return isBlocked ? t("blocked") : t("notBlocked");
}

function statusBadgeClass(isBlocked) {
    return isBlocked ? "badge-danger" : "badge-success";
}

function getQuery(elements) {
    const params = new URLSearchParams();

    const search = elements.searchInput.value.trim();
    const role = elements.roleSelect.value;
    const status = elements.statusSelect.value;

    if (search) {
        params.set("q", search);
    }

    if (role) {
        params.set("role", role);
    }

    if (status) {
        params.set("is_blocked", status);
    }

    params.set("limit", "200");
    params.set("offset", "0");

    return params.toString();
}

function renderUsers(root, elements, showToast) {
    const tableRoot = root.querySelector("#adminUsersTableRoot");

    users.sort((a, b) => compareText(a.email, b.email));

    if (users.length === 0) {
        tableRoot.innerHTML = `
            <div class="empty-state">
                ${t("noUsersFound")}
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
                        <th>${t("emailAddress")}</th>
                        <th>${t("role")}</th>
                        <th>${t("status")}</th>
                        <th>${t("createdAtShort")}</th>
                        <th>${t("actions")}</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map((user) => `
                        <tr>
                            <td>${formatNumber(user.id)}</td>
                            <td><strong>${user.email}</strong></td>
                            <td>
                                <span class="badge ${user.role === "admin" ? "badge-warning" : "badge-muted"}">
                                    ${roleText(user.role)}
                                </span>
                            </td>
                            <td>
                                <span class="badge ${statusBadgeClass(user.is_blocked)}">
                                    ${statusText(user.is_blocked)}
                                </span>
                            </td>
                            <td>${formatDateTime(user.created_at)}</td>
                            <td>
                                <div class="actions-cell">
                                    <button class="btn btn-secondary btn-small" data-action="role" data-id="${user.id}">
                                        ${user.role === "admin" ? t("makeUser") : t("makeAdmin")}
                                    </button>

                                    <button class="btn ${user.is_blocked ? "btn-secondary" : "btn-danger"} btn-small" data-action="block" data-id="${user.id}">
                                        ${user.is_blocked ? t("unblock") : t("block")}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>

        <div class="muted-box">
            ${t("records")}: ${formatNumber(users.length)} / ${formatNumber(total)}
        </div>
    `;

    tableRoot.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", async () => {
            const id = Number(button.dataset.id);
            const action = button.dataset.action;
            const selectedUser = users.find((item) => item.id === id);

            if (!selectedUser) {
                return;
            }

            if (action === "role") {
                const nextRole = selectedUser.role === "admin" ? "user" : "admin";
                const confirmed = window.confirm(
                    `${t("confirmRoleChange")} "${selectedUser.email}" → ${roleText(nextRole)}?`
                );

                if (!confirmed) {
                    return;
                }

                try {
                    await api.patch(`/admin/users/${id}/role`, {
                        role: nextRole
                    });

                    showToast(t("roleChanged"), "success");
                    await loadUsers(root, elements, showToast);
                } catch (error) {
                    showToast(error.message || t("adminUserUpdateError"), "error");
                }

                return;
            }

            if (action === "block") {
                const nextBlocked = !selectedUser.is_blocked;
                const confirmKey = nextBlocked ? "confirmBlockUser" : "confirmUnblockUser";

                const confirmed = window.confirm(`${t(confirmKey)} "${selectedUser.email}"?`);

                if (!confirmed) {
                    return;
                }

                try {
                    await api.patch(`/admin/users/${id}/block`, {
                        is_blocked: nextBlocked
                    });

                    showToast(nextBlocked ? t("userBlocked") : t("userUnblocked"), "success");
                    await loadUsers(root, elements, showToast);
                } catch (error) {
                    showToast(error.message || t("adminUserUpdateError"), "error");
                }
            }
        });
    });
}

async function loadUsers(root, elements, showToast) {
    try {
        const query = getQuery(elements);
        const response = await api.get(`/admin/users?${query}`);

        users = response.items || [];
        total = response.total || 0;

        renderUsers(root, elements, showToast);
    } catch (error) {
        showToast(error.message || t("adminUsersLoadError"), "error");
    }
}

function getElements(root) {
    return {
        form: root.querySelector("#adminUsersFilterForm"),
        searchInput: root.querySelector("#adminUsersSearchInput"),
        roleSelect: root.querySelector("#adminUsersRoleSelect"),
        statusSelect: root.querySelector("#adminUsersStatusSelect"),
        resetBtn: root.querySelector("#adminUsersResetBtn")
    };
}

export async function initAdminUsersSection({ showToast }) {
    const root = document.getElementById("adminUsersRoot");

    root.innerHTML = `
        <div class="data-list">
            <article class="panel">
                <h3>${t("adminUsers")}</h3>

                <form id="adminUsersFilterForm" class="form-panel" novalidate>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="adminUsersSearchInput">${t("search")}</label>
                            <input class="form-input" id="adminUsersSearchInput" type="search" placeholder="user@mail.com">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="adminUsersRoleSelect">${t("role")}</label>
                            <select class="form-select" id="adminUsersRoleSelect">
                                <option value="">${t("allRoles")}</option>
                                <option value="user">${t("user")}</option>
                                <option value="admin">${t("admin")}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="adminUsersStatusSelect">${t("statusFilter")}</label>
                            <select class="form-select" id="adminUsersStatusSelect">
                                <option value="">${t("allStatuses")}</option>
                                <option value="false">${t("onlyActive")}</option>
                                <option value="true">${t("onlyBlocked")}</option>
                            </select>
                        </div>

                        <button class="btn btn-primary" type="submit">
                            ${t("applyFilters")}
                        </button>
                    </div>

                    <button class="btn btn-outline" id="adminUsersResetBtn" type="button">
                        ${t("resetFilters")}
                    </button>
                </form>
            </article>

            <article class="panel">
                <div id="adminUsersTableRoot"></div>
            </article>
        </div>
    `;

    const elements = getElements(root);

    elements.form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await loadUsers(root, elements, showToast);
    });

    elements.resetBtn.addEventListener("click", async () => {
        elements.searchInput.value = "";
        elements.roleSelect.value = "";
        elements.statusSelect.value = "";
        await loadUsers(root, elements, showToast);
    });

    await loadUsers(root, elements, showToast);
}