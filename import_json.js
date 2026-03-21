const mysql = require("mysql2");
const fs = require("fs");

// Connexion à MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Remplace avec ton utilisateur
    password: "", // Remplace avec ton mot de passe
    database: "pieces_autos"
});

// Lire le fichier JSON
const rawData = fs.readFileSync("pieces-autos.json");
const pieces = JSON.parse(rawData); // transformer le JSON en objet JavaScript

pieces.forEach((piece) => {
    const sql = `INSERT INTO pieces (nom, prix, categorie, image, description, disponibilite) VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(
        sql, 
        [piece.nom, piece.prix, piece.categorie, piece.image, piece.description, piece.disponibilite], 
        (err) => {
            if (err) console.error("Erreur lors de l'insertion :", err);
            else console.log(`Ajouté : ${piece.nom}`);
    });
});

// Fermer la connexion après importation
setTimeout(() => db.end(), 2000);

// commande pour l'importation : node import_json.js
// commande pour le lancement du serveur : node server.js