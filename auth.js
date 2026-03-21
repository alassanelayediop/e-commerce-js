// ─── auth.js ─── Gestion de l'authentification côté frontend ─────────────────

// URL de l'API
export const API = "http://localhost:8081";

// ─── Helpers token ────────────────────────────────────────────────────────────
export function getToken()  { return localStorage.getItem("token"); }
export function getUser()   { return JSON.parse(localStorage.getItem("user") || "null"); }
export function isLoggedIn(){ return !!getToken(); }

export function saveSession(token, nom, email) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ nom, email }));
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("panier");
    window.location.href = "login/login.html";
}

// ─── Mise à jour du header selon l'état de connexion ─────────────────────────
export function updateNavbar() {
    const navUser   = document.getElementById("nav-user");
    const navLogin  = document.getElementById("nav-login");
    const navLogout = document.getElementById("nav-logout");
    const navPanier = document.getElementById("nav-panier");

    if (isLoggedIn()) {
        const user = getUser();
        if (navUser)   { navUser.textContent = `👤 ${user.nom}`; navUser.style.display = "inline"; }
        if (navLogin)  navLogin.style.display  = "none";
        if (navLogout) navLogout.style.display = "inline";
        if (navPanier) navPanier.style.display = "inline";
    } else {
        if (navUser)   navUser.style.display   = "none";
        if (navLogin)  navLogin.style.display  = "inline";
        if (navLogout) navLogout.style.display = "none";
        if (navPanier) navPanier.style.display = "none";
    }
}
