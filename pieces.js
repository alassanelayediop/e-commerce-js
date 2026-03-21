import { generatesPieces, listesPieces, recreate, ajoutListenerEnvoyerPiece } from "./functions.js";
import { ajoutListenerEnvoyerAvis } from "./avis.js";
import { updateNavbar, logout } from "./auth.js";
import { updateBadge, renderPanier, passerCommande } from "./panier.js";

// ─── Fonctions globales pour les onclick dans le HTML ─────────────────────────
window.doLogout   = logout;
window.doCommander = passerCommander;

async function passerCommander() {
    await passerCommande();
}

async function init() {
    // Mise à jour de la navbar
    updateNavbar();
    updateBadge();

    // Rendre le panier quand on ouvre le modal
    document.getElementById("modalPanier")?.addEventListener("show.bs.modal", renderPanier);

    // Récupération des pièces depuis l'API
    const api    = await fetch(`http://localhost:8081/pieces/`);
    const pieces = await api.json();

    const sectionFiches = document.querySelector(".fiches");
    sectionFiches.innerHTML = "";

    recreate(sectionFiches);
    listesPieces(pieces);
    generatesPieces(pieces);

    // Boutons de filtre
    document.querySelector('.btn-trier').addEventListener('click', () => {
        const sorted = [...pieces].sort((a, b) => a.prix - b.prix);
        sectionFiches.innerHTML = "";
        generatesPieces(sorted);
    });
    document.querySelector('.btn-decroissant').addEventListener('click', () => {
        const sorted = [...pieces].sort((a, b) => b.prix - a.prix);
        sectionFiches.innerHTML = "";
        generatesPieces(sorted);
    });
    document.querySelector('.btn-filtrer').addEventListener('click', () => {
        sectionFiches.innerHTML = "";
        generatesPieces(pieces.filter(p => p.prix < 35));
    });
    document.querySelector('.btn-desc').addEventListener('click', () => {
        sectionFiches.innerHTML = "";
        generatesPieces(pieces.filter(p => p.description));
    });
    document.querySelector('.btn-disponibles').addEventListener('click', () => {
        sectionFiches.innerHTML = "";
        generatesPieces(pieces.filter(p => p.disponibilite));
    });

    const inputPrixMax  = document.getElementById('prix-max');
    const valeurRange   = document.getElementById('valeur-range');
    inputPrixMax.addEventListener('input', () => {
        const max = inputPrixMax.value;
        sectionFiches.innerHTML = "";
        generatesPieces(pieces.filter(p => p.prix <= max));
        valeurRange.innerText = max;
    });

    document.querySelector('.btn-update').addEventListener('click', () => {
        sectionFiches.innerHTML = "";
        recreate(sectionFiches);
        listesPieces(pieces);
        generatesPieces(pieces);
    });

    ajoutListenerEnvoyerPiece();
    ajoutListenerEnvoyerAvis();
}

document.addEventListener("DOMContentLoaded", init);
