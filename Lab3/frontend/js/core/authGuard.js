import { api } from "./api.js";
import { clearToken, getToken } from "./storage.js";

export async function getCurrentUser() {
    const token = getToken();

    if (!token) {
        return null;
    }

    try {
        return await api.get("/auth/me");
    } catch (error) {
        clearToken();
        return null;
    }
}

export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        window.location.href = "./index.html";
        return null;
    }

    return user;
}

export async function requireRole(requiredRole) {
    const user = await requireAuth();

    if (!user) {
        return null;
    }

    if (user.role !== requiredRole) {
        if (user.role === "admin") {
            window.location.href = "./admin.html";
        } else {
            window.location.href = "./user.html";
        }

        return null;
    }

    return user;
}

export function logout() {
    clearToken();
    window.location.href = "./index.html";
}

export async function redirectIfAlreadyLoggedIn() {
    const user = await getCurrentUser();

    if (!user) {
        return;
    }

    if (user.role === "admin") {
        window.location.href = "./admin.html";
    } else {
        window.location.href = "./user.html";
    }
}