import { getToken } from "./storage.js";

export const API_BASE_URL = "http://localhost:3001/api";

async function request(path, options = {}) {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    let data = null;

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        data = await response.json();
    }

    if (!response.ok) {
        const message = data?.message || `HTTP error ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

async function download(path, fileName) {
    const token = getToken();

    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "GET",
        headers
    });

    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
}

export const api = {
    get(path) {
        return request(path);
    },

    post(path, body) {
        return request(path, {
            method: "POST",
            body: JSON.stringify(body)
        });
    },

    patch(path, body) {
        return request(path, {
            method: "PATCH",
            body: JSON.stringify(body)
        });
    },

    delete(path) {
        return request(path, {
            method: "DELETE"
        });
    },

    download(path, fileName) {
        return download(path, fileName);
    }
};