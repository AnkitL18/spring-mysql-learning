export function saveAuth(token, user = null) {
    localStorage.setItem("jwt", token);

    if (user) {
        localStorage.setItem("user", JSON.stringify(user));
    }
}

export function getToken() {
    return localStorage.getItem("jwt");
}

export function getUser() {
    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}

export function isAuthenticated() {
    return !!getToken();
}

export function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
}