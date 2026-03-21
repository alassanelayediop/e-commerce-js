const express = require("express");
const mysql   = require("mysql2");
const cors    = require("cors");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const PDFDocument = require("pdfkit");

const app  = express();
const port = 8081;
const JWT_SECRET = process.env.JWT_SECRET || "lesbonnespiecesdakar2025";

app.use(cors());
app.use(express.json());

// ─── Connexion MySQL Pool ─────────────────────────────────────────────────────
const db = mysql.createPool({
    host:               "localhost",
    port:               3306,
    user:               "root",
    password:           "",
    database:           "pieces_autos",
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    multipleStatements: false
});

// ─── Initialisation automatique des tables ────────────────────────────────────
function initTables() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS pieces (
                                               id INT AUTO_INCREMENT PRIMARY KEY,
                                               nom VARCHAR(255),
                                               prix DECIMAL(10,2),
                                               categorie VARCHAR(255),
                                               image VARCHAR(255),
                                               description TEXT,
                                               disponibilite BOOLEAN
         )`,
        `CREATE TABLE IF NOT EXISTS avis (
                                             id INT AUTO_INCREMENT PRIMARY KEY,
                                             pieceId INT,
                                             utilisateur VARCHAR(255),
                                             commentaire TEXT,
                                             nbEtoiles INT,
                                             date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                             FOREIGN KEY (pieceId) REFERENCES pieces(id) ON DELETE CASCADE
         )`,
        `CREATE TABLE IF NOT EXISTS utilisateurs (
                                                     id INT AUTO_INCREMENT PRIMARY KEY,
                                                     nom VARCHAR(100) NOT NULL,
                                                     email VARCHAR(255) NOT NULL UNIQUE,
                                                     mot_de_passe VARCHAR(255) NOT NULL,
                                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )`,
        `CREATE TABLE IF NOT EXISTS commandes (
                                                  id INT AUTO_INCREMENT PRIMARY KEY,
                                                  utilisateur_id INT NOT NULL,
                                                  total DECIMAL(10,2) NOT NULL,
                                                  statut ENUM('en_attente','confirmee','livree') DEFAULT 'confirmee',
                                                  date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
         )`,
        `CREATE TABLE IF NOT EXISTS lignes_commande (
                                                        id INT AUTO_INCREMENT PRIMARY KEY,
                                                        commande_id INT NOT NULL,
                                                        piece_id INT NOT NULL,
                                                        nom_piece VARCHAR(255) NOT NULL,
                                                        prix_unitaire DECIMAL(10,2) NOT NULL,
                                                        quantite INT NOT NULL DEFAULT 1,
                                                        FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
                                                        FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE
         )`
    ];

    db.getConnection((err, connection) => {
        if (err) { console.error("❌ Erreur MySQL:", err.message); return; }
        console.log("✅ Connecté à MySQL (pool)");

        let index = 0;
        function next() {
            if (index >= tables.length) {
                console.log("✅ Tables initialisées");
                connection.release();
                return;
            }
            connection.query(tables[index++], (err) => {
                if (err) console.error("❌ Init table erreur:", err.message);
                next();
            });
        }
        next();
    });
}

initTables();

// ─── Middleware auth JWT ──────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
    const header = req.headers["authorization"];
    if (!header) return res.status(401).json({ error: "Token manquant" });
    const token = header.split(" ")[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: "Token invalide" });
    }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PIÈCES
// ══════════════════════════════════════════════════════════════════════════════

app.get("/pieces", (req, res) => {
    db.query("SELECT * FROM pieces", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post("/pieces", (req, res) => {
    const { nom, prix, categorie, image, description, disponibilite } = req.body;
    db.query(
        "INSERT INTO pieces (nom, prix, categorie, image, description, disponibilite) VALUES (?, ?, ?, ?, ?, ?)",
        [nom, prix, categorie, image, description, disponibilite],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Pièce ajoutée", id: result.insertId });
        }
    );
});

// ══════════════════════════════════════════════════════════════════════════════
//  AVIS
// ══════════════════════════════════════════════════════════════════════════════

app.get("/avis/:idPiece", (req, res) => {
    db.query("SELECT * FROM avis WHERE pieceId = ?", [req.params.idPiece], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get("/stats-avis/:idPiece", (req, res) => {
    const idPiece = parseInt(req.params.idPiece);
    db.query(
        "SELECT nbEtoiles, COUNT(*) AS count FROM avis WHERE pieceId = ? GROUP BY nbEtoiles",
        [idPiece],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            const total   = results.reduce((acc, r) => acc + r.count, 0);
            const moyenne = results.reduce((acc, r) => acc + r.nbEtoiles * r.count, 0) / total || 0;
            res.json({ moyenne, total, repartition: results });
        }
    );
});

app.post("/avis", (req, res) => {
    const { piece_id, utilisateur, commentaire, nbEtoiles } = req.body;
    db.query(
        "INSERT INTO avis (pieceId, utilisateur, commentaire, nbEtoiles) VALUES (?, ?, ?, ?)",
        [piece_id, utilisateur, commentaire, nbEtoiles],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Avis ajouté", id: result.insertId });
        }
    );
});

// ══════════════════════════════════════════════════════════════════════════════
//  AUTH — REGISTER / LOGIN
// ══════════════════════════════════════════════════════════════════════════════

app.post("/register", async (req, res) => {
    const { nom, email, mot_de_passe } = req.body;
    if (!nom || !email || !mot_de_passe)
        return res.status(400).json({ error: "Tous les champs sont requis" });

    const hash = await bcrypt.hash(mot_de_passe, 10);
    db.query(
        "INSERT INTO utilisateurs (nom, email, mot_de_passe) VALUES (?, ?, ?)",
        [nom, email, hash],
        (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY")
                    return res.status(409).json({ error: "Email déjà utilisé" });
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Compte créé avec succès", id: result.insertId });
        }
    );
});

app.post("/login", (req, res) => {
    const { email, mot_de_passe } = req.body;
    db.query("SELECT * FROM utilisateurs WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0)
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });

        const user  = results[0];
        const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!valid)
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });

        const token = jwt.sign(
            { id: user.id, nom: user.nom, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        );
        res.json({ token, nom: user.nom, email: user.email });
    });
});

// ══════════════════════════════════════════════════════════════════════════════
//  COMMANDES
// ══════════════════════════════════════════════════════════════════════════════

app.post("/commandes", authMiddleware, (req, res) => {
    const { panier } = req.body;
    if (!panier || panier.length === 0)
        return res.status(400).json({ error: "Panier vide" });

    const total = panier.reduce((acc, item) => acc + item.prix * item.quantite, 0);

    db.query(
        "INSERT INTO commandes (utilisateur_id, total) VALUES (?, ?)",
        [req.user.id, total],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const commandeId = result.insertId;
            const lignes = panier.map(item => [
                commandeId, item.id, item.nom, item.prix, item.quantite
            ]);
            db.query(
                "INSERT INTO lignes_commande (commande_id, piece_id, nom_piece, prix_unitaire, quantite) VALUES ?",
                [lignes],
                (err2) => {
                    if (err2) return res.status(500).json({ error: err2.message });
                    res.json({ message: "Commande enregistrée", commandeId, total });
                }
            );
        }
    );
});

app.get("/commandes", authMiddleware, (req, res) => {
    db.query(
        `SELECT c.id, c.total, c.statut, c.date_commande,
                JSON_ARRAYAGG(
                        JSON_OBJECT('nom', lc.nom_piece, 'prix', lc.prix_unitaire, 'qte', lc.quantite)
                ) AS lignes
         FROM commandes c
                  JOIN lignes_commande lc ON lc.commande_id = c.id
         WHERE c.utilisateur_id = ?
         GROUP BY c.id
         ORDER BY c.date_commande DESC`,
        [req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            results.forEach(r => {
                if (typeof r.lignes === "string") r.lignes = JSON.parse(r.lignes);
            });
            res.json(results);
        }
    );
});

// ══════════════════════════════════════════════════════════════════════════════
//  FACTURE PDF
// ══════════════════════════════════════════════════════════════════════════════

app.get("/facture/:commandeId", authMiddleware, (req, res) => {
    const commandeId = parseInt(req.params.commandeId);
    db.query(
        `SELECT c.id, c.total, c.date_commande, c.statut,
                u.nom AS client_nom, u.email AS client_email,
                lc.nom_piece, lc.prix_unitaire, lc.quantite
         FROM commandes c
                  JOIN utilisateurs u ON u.id = c.utilisateur_id
                  JOIN lignes_commande lc ON lc.commande_id = c.id
         WHERE c.id = ? AND c.utilisateur_id = ?`,
        [commandeId, req.user.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            if (rows.length === 0)
                return res.status(404).json({ error: "Commande introuvable" });

            const commande = rows[0];
            const doc = new PDFDocument({ margin: 50 });
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=facture_${commandeId}.pdf`);
            doc.pipe(res);

            doc.fontSize(22).fillColor("#e65c00").text("Les Bonnes Pièces", { align: "center" });
            doc.fontSize(11).fillColor("#555").text("Dakar, Sénégal  •  lesbnonnespiecesdakar@gmail.com", { align: "center" });
            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#e65c00").lineWidth(2).stroke();
            doc.moveDown();
            doc.fontSize(18).fillColor("#222").text(`FACTURE #${commandeId}`, { align: "right" });
            doc.fontSize(10).fillColor("#555")
                .text(`Date : ${new Date(commande.date_commande).toLocaleDateString("fr-FR")}`, { align: "right" })
                .text(`Statut : ${commande.statut.replace("_", " ").toUpperCase()}`, { align: "right" });
            doc.moveDown();
            doc.fontSize(12).fillColor("#222").text("Facturé à :");
            doc.fontSize(11).fillColor("#444").text(commande.client_nom).text(commande.client_email);
            doc.moveDown(1.5);

            const colX = [50, 260, 380, 470];
            doc.rect(50, doc.y, 500, 22).fill("#e65c00");
            doc.fillColor("#fff").fontSize(11);
            const rowY = doc.y - 18;
            doc.text("Pièce", colX[0], rowY);
            doc.text("Prix unitaire", colX[1], rowY);
            doc.text("Qté", colX[2], rowY);
            doc.text("Sous-total", colX[3], rowY);
            doc.moveDown(0.3);

            let bgToggle = false;
            rows.forEach(ligne => {
                const y = doc.y;
                if (bgToggle) doc.rect(50, y, 500, 20).fill("#fdf0e8");
                bgToggle = !bgToggle;
                doc.fillColor("#222").fontSize(10);
                doc.text(ligne.nom_piece, colX[0], y + 4, { width: 200 });
                doc.text(`${Number(ligne.prix_unitaire).toFixed(2)} €`, colX[1], y + 4);
                doc.text(`${ligne.quantite}`, colX[2], y + 4);
                doc.text(`${(ligne.prix_unitaire * ligne.quantite).toFixed(2)} €`, colX[3], y + 4);
                doc.moveDown(0.5);
            });

            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#ccc").lineWidth(1).stroke();
            doc.moveDown(0.5);
            doc.fontSize(14).fillColor("#e65c00").text(`TOTAL : ${Number(commande.total).toFixed(2)} €`, { align: "right" });
            doc.moveDown(2);
            doc.fontSize(10).fillColor("#999").text("Merci pour votre confiance !", { align: "center" });
            doc.end();
        }
    );
});

app.listen(port, () => console.log(`🚀 Serveur démarré sur http://localhost:${port}`));
