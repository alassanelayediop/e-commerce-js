-- ============================================
--  Les Bonnes Pièces — Base de données v2
-- ============================================

CREATE DATABASE IF NOT EXISTS pieces_autos;
USE pieces_autos;

-- Table pièces (inchangée)
CREATE TABLE IF NOT EXISTS pieces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255),
    prix DECIMAL(10,2),
    categorie VARCHAR(255),
    image VARCHAR(255),
    description TEXT,
    disponibilite BOOLEAN
);

-- Table avis (inchangée)
CREATE TABLE IF NOT EXISTS avis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pieceId INT,
    utilisateur VARCHAR(255),
    commentaire TEXT,
    nbEtoiles INT,
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pieceId) REFERENCES pieces(id) ON DELETE CASCADE
);

-- Table utilisateurs (NOUVEAU)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table commandes (NOUVEAU)
CREATE TABLE IF NOT EXISTS commandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    statut ENUM('en_attente', 'confirmee', 'livree') DEFAULT 'confirmee',
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Table lignes de commande (NOUVEAU)
CREATE TABLE IF NOT EXISTS lignes_commande (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commande_id INT NOT NULL,
    piece_id INT NOT NULL,
    nom_piece VARCHAR(255) NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE
);
