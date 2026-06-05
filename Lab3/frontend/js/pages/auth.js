import { api } from "../core/api.js";
import { saveToken } from "../core/storage.js";
import { redirectIfAlreadyLoggedIn } from "../core/authGuard.js";
import { applyTranslations, getLanguage, setLanguage, t } from "../core/i18n.js";

const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const submitBtn = document.getElementById("submitBtn");
const toggleModeBtn = document.getElementById("toggleModeBtn");
const languageSelect = document.getElementById("languageSelect");
const toast = document.getElementById("toast");

let isRegisterMode = false;

function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = "toast";
    }, 3200);
}

function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    toggleModeBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "..." : (isRegisterMode ? t("register") : t("login"));
}

function clearErrors() {
    emailError.textContent = "";
    passwordError.textContent = "";
}

function validateForm() {
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let isValid = true;

    if (!email) {
        emailError.textContent = t("requiredEmail");
        isValid = false;
    } else if (!email.includes("@") || !email.includes(".")) {
        emailError.textContent = t("invalidEmail");
        isValid = false;
    }

    if (!password) {
        passwordError.textContent = t("requiredPassword");
        isValid = false;
    } else if (password.length < 6) {
        passwordError.textContent = t("shortPassword");
        isValid = false;
    }

    return isValid;
}

function renderMode() {
    authTitle.textContent = isRegisterMode ? t("registerTitle") : t("loginTitle");
    submitBtn.textContent = isRegisterMode ? t("register") : t("login");
    toggleModeBtn.textContent = isRegisterMode ? t("hasAccount") : t("noAccount");

    passwordInput.setAttribute(
        "autocomplete",
        isRegisterMode ? "new-password" : "current-password"
    );

    clearErrors();
}

async function routeByRole() {
    const user = await api.get("/auth/me");

    if (user.role === "admin") {
        window.location.href = "./admin.html";
    } else {
        window.location.href = "./user.html";
    }
}

languageSelect.value = getLanguage();
applyTranslations();
renderMode();

languageSelect.addEventListener("change", () => {
    setLanguage(languageSelect.value);
    applyTranslations();
    renderMode();
});

emailInput.addEventListener("input", clearErrors);
passwordInput.addEventListener("input", clearErrors);

toggleModeBtn.addEventListener("click", () => {
    isRegisterMode = !isRegisterMode;
    renderMode();
});

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) {
        showToast(t("fixErrors"), "error");
        return;
    }

    const payload = {
        email: emailInput.value.trim(),
        password: passwordInput.value
    };

    setLoading(true);

    try {
        if (isRegisterMode) {
            await api.post("/auth/register", payload);

            isRegisterMode = false;
            passwordInput.value = "";
            renderMode();

            showToast(t("registerSuccess"), "success");
        } else {
            const response = await api.post("/auth/login", payload);

            saveToken(response.token);
            showToast(t("loginSuccess"), "success");

            await routeByRole();
        }
    } catch (error) {
        showToast(error.message || t("connectionError"), "error");
    } finally {
        setLoading(false);
    }
});

redirectIfAlreadyLoggedIn();