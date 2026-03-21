export function generatesPieces(pieces) {
    const sectionFiches = document.querySelector(".fiches");

    for (let i = 0; i < pieces.length; i++) 
    {
        const article = pieces[i];

        const articleElement = document.createElement("article");

        const imageElement = document.createElement("img");
        imageElement.src = article.image;

        const nomElement = document.createElement("h2");
        nomElement.innerText = article.nom;

        const prixElement = document.createElement("p");
        const euro = article.prix < 35 ? "€" : "€€€";
        prixElement.innerText = `Prix : ${article.prix} € (${euro})`;

        const categorieElement = document.createElement("p");
        categorieElement.innerText = article.categorie;

        const descriptionElement = document.createElement("p");
        descriptionElement.innerText = article.description ?? "Aucune description.";

        const disponibiliteElement = document.createElement("p");
        disponibiliteElement.innerText = article.disponibilite ? "En stock" : "Rupture de stock";

        // Bouton panier
        const btnPanier = document.createElement("button");
        btnPanier.innerText = "🛒 Ajouter au panier";
        btnPanier.classList.add("bton", "ms-2");
        btnPanier.style.background = "#e65c00";
        btnPanier.style.color = "#fff";
        // Cacher le bouton si non connecté
        if (!localStorage.getItem("token")) {
            btnPanier.style.display = "none";
        }

        btnPanier.addEventListener("click", () => {
            if (!localStorage.getItem("token")) {
                Swal.fire({
                    icon: "warning",
                    title: "Connexion requise",
                    text: "Vous devez être connecté pour ajouter au panier.",
                    confirmButtonText: "Se connecter",
                    confirmButtonColor: "#e65c00"
                }).then(() => window.location.href = "login.html");
                return;
            }
            import("./panier.js").then(m => m.ajouterAuPanier(article));
        });

        const btnAvis = document.createElement("button");
        btnAvis.innerText = "Afficher les avis";
        btnAvis.classList.add("bton");

        const statsContainer = document.createElement("div");
        statsContainer.classList.add("avis-stats");

        const avisContainer = document.createElement("div");
        avisContainer.classList.add("avis-container", "mt-2");
        avisContainer.style.display = "none";

        btnAvis.addEventListener("click", async () => {
            if (avisContainer.style.display === "block") {
                avisContainer.style.display = "none";
                btnAvis.innerText = "Afficher les avis";
            } else {
                try {
                    const response = await fetch(`http://localhost:8081/avis/${article.id}`);
                    if (response.ok) {
                        const avis = await response.json();
                        avisContainer.innerHTML = "";
                        if (avis.length === 0) {
                            avisContainer.innerText = "Aucun avis pour cette pièce.";
                        } else {
                            avis.forEach(commentaire => {
                                const p = document.createElement("p");
                                p.innerText = `${commentaire.utilisateur}: ${commentaire.commentaire} (${commentaire.nbEtoiles}★)`;
                                avisContainer.appendChild(p);
                            });
                        }
                        avisContainer.style.display = "block";
                        btnAvis.innerText = "Fermer les avis";
                    } else {
                        avisContainer.innerText = "Erreur lors de la récupération des avis.";
                        avisContainer.style.display = "block";
                    }
                } catch (error) {
                    console.error("Erreur lors de la récupération des avis:", error);
                }
            }
        });

        // === Formulaire d'ajout d'avis ===
        const btnDonnerAvis = document.createElement("button");
        btnDonnerAvis.innerText = "Donner un avis";
        btnDonnerAvis.classList.add("bton", "ms-2");

        const formAvis = document.createElement("form");
        formAvis.style.display = "none";
        formAvis.classList.add("mt-2");
        formAvis.innerHTML = `
            <input type="text" name="utilisateur" placeholder="Votre nom" class="form-control mb-2" required>
            <textarea name="commentaire" placeholder="Votre commentaire" class="form-control mb-2" required></textarea>
            <input type="number" name="nbEtoiles" placeholder="Nombre d’étoiles (1-5)" class="form-control mb-2" min="1" max="5" required>
            <button type="submit" class="btn btn-primary">Envoyer</button>
        `;

        btnDonnerAvis.addEventListener("click", () => {
            formAvis.style.display = formAvis.style.display === "none" ? "block" : "none";
            btnDonnerAvis.innerText = formAvis.style.display === "none" ? "Donner un avis" : "Fermer";
            // btnDonnerAvis.innerText = "Fermer";
        });

        formAvis.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(formAvis);
            const jsonData = Object.fromEntries(formData.entries());
            jsonData.piece_id = article.id;

            try {
                const response = await fetch(`http://localhost:8081/avis`, {
                    method: "POST", // Verbe HTTP pour envoyer des données (GET ou POST)
                    body: JSON.stringify(jsonData), // charges utile pour indiquer le type de contenu
                    headers: { // format de la charge utile
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    Swal.fire({
                        icon: "success",
                        title: "Avis envoyé !",
                        text: "Merci pour votre avis 😊",
                        confirmButtonColor: '#3085d6',
                    }).then(() => {
                      formAvis.reset();
                      formAvis.style.display = "none";  
                      location.reload(); // On recharge la page pour afficher la mise à jour après avoir cliqué sur "OK"
                    });
                    formAvis.reset();
                    formAvis.style.display = "none";
                    
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Erreur",
                        text: "Impossible d'envoyer l'avis.",
                    });
                }
            } catch (error) {
                console.error("Erreur:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text: "Une erreur est survenue.",
                });
            }
        });

        afficherStatsAvis(article.id, statsContainer);

        articleElement.appendChild(imageElement);
        articleElement.appendChild(nomElement);
        articleElement.appendChild(prixElement);
        articleElement.appendChild(categorieElement);
        articleElement.appendChild(descriptionElement);
        articleElement.appendChild(disponibiliteElement);
        articleElement.appendChild(btnPanier);
        articleElement.appendChild(btnAvis);
        articleElement.appendChild(btnDonnerAvis);
        articleElement.appendChild(formAvis);
        articleElement.appendChild(avisContainer);
        articleElement.appendChild(statsContainer);

        sectionFiches.appendChild(articleElement);
    }
}

