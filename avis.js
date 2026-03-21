
export function afficherListenerAvis(){
    const piecesElements = document.querySelectorAll('.fiches artcile button');

    for (let i=0 ; i<piecesElements.length ; i++) 
    {
        piecesElements[i].addEventListener('click', async function (event) {
            //
        })
    }
}

// Code de gestion du formulaire d'ajout d'avis
export function ajoutListenerEnvoyerAvis()
{
    // Formulaire d'ajout d'une avis.
    const formAjoutAvis = document.getElementById("form-ajout-avis");

    if (formAjoutAvis) {
        formAjoutAvis.addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new FormData(formAjoutAvis);
            const jsonData = Object.fromEntries(formData.entries());

            // jsonData.disponibilite = jsonData.disponibilite === "1"; // Convertir en booléen

            try {
                const response = await fetch("http://localhost:8081/avis", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(jsonData),
                });

                if (response.ok) {
                    alert("Commentaire ajouté avec succès !");
                    console.log("Commentaire ajouté avec succès !");
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAjoutAvis'));
                    modal.hide(); // Ferme le modal
                    // location.reload(); // Recharger la page ensuite
                } else {
                    alert("Erreur lors de l'ajout du commentaire.");
                    console.log("Erreur lors de l'ajout du commentaire.");
                }
            } catch (error) {
                console.error("Erreur:", error);
                alert("Impossible d'envoyer la requête.");
            }
        });
    }
}

export function genererAvis(){}