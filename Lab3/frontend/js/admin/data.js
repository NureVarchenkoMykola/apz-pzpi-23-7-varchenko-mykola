import { api } from "../core/api.js";
import { t, formatDateTime, formatNumber } from "../core/i18n.js";

let settings = {};
let backups = [];

function downloadJson(data, fileName) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
}

function readJsonFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            try {
                resolve(JSON.parse(String(reader.result)));
            } catch {
                reject(new Error(t("importLoadError")));
            }
        };

        reader.onerror = () => {
            reject(new Error(t("importLoadError")));
        };

        reader.readAsText(file);
    });
}

function renderSettings(elements) {
    elements.siteNameInput.value = settings.site_name || "Energy Monitor";
    elements.languageSelect.value = settings.default_language || "uk";
    elements.currencyInput.value = settings.default_currency || "UAH";
    elements.allowRegistrationInput.checked = settings.allow_registration !== false;
    elements.retentionInput.value = settings.backup_retention_days ?? 30;
}

function renderBackups(root, showToast) {
    const backupsRoot = root.querySelector("#adminBackupsRoot");

    if (backups.length === 0) {
        backupsRoot.innerHTML = `
            <div class="empty-state">
                ${t("backupListEmpty")}
            </div>
        `;
        return;
    }

    backupsRoot.innerHTML = `
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${t("fileName")}</th>
                        <th>${t("fileSize")}</th>
                        <th>${t("created")}</th>
                        <th>${t("actions")}</th>
                    </tr>
                </thead>
                <tbody>
                    ${backups.map((backup) => `
                        <tr>
                            <td><strong>${backup.file}</strong></td>
                            <td>${formatNumber(backup.size_bytes)} ${t("bytes")}</td>
                            <td>${formatDateTime(backup.created_at)}</td>
                            <td>
                                <div class="actions-cell">
                                    <button class="btn btn-secondary btn-small" data-file="${backup.file}">
                                        ${t("download")}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;

    backupsRoot.querySelectorAll("[data-file]").forEach((button) => {
        button.addEventListener("click", async () => {
            const file = button.dataset.file;

            try {
                await api.download(
                    `/admin/data/backups/${encodeURIComponent(file)}`,
                    file
                );
            } catch (error) {
                showToast(error.message || t("backupLoadError"), "error");
            }
        });
    });
}

async function loadSettings(elements, showToast) {
    try {
        settings = await api.get("/admin/data/settings");
        renderSettings(elements);
    } catch (error) {
        showToast(error.message || t("settingsLoadError"), "error");
    }
}

async function loadBackups(root, showToast) {
    try {
        backups = await api.get("/admin/data/backups");
        renderBackups(root, showToast);
    } catch (error) {
        showToast(error.message || t("backupLoadError"), "error");
    }
}

function getElements(root) {
    return {
        settingsForm: root.querySelector("#adminSettingsForm"),
        siteNameInput: root.querySelector("#settingSiteNameInput"),
        languageSelect: root.querySelector("#settingLanguageSelect"),
        currencyInput: root.querySelector("#settingCurrencyInput"),
        allowRegistrationInput: root.querySelector("#settingAllowRegistrationInput"),
        retentionInput: root.querySelector("#settingRetentionInput"),

        exportBtn: root.querySelector("#adminExportBtn"),

        importForm: root.querySelector("#adminImportForm"),
        importModeSelect: root.querySelector("#adminImportModeSelect"),
        importFileInput: root.querySelector("#adminImportFileInput"),

        createBackupBtn: root.querySelector("#adminCreateBackupBtn")
    };
}

