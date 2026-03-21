import { getToken, getUser, isLoggedIn, logout } from "./auth.js";
import { telechargerFacture } from "./panier.js";

window.doLogout = logout;
window.telecharger = telechargerFacture;

const API = "http://localhost:8081";

if (!isLoggedIn()) window.location.href = "login.html";

const user = getUser();
document.getElementById("nav-user").textContent = `👤 ${user?.nom || ""}`;

const container = document.getElementById("commandes-liste");

async function chargerCommandes() {
    const res = await fetch(`${API}/commandes`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    });
    const commandes = await res.json();

    if (!res.ok || commandes.length === 0) {
        container.innerHTML = `<p class="text-muted">Aucune commande pour l'instant.</p>`;
        return;
    }

    container.innerHTML = "";
    commandes.forEach(cmd => {
        const lignes = typeof cmd.lignes === "string" ? JSON.parse(cmd.lignes) : cmd.lignes;
        const date   = new Date(cmd.date_commande).toLocaleDateString("fr-FR", {
            day:"2-digit", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit"
        });

        const rows = lignes.map(l =>
            `<tr>
                        <td>${l.nom}</td>
                        <td>${Number(l.prix).toFixed(2)} €</td>
                        <td>${l.qte}</td>
                        <td><strong>${(l.prix * l.qte).toFixed(2)} €</strong></td>
                    </tr>`
        ).join("");

        const card = document.createElement("div");
        card.classList.add("commande-card");
        card.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5>Commande #${cmd.id}</h5>
                        <span class="badge-statut">${cmd.statut.replace("_"," ").toUpperCase()}</span>
                    </div>
                    <p class="text-muted mb-3">📅 ${date}</p>
                    <table class="table table-sm mb-3">
                        <thead><tr><th>Pièce</th><th>Prix unit.</th><th>Qté</th><th>Sous-total</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <div class="d-flex justify-content-between align-items-center">
                        <strong style="font-size:1.1rem">Total : ${Number(cmd.total).toFixed(2)} €</strong>
                        <button class="btn-facture" onclick="window.telecharger(${cmd.id})">
                            📄 Télécharger la facture
                        </button>
                    </div>
                `;
        container.appendChild(card);
    });
}

chargerCommandes();