export function listesPieces(pieces)
{
    // Retourner seulement le nom des pieces
    const nomsPieces = pieces.map(pieces => pieces.nom) // <=> function (piece) {return piece.nom;}
    
    // Supprimer les pieces qui ne sont pas abordables
    const abordablesElements = document.createElement('ul')
    const abordables = document.querySelector('.abordables')
    const titles1 = document.createElement('p')
    titles1.innerText = 'Pièces abordables (<35€)'
    abordables.appendChild(titles1)
    for (let i=pieces.length-1 ; i>=0 ; i--){
        if (pieces[i].prix <= 35){
            const liElement = document.createElement('li')
            liElement.innerText = nomsPieces[i]
            // nomsPieces.splite(i, 1) // Supprime l'élément à l'index i
            abordablesElements.appendChild(liElement)
        }
    }
    abordables.appendChild(abordablesElements)
    
    // Supprimer les pieces qui ne sont pas disponibles
    const disponiblesElements = document.createElement('ul')
    const disponibles = document.querySelector('.disponibles')
    const titles2 = document.createElement('p')
    titles2.innerText = 'Pièces disponibles'
    disponibles.appendChild(titles2)
    for (let i=pieces.length-1 ; i>=0 ; i--){
        if (pieces[i].disponibilite){
            const liElement = document.createElement('li')
            // const euro = pieces[i].prix <= 35 ? "€" : "€€€"
            liElement.innerText = `${nomsPieces[i]} - ${pieces[i].prix} €`
            // nomsPieces.splite(i, 1) // Supprime l'élément à l'index i
            disponiblesElements.appendChild(liElement)
        }
    }
    disponibles.appendChild(disponiblesElements)
}

