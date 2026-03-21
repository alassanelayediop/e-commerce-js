CREATE DATABASE pieces_autos;

USE pieces_autos;

CREATE TABLE pieces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255),
    prix DECIMAL(10,2),
    categorie VARCHAR(255),
    image VARCHAR(255),
    description TEXT,
    disponibilite BOOLEAN
);

CREATE TABLE avis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pieceId INT,
    utilisateur VARCHAR(255),
    commentaire TEXT,
    nbEtoiles INT,
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pieceId) REFERENCES pieces(id) ON DELETE CASCADE
);