export async function initAdminDataSection({ showToast }) {
    const root = document.getElementById("adminDataRoot");

    root.innerHTML = `
        <div class="data-list">
            <article class="panel">
                <h3>${t("systemSettings")}</h3>

                <form id="adminSettingsForm" class="form-panel" novalidate>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="settingSiteNameInput">${t("siteName")}</label>
                            <input class="form-input" id="settingSiteNameInput" type="text">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="settingLanguageSelect">${t("defaultLanguage")}</label>
                            <select class="form-select" id="settingLanguageSelect">
                                <option value="uk">${t("uk")}</option>
                                <option value="en">${t("en")}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="settingCurrencyInput">${t("defaultCurrency")}</label>
                            <input class="form-input" id="settingCurrencyInput" type="text">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="settingRetentionInput">${t("backupRetentionDays")}</label>
                            <input class="form-input" id="settingRetentionInput" type="number" min="1">
                        </div>
                    </div>

                    <label class="checkbox-row">
                        <span>${t("allowRegistration")}</span>
                        <input id="settingAllowRegistrationInput" type="checkbox">
                    </label>

                    <button class="btn btn-primary" type="submit">
                        ${t("saveSettings")}
                    </button>
                </form>
            </article>

            <article class="panel">
                <h3>${t("dataExport")}</h3>
                <p class="muted-box">${t("dataExportDescription")}</p>

                <button class="btn btn-secondary" id="adminExportBtn" type="button">
                    ${t("exportJson")}
                </button>
            </article>

            <article class="panel">
                <h3>${t("dataImport")}</h3>
                <p class="muted-box">${t("dataImportDescription")}</p>
                <p class="muted-box">${t("importWarning")}</p>

                <form id="adminImportForm" class="form-panel" novalidate>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="adminImportModeSelect">${t("importMode")}</label>
                            <select class="form-select" id="adminImportModeSelect">
                                <option value="merge">${t("mergeMode")}</option>
                                <option value="replace">${t("replaceMode")}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="adminImportFileInput">${t("selectJsonFile")}</label>
                            <input class="form-input" id="adminImportFileInput" type="file" accept="application/json,.json">
                        </div>

                        <button class="btn btn-primary" type="submit">
                            ${t("importJson")}
                        </button>
                    </div>
                </form>
            </article>

            <article class="panel">
                <h3>${t("backups")}</h3>

                <button class="btn btn-primary" id="adminCreateBackupBtn" type="button">
                    ${t("createBackup")}
                </button>

                <div id="adminBackupsRoot" class="data-list"></div>
            </article>
        </div>
    `;

    const elements = getElements(root);

    elements.settingsForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = {
            site_name: elements.siteNameInput.value.trim() || "Energy Monitor",
            default_language: elements.languageSelect.value,
            default_currency: elements.currencyInput.value.trim() || "UAH",
            allow_registration: elements.allowRegistrationInput.checked,
            backup_retention_days: Number(elements.retentionInput.value || 30)
        };

        try {
            settings = await api.patch("/admin/data/settings", payload);
            renderSettings(elements);
            showToast(t("settingsSaved"), "success");
        } catch (error) {
            showToast(error.message || t("settingsSaveError"), "error");
        }
    });

    elements.exportBtn.addEventListener("click", async () => {
        try {
            const payload = await api.get("/admin/data/export");
            const timestamp = new Date().toISOString().replace(/:/g, "-");
            downloadJson(payload, `energy-monitor-export-${timestamp}.json`);
            showToast(t("exportCompleted"), "success");
        } catch (error) {
            showToast(error.message || t("reportLoadError"), "error");
        }
    });

    elements.importForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const file = elements.importFileInput.files[0];

        if (!file) {
            showToast(t("importFileRequired"), "error");
            return;
        }

        try {
            const payload = await readJsonFile(file);
            payload.mode = elements.importModeSelect.value;

            await api.post("/admin/data/import", payload);

            showToast(t("importCompleted"), "success");

            elements.importFileInput.value = "";

            await loadSettings(elements, showToast);
            await loadBackups(root, showToast);
        } catch (error) {
            showToast(error.message || t("importError"), "error");
        }
    });

    elements.createBackupBtn.addEventListener("click", async () => {
        try {
            await api.post("/admin/data/backups", {});
            showToast(t("backupCreated"), "success");
            await loadBackups(root, showToast);
        } catch (error) {
            showToast(error.message || t("backupCreateError"), "error");
        }
    });

    await loadSettings(elements, showToast);
    await loadBackups(root, showToast);
}