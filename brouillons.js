/*
// const article = pieces[0];

// Creations des articles
const imageElement = document.createElement("img");
imageElement.src = article.image; // src permet de spécifier le lien de l'image

const nomElement = document.createElement("h2");
nomElement.innerText = article.nom;

const prixElement = document.createElement("p");
const euro = article.prix < 35 ? "€" : "€€€"
prixElement.innerText = `Prix : ${article.prix} € (${euro})`;

const categorieElement = document.createElement("p");
categorieElement.innerText = article.categorie;

const descriptionElement = document.createElement("p");
descriptionElement.innerText = article.descriptionElement ?? "Aucune description pour le moment";

const disponibiliteElement = document.createElement("p");
const disponibilite = article.disponibilite ? "En stock" : "Rupture de stock";
disponibiliteElement.innerText = disponibilite

export function generatesPieces(pieces) // export nous aide pour que cette fonction soit exportable
{
    // rattachement de nos balises au DOM (grace à l'element parent)
    const sectionFiches = document.querySelector(".fiches");
    
    for (let i=0 ; i<pieces.length ; i++)
    {
        const article = pieces[i];
    
        // Création d'une balise (article) dédié à une piece auto
        const articleElement = document.createElement("article");
    
        // Creations des articles
        const imageElement = document.createElement("img");
        imageElement.src = article.image; // src permet de spécifier le lien de l'image
    
        const nomElement = document.createElement("h2");
        nomElement.innerText = article.nom;
    
        const prixElement = document.createElement("p");
        const euro = article.prix < 35 ? "€" : "€€€"
        prixElement.innerText = `Prix : ${article.prix} € (${euro})`;
    
        const categorieElement = document.createElement("p");
        categorieElement.innerText = article.categorie;
    
        const descriptionElement = document.createElement("p");
        descriptionElement.innerText = article.description ?? "Aucune description pour le moment";
    
        const disponibiliteElement = document.createElement("p");
        const disponibilite = article.disponibilite ? "En stock" : "Rupture de stock";
        disponibiliteElement.innerText = disponibilite

        // Ajout des boutons
        const btnAvis = document.createElement("button");
        // btnAvis.dataset.id = "data-id";
        btnAvis.innerText = "Afficher les avis";
        btnAvis.classList.add("bton");
    
        // Ajout de des à la fiche
        articleElement.appendChild(imageElement);
        articleElement.appendChild(nomElement);
        articleElement.appendChild(prixElement);
        articleElement.appendChild(categorieElement);
        articleElement.appendChild(descriptionElement);
        articleElement.appendChild(disponibiliteElement);
        articleElement.appendChild(btnAvis); // Ajout du bouton au article

        // Création du conteneur pour les avis
        const avisContainer = document.createElement("div");
        avisContainer.classList.add("avis-container", "mt-2");
        articleElement.appendChild(avisContainer);
        
        // Ajout d'un listener sur le bouton
        btnAvis.addEventListener("click", async () => {
            if(avisContainer.style.display == "block")
            {
                // on le masque et on change le texte si le conteneur est déjà visible
                avisContainer.style.display = "none";
                btnAvis.innerText = "Afficher les avis";
            } else {
                // On recupere les avis de la piece depuis l'API
                try {
                    const response = await fetch(`http://localhost:8081/avis/${article.id}`);
                    if (response.ok)
                    {
                        const avis = await response.json();
                        // On vide le conteneur avant d'ajouter les nouveaux avis
                        avisContainer.innerHTML = ""; // vider le conteneur
                        if(avis.length > 0)
                        {
                            avis.forEach(commentaire => {
                                const p = document.createElement("p");
                                p.innerHTML += `<strong><i>${commentaire.utilisateur}</i></strong> : ${commentaire.commentaire} <br>Note : (${commentaire.nbEtoiles} étoiles)`;
                                avisContainer.appendChild(p);
                            });
                        } else {
                            avisContainer.innerHTML = `<p>Aucun avis disponible</p>`;
                            btnAvis.innerText = "Fermer";
                        }
                        // On affiche le conteneur
                        avisContainer.style.display = "block";
                        btnAvis.innerText = "Fermer les avis";

                    } else {
                        avisContainer.innerText = "Aucun avis disponible";
                        avisContainer.style.display = "block";
                        btnAvis.innerText = "Fermer";
                    }

                } catch (error) {
                    console.error("Erreur lors de la récupération des avis:", error);
                }
            }
        })
    
        // On rattache la balise article à la section Fiches// Ajout de l'article dans la section
        sectionFiches.appendChild(articleElement);
    }
}

Server.js
db.query(
  sql, 
  [piece.nom, piece.prix, piece.categorie, piece.image, piece.description, piece.disponibilite], 
    (err) => {
    if (err) console.error("Erreur lors de l'insertion :", err);
      else console.log(`Ajouté : ${piece.nom}`);
});

<!-- Modal pour l'ajout d'un avis -->
<div class="modal fade" id="modalAjoutAvis" tabindex="-1" aria-labelledby="modalAjoutAvisLabel" aria-hidden="true">
	<form class="formulaire-avis" id="form-ajout-avis">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header text-center">
					<h1 class="modal-title fs-5 text-dark fw-bolder text-center" id="exampleModalLabel">Ajout d'avis</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<div class="mb-3">
						<label for="exampleInputEmail1" class="form-label text-dark fw-bolder">Idnetifiant du piéce commenté</label>
						<input type="number" class="form-control" name="piece_id" id="piece_id" pattern="^[0-9]+$" required>
					</div>
					<div class="mb-3">
						<label for="exampleInputEmail1" class="form-label text-dark fw-bolder">Nom</label>
						<input type="text" class="form-control" name="utilisateur" id="utilisateur" required>
					</div>
					<div class="mb-3">
						<label for="exampleInputEmail1" class="form-label text-dark fw-bolder">Avis</label>
						<textarea class="form-control text-dark" name="commentaire" id="commentaire" required></textarea>
					</div>
					<div class="mb-3">
						<label for="exampleInputEmail1" class="form-label text-dark fw-bolder">Note</label>
						<input type="number" class="form-control text-dark" name="nbEtoiles" id="nbEtoiles" pattern="^[0-5]+$" required>
					</div>
				</div>
				<div class="modal-footer">
					<button type="reset" class="btn text-black fw-bolder">Annuler</button> <!-- data-bs-dismiss="modal" -->
					<button type="submit" class="btn text-black fw-bolder">Envoyer</button>
				</div>
			</div>
		</div>
	</form>
</div>
*/