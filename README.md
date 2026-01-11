# 🏦 Banque AVENIR - Système Bancaire & Investissement (Clean Architecture)

> Application bancaire complète développée avec **NestJS (Backend)** et **Next.js (Frontend)**, appliquant strictement la **Clean Architecture** et les principes S.O.L.I.D.

## 🚀 Démarrage Rapide

### 1️⃣ Installation
Assurez-vous d'avoir **Node.js** (v18+) installé.

```bash
# Installer les dépendances globales
npm install

# Installer les dépendances du frontend
cd frontend
npm install
cd ..
```

### 2️⃣ Lancement du Projet

Vous devez lancer **deux terminaux séparés** :

**Terminal 1 : Backend (API NestJS)**
```bash
# À la racine du projet
npm run dev
```
_L'API sera accessible sur http://localhost:3000_

**Terminal 2 : Frontend (Next.js)** (Optionnel si vous n'utilisez que l'API)
```bash
cd frontend
npm run dev
```
_Le site sera accessible sur http://localhost:3001_

---

## 🔑 Identifiants de Test

Voici les comptes pré-configurés pour tester les différents rôles de l'application :

### 👨‍💼 Directeur (Admin)
Accès complet au tableau de bord de direction (gestion des taux, validation des comptes).
- **Email** : `directeur@avenir.com`
- **Mot de passe** : `DirecteurSecure123!`
<!-- - **URL Dashboard** : http://localhost:3001/fr/director (Frontend React) -->

### 👔 Conseiller Bancaire
Gestion des portefeuilles clients et messagerie.
- **Email** : `conseiller1@banque.com`
- **Mot de passe** : `password123`

### 👤 Client (Utilisateur)
Accès aux comptes, épargne et investissements.
- **Email** : `client1@test.com`
- **Mot de passe** : `password123`

---

## 🏗️ Architecture Technique

Le projet est divisé en deux parties distinctes :

### 1. Backend (Clean Architecture)
Structure en couches concentriques pour une indépendance totale du framework et de la base de données.
- **Domain** : Entités métier et règles d'entreprise pures.
- **Application** : Cas d'utilisation (Use Cases) orchestrant le métier.
- **Infrastructure** : Implémentations concrètes (BDD In-Memory/MongoDB, Services externes).
- **Interface** : Points d'entrée (Contrôleurs NestJS).

### 2. Frontend (Next.js 14)
Interface moderne utilisant le Router App et Server Components.
- **Next-Intl** : Internationalisation complète (FR/EN).
- **TailwindCSS** : Design responsive.
- **Server Actions** : Gestion optimisée des requêtes.

---

## 📚 Documentation API

La documentation Swagger complète est disponible une fois le backend lancé :
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

---

## 🧪 Tests

```bash
# Lancer les tests unitaires et d'intégration du backend
npm test
```
