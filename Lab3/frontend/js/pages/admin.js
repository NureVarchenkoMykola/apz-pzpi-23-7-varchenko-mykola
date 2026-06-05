import { requireRole, logout } from "../core/authGuard.js";
import { applyTranslations, getLanguage, setLanguage, t } from "../core/i18n.js";
import { initAdminStatsSection } from "../admin/stats.js";
import { initAdminUsersSection } from "../admin/users.js";
import { initAdminAuditSection } from "../admin/audit.js";
import { initAdminDataSection } from "../admin/data.js";

const pageTitle = document.getElementById("pageTitle");
const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const languageSelect = document.getElementById("languageSelect");
const toast = document.getElementById("toast");

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
        overview: "adminOverview",
        users: "adminUsers",
        audit: "adminAudit",
        data: "adminData"
    };

    return t(keys[sectionName] || "adminOverview");
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

async function refreshCurrentSection() {
    if (activeSection === "overview") {
        await initAdminStatsSection({ showToast });
    }

    if (activeSection === "users") {
        await initAdminUsersSection({ showToast });
    }

    if (activeSection === "audit") {
        await initAdminAuditSection({ showToast });
    }

    if (activeSection === "data") {
        await initAdminDataSection({ showToast });
    }
}

async function updateLanguage(language) {
    setLanguage(language);
    applyTranslations();
    setActiveSection(activeSection);

    await initAdminStatsSection({ showToast });
    await initAdminUsersSection({ showToast });
    await initAdminAuditSection({ showToast });
    await initAdminDataSection({ showToast });

    applyTranslations();
}

navButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setActiveSection(button.dataset.section);
    });
});

logoutBtn.addEventListener("click", logout);

refreshBtn.addEventListener("click", async () => {
    await refreshCurrentSection();
    showToast(t("dataUpdated"), "success");
});

languageSelect.value = getLanguage();

languageSelect.addEventListener("change", async () => {
    await updateLanguage(languageSelect.value);
});

applyTranslations();

const currentUser = await requireRole("admin");

if (currentUser) {
    setActiveSection("overview");
    await initAdminStatsSection({ showToast });
    await initAdminUsersSection({ showToast });
    await initAdminAuditSection({ showToast });
    await initAdminDataSection({ showToast });
    applyTranslations();
}