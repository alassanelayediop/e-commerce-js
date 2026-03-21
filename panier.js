// ─── panier.js ─── Gestion du panier (stocké en localStorage) ────────────────
import { API, getToken, isLoggedIn } from "./auth.js";

// ─── Opérations panier ────────────────────────────────────────────────────────
export function getPanier() {
    return JSON.parse(localStorage.getItem("panier") || "[]");
}

export function savePanier(panier) {
    localStorage.setItem("panier", JSON.stringify(panier));
    updateBadge();
}

export function ajouterAuPanier(piece) {
    const panier = getPanier();
    const existant = panier.find(item => item.id === piece.id);
    if (existant) {
        existant.quantite++;
    } else {
        panier.push({ id: piece.id, nom: piece.nom, prix: piece.prix, image: piece.image, quantite: 1 });
    }
    savePanier(panier);

    Swal.fire({
        icon: "success", title: "Ajouté au panier !",
        text: `${piece.nom} a été ajouté.`,
        timer: 1500, showConfirmButton: false, toast: true, position: "top-end"
    });
}

export function retirerDuPanier(pieceId) {
    const panier = getPanier().filter(item => item.id !== pieceId);
    savePanier(panier);
}

export function changerQuantite(pieceId, delta) {
    const panier = getPanier();
    const item = panier.find(i => i.id === pieceId);
    if (!item) return;
    item.quantite += delta;
    if (item.quantite <= 0) retirerDuPanier(pieceId);
    else savePanier(panier);
}

export function viderPanier() {
    savePanier([]);
}

export function totalPanier() {
    return getPanier().reduce((acc, i) => acc + i.prix * i.quantite, 0);
}

// ─── Badge compteur ───────────────────────────────────────────────────────────
export function updateBadge() {
    const badge = document.getElementById("panier-badge");
    if (!badge) return;
    const count = getPanier().reduce((acc, i) => acc + i.quantite, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline" : "none";
}

// ─── Rendu du modal panier ────────────────────────────────────────────────────
export function renderPanier() {
    const container = document.getElementById("panier-contenu");
    const btnCommander = document.getElementById("btn-commander");
    if (!container) return;

    const panier = getPanier();
    container.innerHTML = "";

    if (panier.length === 0) {
        container.innerHTML = `<p class="text-center text-muted mt-3">Votre panier est vide.</p>`;
        if (btnCommander) btnCommander.style.display = "none";
        return;
    }

    panier.forEach(item => {
        const row = document.createElement("div");
        row.classList.add("d-flex", "align-items-center", "mb-3", "border-bottom", "pb-2");
        row.innerHTML = `
            <img src="${item.image || 'images/logo-les-bonnes-pieces.png'}" 
                 style="width:50px;height:50px;object-fit:cover;border-radius:6px" class="me-3">
            <div class="flex-grow-1">
                <strong>${item.nom}</strong><br>
                <span class="text-muted">${Number(item.prix).toFixed(2)} € × </span>
                <button class="btn btn-sm btn-outline-secondary py-0 px-1" onclick="window.changerQte(${item.id}, -1)">−</button>
                <span class="mx-1 fw-bold">${item.quantite}</span>
                <button class="btn btn-sm btn-outline-secondary py-0 px-1" onclick="window.changerQte(${item.id}, 1)">+</button>
            </div>
            <div class="ms-2 fw-bold text-end" style="min-width:70px">
                ${(item.prix * item.quantite).toFixed(2)} €
            </div>
            <button class="btn btn-sm text-danger ms-2" onclick="window.retirerItem(${item.id})">✕</button>
        `;
        container.appendChild(row);
    });

    const total = document.createElement("div");
    total.classList.add("d-flex", "justify-content-between", "fw-bold", "mt-2", "fs-5");
    total.innerHTML = `<span>Total</span><span>${totalPanier().toFixed(2)} €</span>`;
    container.appendChild(total);

    if (btnCommander) btnCommander.style.display = "block";
}

// ─── Fonctions globales (appelées depuis les onclick inline) ──────────────────
window.changerQte = (id, delta) => { changerQuantite(id, delta); renderPanier(); };
window.retirerItem = (id) => { retirerDuPanier(id); renderPanier(); };

// ─── Commander ────────────────────────────────────────────────────────────────
export async function passerCommande() {
    if (!isLoggedIn()) {
        Swal.fire({
            icon: "warning", title: "Connexion requise",
            text: "Vous devez être connecté pour passer une commande.",
            confirmButtonText: "Se connecter"
        }).then(() => window.location.href = "login/login.html");
        return;
    }

    const panier = getPanier();
    if (panier.length === 0) return;

    try {
        const response = await fetch(`${API}/commandes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({ panier })
        });

        const data = await response.json();
        if (response.ok) {
            viderPanier();
            renderPanier();
            // Fermer le modal panier
            const modal = bootstrap.Modal.getInstance(document.getElementById("modalPanier"));
            if (modal) modal.hide();

            Swal.fire({
                icon: "success",
                title: "Commande confirmée ! 🎉",
                html: `
                    <p>Votre commande <strong>#${data.commandeId}</strong> a été enregistrée.</p>
                    <p>Total : <strong>${Number(data.total).toFixed(2)} €</strong></p>
                `,
                showCancelButton: true,
                confirmButtonText: "📄 Télécharger la facture",
                cancelButtonText: "Fermer"
            }).then(result => {
                if (result.isConfirmed) {
                    telechargerFacture(data.commandeId);
                }
            });
        } else {
            Swal.fire({ icon: "error", title: "Erreur", text: data.error });
        }
    } catch (err) {
        Swal.fire({ icon: "error", title: "Connexion impossible", text: "Le serveur est inaccessible." });
    }
}

export function telechargerFacture(commandeId) {
    const token = getToken();
    const link = document.createElement("a");
    link.href = `${API}/facture/${commandeId}?token=${token}`;
    // On passe le token en query param car on ne peut pas mettre de header sur une balise <a>
    fetch(`${API}/facture/${commandeId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    }).then(res => res.blob()).then(blob => {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `facture_${commandeId}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    });
}
