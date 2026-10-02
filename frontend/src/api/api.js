const API_BASE_URL = "http://localhost:8080";

export async function apiRequest(endpoint, options = {}) {    const token = localStorage.getItem("jwt");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Unauthorized");
    }

    const contentType = response.headers.get("content-type");

    let data;

    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const message =
            typeof data === "object" && data?.message
                ? data.message
                : `Request failed with status ${response.status}`;

        throw new Error(message);
    }

    return data;
}

export const get = (endpoint) =>
    apiRequest(endpoint, {
        method: "GET"
    });

export const post = (endpoint, body) =>
    apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
    });

export const put = (endpoint, body) =>
    apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(body)
    });

export const del = (endpoint) =>
    apiRequest(endpoint, {
        method: "DELETE"
    });

export default apiRequest;