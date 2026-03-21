# 🔧 Les Bonnes Pièces — E-commerce Pièces Automobiles

Application web full-stack de vente de pièces automobiles avec authentification, panier et factures PDF.

## 🛠️ Stack technique
- **Frontend** : HTML, CSS, Vanilla JS (ES Modules)
- **Backend** : Node.js + Express.js
- **Base de données** : MySQL (mysql2)
- **Auth** : JWT (jsonwebtoken) + bcryptjs
- **PDF** : pdfkit
- **UI** : Bootstrap 5 + SweetAlert2

## 🚀 Installation & démarrage

### 1. Cloner le projet
```bash
git clone https://github.com/ton-username/les-bonnes-pieces.git
cd les-bonnes-pieces
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Créer la base de données MySQL
```bash
mysql -u root -p < files_v2.sql
```

### 4. Démarrer l'API
```bash
node server.js
```

### 5. Ouvrir le frontend
Ouvre `index.html` dans le navigateur (ou utilise Live Server sur VS Code).

## ✨ Fonctionnalités

| Feature | Description |
|---------|-------------|
| 📋 Catalogue | Affichage des pièces avec filtres et tri |
| ⭐ Avis | Système de notation et commentaires par pièce |
| 🔐 Auth | Inscription / Connexion avec JWT + bcrypt |
| 🛒 Panier | Gestion du panier en localStorage |
| 📦 Commande | Validation de commande persistée en BDD |
| 📄 Facture PDF | Génération et téléchargement de facture PDF |

## 📁 Structure du projet
```
├── server.js          # API REST (Express)
├── index.html         # Page catalogue principale
├── login.html         # Page connexion / inscription
├── commandes.html     # Historique des commandes
├── pieces.js          # Logique principale frontend
├── functions.js       # Génération des cartes pièces
├── panier.js          # Gestion du panier
├── auth.js            # Authentification frontend
├── avis.js            # Gestion des avis
├── styles.css         # Styles
└── files_v2.sql       # Schéma BDD complet
```