export function recreate(sectionFiches)
{
    // 🔁 On recrée les containers supprimés
    const divGlob = document.createElement('div');
    
    const divAbordables = document.createElement('div');
    divAbordables.classList.add('abordables');

    const divDisponibles = document.createElement('div');
    divDisponibles.classList.add('disponibles');

    // ➕ On les remet dans la section div
    divGlob.appendChild(divAbordables);
    divGlob.appendChild(divDisponibles);

    // ➕ On les remet dans la section div
    sectionFiches.appendChild(divGlob);
}

// Code de gestion du formulaire d'ajout de pièce
export function ajoutListenerEnvoyerPiece() {
    // Formulaire d'ajout de pièce
    const formAjoutPiece = document.getElementById("form-ajout-piece");

    if (formAjoutPiece) {
        formAjoutPiece.addEventListener("submit", async (event) => {
            event.preventDefault(); // sinon la page se recharge et ne prend pas en compte la validation du formulaire

            const formData = new FormData(formAjoutPiece);
            const jsonData = Object.fromEntries(formData.entries());

            jsonData.disponibilite = jsonData.disponibilite === "1"; // Convertir en booléen

            try {
                const response = await fetch(`http://localhost:8081/pieces`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(jsonData),
                });

                if (response.ok) {
                    // alert("Pièce ajoutée avec succès !");
                    Swal.fire({
                      icon: 'success',
                      title: 'Succès !',
                      text: 'Pièce ajoutée avec succès.',
                      confirmButtonColor: '#3085d6',
                    }).then(() => {
                      location.reload(); // On recharge la page pour afficher la mise à jour après avoir cliqué sur "OK"
                    });

                } else {
                    // alert("Erreur lors de l'ajout de la pièce.");
                    Swal.fire({
                      icon: 'error',
                      title: 'Erreur',
                      text: 'Une erreur est survenue lors de l’ajout de la pièce.',
                      confirmButtonColor: '#d33',
                    });
                }
            } catch (error) {
                Swal.fire({
                  icon: 'warning',
                  title: 'Échec de connexion',
                  text: 'Impossible de contacter le serveur. Veuillez réessayer.',
                  confirmButtonColor: '#f39c12',
                });
                console.error("Erreur:", error);
                // alert("Impossible d'envoyer la requête.");
            }
        });
    }
}

export async function afficherStatsAvis(idPiece, container) {
    try {
        const res = await fetch(`http://localhost:8081/stats-avis/${idPiece}`);
        const data = await res.json();
        
        const { moyenne, total, repartition } = data;
        container.innerHTML = ''; // On vide le conteneur avant

        const title = document.createElement("h5");
        title.classList.add("mt-3");
        title.innerText = `⭐ ${moyenne.toFixed(1)} (${total} avis)`;
        container.appendChild(title);

        for (let i = 5; i >= 1; i--) 
        {
            const barContainer = document.createElement("div");
            barContainer.classList.add("d-flex", "align-items-center", "mb-1", "me-2");

            const starLabel = document.createElement("span");
            const etoile = document.createElement("span");
            etoile.innerText = "★";
            etoile.style.color = "#ff5500";
            starLabel.classList.add("ms-1");
            starLabel.innerText = `${i}`;
            starLabel.appendChild(etoile);
            starLabel.style.width = "50px";
            starLabel.style.fontSize = "15px";

            const barBg = document.createElement("div");
            barBg.classList.add("progress");
            barBg.style.width = "100%";
            barBg.style.height = "10px";
            barBg.style.background = "rgba(121, 40, 0, 0.47)";
            barBg.style.marginLeft = "0px";

            const bar = document.createElement("div");
            bar.classList.add("progress-bar");
            bar.style.background = "#ff5500"
            const found = repartition.find(r => r.nbEtoiles === i);
            const value = found ? (found.count / total) * 100 : 0;
            bar.style.width = `${value}%`;

            barBg.appendChild(bar);
            barContainer.appendChild(starLabel);
            barContainer.appendChild(barBg);
            container.appendChild(barContainer);
        }
    } catch (e) {
        container.innerText = "Statistiques d'avis non disponibles.";
    }
}
