# 🏦 ArchiClean - Système Bancaire avec Clean Architecture# Module Épargne & Investissement - Banque AVENIR



> Application bancaire complète développée avec NestJS et Clean Architecture, incluant gestion d'épargne, investissements, messagerie et authentification sécurisée.## 📋 Description



## 📋 Table des matièresModule backend pour la gestion de l'épargne et des investissements en actions pour la Banque AVENIR. Ce projet implémente une **Clean Architecture** avec TypeScript, respectant les principes SOLID et Clean Code.



- [Fonctionnalités](#-fonctionnalités)## 🏗️ Architecture

- [Architecture](#-architecture)

- [Technologies](#-technologies)Le projet suit une architecture en 4 couches :

- [Installation](#-installation)

- [Configuration](#️-configuration)```

- [Lancement](#-lancement)src/

- [Identifiants de test](#-identifiants-de-test)├── domain/              # Couche métier (Entities & Repository Interfaces)

- [Documentation API](#-documentation-api)│   ├── entities/        # Entités métier

- [Structure du projet](#-structure-du-projet)│   └── repositories/    # Interfaces de repositories

├── application/         # Couche application (Use Cases)

## ✨ Fonctionnalités│   └── use-cases/       # Cas d'utilisation métier

├── interface/           # Couche interface (API)

### 🔐 Authentification & Profils│   ├── fastify/         # Serveur Fastify

- ✅ Inscription avec validation d'email│   └── nestjs/          # Serveur NestJS

- ✅ Connexion/Déconnexion avec JWT└── infrastructure/      # Couche infrastructure (Implémentations)

- ✅ Gestion de sessions avec refresh tokens    ├── database/        # Connexion DB

- ✅ Profils utilisateurs publics/privés    └── repositories/    # Implémentations des repositories

- ✅ Upload d'avatar        ├── in-memory/   # Adaptateur In-Memory

- ✅ Gestion CRUD des profils        └── mongodb/     # Adaptateur MongoDB

- ✅ Recherche d'utilisateurs```



### 💰 Gestion Bancaire## ✨ Fonctionnalités

- ✅ Comptes bancaires multiples

- ✅ Comptes d'épargne avec intérêts### Comptes d'Épargne

- ✅ Gestion de crédits- ✅ Création de compte d'épargne

- ✅ Historique de transactions- ✅ Rémunération journalière automatique

- ✅ Calcul des intérêts selon taux en vigueur

### 📈 Investissements- ✅ Opérations de crédit/débit sur compte épargne

- ✅ Portefeuille d'investissement

- ✅ Trading d'actions### Système d'Investissement

- ✅ Ordres d'achat/vente- ✅ Enregistrement d'ordres d'achat d'actions

- ✅ Calcul de prix en temps réel- ✅ Enregistrement d'ordres de vente d'actions

- ✅ Calcul du prix d'équilibre (carnet d'ordres)

### 💬 Messagerie- ✅ Application des frais (1€ par transaction)

- ✅ Messages privés- ✅ Gestion du portefeuille d'actions

- ✅ Groupes de discussion

- ✅ Messagerie temps réel (WebSocket)## 🚀 Installation

- ✅ Historique des conversations

### Prérequis

## 🏗️ Architecture- Node.js >= 18.x

- npm ou yarn

Le projet suit les principes de **Clean Architecture** avec une séparation claire des responsabilités :- MongoDB (optionnel, pour l'adaptateur MongoDB)



```### Installation des dépendances

src/

├── domain/               # Couche Domaine (Entités & Repositories)```powershell

│   ├── entities/        # Entités métiernpm install

│   └── repositories/    # Interfaces des repositories```

│

├── application/         # Couche Application (Use Cases)## 🧪 Tests

│   └── use-cases/       # Cas d'utilisation métier

│Exécuter tous les tests unitaires :

├── infrastructure/      # Couche Infrastructure (Implémentations)

│   ├── database/        # Connexion DB```powershell

│   ├── repositories/    # Implémentation repositoriesnpm test

│   │   ├── mongodb/     # MongoDB repositories```

│   │   └── in-memory/   # Repositories en mémoire (tests)

│   └── services/        # Services techniquesExécuter les tests avec couverture :

│       ├── EmailService.ts

│       ├── HashService.ts```powershell

│       └── FileUploadService.tsnpm run test

│```

└── interface/           # Couche Interface (Présentation)

    ├── nestjs/          # API NestJSLa couverture de code cible est **> 80%** pour tous les Use Cases.

    │   ├── controllers/ # Contrôleurs HTTP

    │   ├── modules/     # Modules NestJS## 🏃 Lancer les serveurs

    │   ├── guards/      # Guards d'authentification

    │   ├── strategies/  # Stratégies Passport### Serveur Fastify (Port 3000)

    │   ├── decorators/  # Décorateurs personnalisés

    │   ├── dto/         # Data Transfer Objects```powershell

    │   └── gateways/    # WebSocket gatewaysnpm run dev:fastify

    └── fastify/         # Alternative Fastify```

```

Le serveur sera accessible à : `http://localhost:3000`

### Principes respectés

### Serveur NestJS (Port 3001)

- **Inversion de dépendances** : Les couches externes dépendent des couches internes

- **Séparation des responsabilités** : Chaque couche a un rôle bien défini```powershell

- **Testabilité** : Architecture facilitant les tests unitairesnpm run dev:nestjs

- **Indépendance du framework** : Le domaine métier est isolé des frameworks```



## 🛠️ TechnologiesLe serveur sera accessible à : `http://localhost:3001`



### BackendDocumentation Swagger disponible à : `http://localhost:3001/api-docs`

- **NestJS** - Framework Node.js progressif

- **TypeScript** - Langage typé## 📡 API Endpoints

- **MongoDB** - Base de données NoSQL

- **Mongoose** - ODM pour MongoDB### Comptes d'Épargne

- **Passport & JWT** - Authentification

- **Socket.io** - WebSocket pour temps réel#### Ouvrir un compte d'épargne

```http

### SécuritéPOST /api/savings

- **bcryptjs** - Hachage des mots de passeContent-Type: application/json

- **JWT** - Tokens d'authentification

- **class-validator** - Validation des données{

- **Guards & Strategies** - Protection des routes  "accountId": "acc_123",

  "interestRate": 0.02

### Infrastructure}

- **Docker & Docker Compose** - Containerisation```

- **Nodemailer** - Envoi d'emails

- **Multer** - Upload de fichiers#### Appliquer les intérêts journaliers

```http

## 📦 InstallationPOST /api/savings/apply-interest

Content-Type: application/json

### Prérequis

{

- **Node.js** >= 20.x  "currentDate": "2025-10-16"  // optionnel

- **npm** >= 9.x}

- **Docker** et **Docker Compose** (optionnel mais recommandé)```



### Installation locale### Actions (Stocks)



```bash#### Obtenir toutes les actions

# Cloner le repository```http

git clone https://github.com/SamEPK/ArchiClean.gitGET /api/stocks

cd ArchiClean```



# Installer les dépendances#### Obtenir les actions disponibles

npm install```http

GET /api/stocks/available

# Copier le fichier d'environnement```

cp .env.example .env

#### Obtenir une action par ID

# Éditer le fichier .env avec vos propres valeurs```http

```GET /api/stocks/:id

```

### Installation avec Docker

### Ordres (Orders)

```bash

# Démarrer tous les services (MongoDB + Application)#### Placer un ordre

npm run docker:up```http

POST /api/orders

# Voir les logsContent-Type: application/json

npm run docker:logs

{

# Arrêter les services  "userId": "user_123",

npm run docker:down  "stockId": "stk_456",

```  "type": "BUY",  // ou "SELL"

  "quantity": 10,

## ⚙️ Configuration  "price": 150.50

}

Créez un fichier `.env` à la racine du projet :```



```env#### Exécuter un ordre

# Base de données```http

MONGODB_URI=mongodb://admin:admin123@localhost:27017/archiclean?authSource=adminPOST /api/orders/:id/execute

Content-Type: application/json

# JWT Configuration

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024{

JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-2024  "executionPrice": 150.50

JWT_EXPIRATION=1h}

JWT_REFRESH_EXPIRATION=7d```



# Email Configuration (SMTP)#### Calculer le prix d'équilibre

EMAIL_HOST=smtp.gmail.com```http

EMAIL_PORT=587GET /api/orders/stock/:stockId/price

EMAIL_USER=noreply@archiclean.com```

EMAIL_PASSWORD=your-email-password-here

EMAIL_FROM=ArchiClean <noreply@archiclean.com>### Portefeuille



# Application#### Obtenir le portefeuille d'un utilisateur

NODE_ENV=development```http

PORT=3000GET /api/portfolio/:userId

APP_URL=http://localhost:3000```



# Upload Configuration## 🗄️ Adaptateurs de Base de Données

UPLOAD_DIR=./uploads

MAX_FILE_SIZE=5242880### In-Memory (Défaut)

ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webpUtilisé par défaut pour le développement et les tests. Aucune configuration requise.

```

### MongoDB

## 🚀 LancementPour utiliser MongoDB :



### Démarrage avec MongoDB local1. Configurer la connexion dans votre code :

```typescript

```bashimport { MongoDBConnection } from '@infrastructure/database/MongoDBConnection';

# 1. Assurez-vous que MongoDB tourne localement

# OU démarrez MongoDB avec Dockerconst mongo = MongoDBConnection.getInstance();

docker-compose up -d mongodbawait mongo.connect('mongodb://localhost:27017/banque-avenir');

```

# 2. Générer les données de test

npm run seed2. Remplacer les repositories In-Memory par les repositories MongoDB dans les routes.



# 3. Lancer l'application en mode développement## 🧩 Entités Métier

npm run dev

### SavingsAccount

# Application disponible sur http://localhost:3000- `id`: Identifiant unique

```- `accountId`: Référence au compte bancaire

- `interestRate`: Taux d'intérêt annuel (0-1)

### Démarrage avec Docker (tout-en-un)- `lastInterestDate`: Date du dernier calcul d'intérêt

- `createdAt`: Date de création

```bash

# Démarrer MongoDB + Application### Stock

npm run docker:up- `id`: Identifiant unique

- `symbol`: Symbole boursier (ex: AAPL)

# Dans un autre terminal, générer les données- `name`: Nom court

npm run seed- `companyName`: Nom complet de l'entreprise

- `isAvailable`: Disponibilité pour le trading

# L'application est disponible sur http://localhost:3000- `createdAt`: Date de création

```

### Order

### Commandes disponibles- `id`: Identifiant unique

- `userId`: Identifiant de l'utilisateur

```bash- `stockId`: Identifiant de l'action

npm run dev              # Lancer en mode développement (NestJS)- `type`: Type d'ordre (BUY/SELL)

npm run dev:fastify      # Lancer avec Fastify- `quantity`: Quantité d'actions

npm start                # Lancer en mode production- `price`: Prix par action

npm run build            # Compiler TypeScript- `status`: Statut (PENDING/EXECUTED/CANCELLED)

npm test                 # Lancer les tests- `createdAt`: Date de création

npm run seed             # Générer les données de test- `executedAt`: Date d'exécution (optionnel)

npm run docker:up        # Démarrer Docker Compose

npm run docker:down      # Arrêter Docker Compose### Portfolio

npm run docker:logs      # Voir les logs Docker- `userId`: Identifiant de l'utilisateur

```- `stockId`: Identifiant de l'action

- `quantity`: Quantité possédée

## 🔑 Identifiants de test- `averagePurchasePrice`: Prix d'achat moyen



Après avoir exécuté `npm run seed`, vous pouvez utiliser ces comptes :## 📚 Use Cases Implémentés



### 👨‍💼 Administrateur1. **OpenSavingsAccountUseCase** - Ouvrir un compte d'épargne

```2. **ApplyDailyInterestUseCase** - Appliquer les intérêts journaliers

Email:    admin@archiclean.com3. **PlaceStockOrderUseCase** - Placer un ordre d'achat/vente

Password: Admin123!4. **CalculateStockPriceUseCase** - Calculer le prix d'équilibre

Rôle:     ADMIN5. **ExecuteOrderUseCase** - Exécuter un ordre

```6. **GetPortfolioUseCase** - Récupérer le portefeuille



### 👥 Utilisateurs de test## 🔧 Configuration TypeScript



**Développeur (USER)**Le projet utilise TypeScript avec les configurations suivantes :

```- **Target**: ES2021

Email:    quentin.dev@archiclean.com- **Module**: CommonJS

Password: Quentin123!- **Strict mode**: Activé

```- **Path aliases**: Configurés pour @domain, @application, @interface, @infrastructure



**Gestionnaire (USER)**## 📝 Principes Clean Code Appliqués

```

Email:    marie.dupont@archiclean.com- ✅ **SOLID**: Respect des 5 principes

Password: Marie123!- ✅ **DRY**: Pas de duplication de code

```- ✅ **Nommage explicite**: Variables et fonctions en anglais

- ✅ **Fonctions courtes**: < 20 lignes

**Conseiller (ADVISOR)**- ✅ **Tests unitaires**: Couverture > 80%

```- ✅ **Séparation des responsabilités**: Architecture en couches

Email:    jean.martin@archiclean.com

Password: Jean123!## 🎯 Frameworks Backend

```

### Fastify

**Directrice (DIRECTOR)****Avantages:**

```- Performance exceptionnelle

Email:    sophie.bernard@archiclean.com- Validation de schéma intégrée

Password: Sophie123!- Plugin ecosystem riche

```- TypeScript first-class support



**Investisseur (USER)****Port:** 3000

```

Email:    pierre.dubois@archiclean.com### NestJS

Password: Pierre123!**Avantages:**

```- Architecture structurée par défaut

- Dependency Injection native

**Cliente (USER)**- Documentation Swagger automatique

```- Écosystème complet

Email:    julie.leroy@archiclean.com

Password: Julie123!**Port:** 3001

```

## 📦 Dépendances Principales

> ⚠️ **Important** : Tous ces comptes sont **pré-confirmés** (email vérifié) pour faciliter les tests.

- **fastify**: Framework web rapide

## 📚 Documentation API- **@nestjs/core**: Framework NestJS

- **mongoose**: ODM MongoDB

### Authentification- **jest**: Framework de tests

- **typescript**: Langage TypeScript

#### `POST /auth/register`

Inscription d'un nouvel utilisateur## 👨‍💻 Auteur



**Body:****Samuel** - Module Épargne & Investissement

```json

{## 📄 Licence

  "email": "user@example.com",

  "password": "SecureP@ss123",MIT

  "firstName": "John",

  "lastName": "Doe",## 🚀 Prochaines Étapes (Bonus)

  "phoneNumber": "+33 6 12 34 56 78",

  "isPublic": true- [ ] Implémentation CQRS sur les ordres d'actions

}- [ ] Event-Sourcing pour le carnet d'ordres

```- [ ] Microservices pour la scalabilité

- [ ] Frontend Angular pour l'interface utilisateur

#### `POST /auth/login`

Connexion utilisateur---



**Body:****Note**: Ce projet respecte les exigences du projet Banque AVENIR avec une architecture Clean, 2 adaptateurs de base de données (In-Memory + MongoDB), et 2 frameworks backend (Fastify + NestJS).

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isEmailConfirmed": true
  }
}
```

#### `GET /auth/confirm-email?token=xxx`
Confirmation d'email

#### `POST /auth/refresh`
Rafraîchir le token

#### `POST /auth/logout`
Déconnexion (nécessite authentification)

#### `GET /auth/me`
Obtenir ses informations (nécessite authentification)

### Profils Utilisateurs

#### `GET /users/profile`
Obtenir son profil (nécessite authentification)

#### `PUT /users/profile`
Mettre à jour son profil

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "Passionné de finance",
  "isPublic": true
}
```

#### `POST /users/avatar`
Upload d'avatar (multipart/form-data)

**Form Data:**
- `file`: Image (JPEG, PNG, GIF, WebP) max 5MB

#### `GET /users/public?skip=0&limit=20`
Liste des profils publics

#### `GET /users/search?query=john&skip=0&limit=20`
Recherche d'utilisateurs

#### `GET /users/:id`
Obtenir un profil spécifique

### Exigences de sécurité

#### Mot de passe
- Minimum 8 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre
- Au moins un caractère spécial (!@#$%^&*)

#### Tokens JWT
- Access token : 1 heure
- Refresh token : 7 jours

## 📁 Structure du projet

```
ArchiClean/
├── src/
│   ├── domain/                   # Couche Domaine
│   │   ├── entities/
│   │   │   ├── User.ts          # Entité utilisateur
│   │   │   ├── BankAccount.ts
│   │   │   ├── Stock.ts
│   │   │   └── ...
│   │   └── repositories/
│   │       └── IUserRepository.ts
│   │
│   ├── application/              # Couche Application
│   │   └── use-cases/
│   │       ├── RegisterUserUseCase.ts
│   │       ├── LoginUserUseCase.ts
│   │       ├── ConfirmUserEmailUseCase.ts
│   │       ├── UpdateProfileUseCase.ts
│   │       └── ...
│   │
│   ├── infrastructure/           # Couche Infrastructure
│   │   ├── database/
│   │   │   └── MongoDBConnection.ts
│   │   ├── repositories/
│   │   │   └── mongodb/
│   │   │       ├── UserModel.ts
│   │   │       └── MongoUserRepository.ts
│   │   └── services/
│   │       ├── EmailService.ts
│   │       ├── HashService.ts
│   │       └── FileUploadService.ts
│   │
│   └── interface/                # Couche Interface
│       └── nestjs/
│           ├── controllers/
│           │   ├── auth.controller.ts
│           │   └── user.controller.ts
│           ├── modules/
│           │   ├── auth.module.ts
│           │   └── app.module.ts
│           ├── guards/
│           │   ├── jwt-auth.guard.ts
│           │   └── roles.guard.ts
│           ├── strategies/
│           │   ├── jwt.strategy.ts
│           │   └── local.strategy.ts
│           ├── decorators/
│           │   ├── current-user.decorator.ts
│           │   └── roles.decorator.ts
│           ├── dto/
│           │   ├── auth.dto.ts
│           │   └── user.dto.ts
│           └── main.ts
│
├── scripts/
│   └── seed.ts                   # Script de génération de données
│
├── uploads/                      # Dossier des fichiers uploadés
│   └── avatars/
│
├── .env                          # Variables d'environnement
├── docker-compose.yml            # Configuration Docker
├── Dockerfile                    # Image Docker
├── package.json                  # Dépendances
├── tsconfig.json                 # Configuration TypeScript
└── README.md                     # Ce fichier
```

## 🔒 Sécurité

- ✅ Mots de passe hashés avec bcrypt
- ✅ Authentification JWT avec refresh tokens
- ✅ Validation des données avec class-validator
- ✅ Protection CORS
- ✅ Guards NestJS pour les routes protégées
- ✅ Gestion des rôles (RBAC)
- ✅ Validation des fichiers uploadés

## 🤝 Contribution

Ce projet est développé dans le cadre d'un cours d'Architecture Logicielle à l'ESGI.

### Équipe

- **Quentin** - Architecture & Authentification
- **Samuel** - Épargne & Investissement
- **[Autres membres]** - [Leurs modules]

## 📝 License

MIT

## 🆘 Support

Pour toute question ou problème :
1. Vérifier la documentation
2. Consulter les identifiants de test
3. Vérifier que MongoDB tourne
4. Consulter les logs : `npm run docker:logs`

---

**Développé avec ❤️ par l'équipe ArchiClean - ESGI 2025**
