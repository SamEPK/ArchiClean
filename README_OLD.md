# Module Épargne & Investissement - Banque AVENIR

## 📋 Description

Module backend pour la gestion de l'épargne et des investissements en actions pour la Banque AVENIR. Ce projet implémente une **Clean Architecture** avec TypeScript, respectant les principes SOLID et Clean Code.

## 🏗️ Architecture

Le projet suit une architecture en 4 couches :

```
src/
├── domain/              # Couche métier (Entities & Repository Interfaces)
│   ├── entities/        # Entités métier
│   └── repositories/    # Interfaces de repositories
├── application/         # Couche application (Use Cases)
│   └── use-cases/       # Cas d'utilisation métier
├── interface/           # Couche interface (API)
│   ├── fastify/         # Serveur Fastify
│   └── nestjs/          # Serveur NestJS
└── infrastructure/      # Couche infrastructure (Implémentations)
    ├── database/        # Connexion DB
    └── repositories/    # Implémentations des repositories
        ├── in-memory/   # Adaptateur In-Memory
        └── mongodb/     # Adaptateur MongoDB
```

## ✨ Fonctionnalités

### Comptes d'Épargne
- ✅ Création de compte d'épargne
- ✅ Rémunération journalière automatique
- ✅ Calcul des intérêts selon taux en vigueur
- ✅ Opérations de crédit/débit sur compte épargne

### Système d'Investissement
- ✅ Enregistrement d'ordres d'achat d'actions
- ✅ Enregistrement d'ordres de vente d'actions
- ✅ Calcul du prix d'équilibre (carnet d'ordres)
- ✅ Application des frais (1€ par transaction)
- ✅ Gestion du portefeuille d'actions

## 🚀 Installation

### Prérequis
- Node.js >= 18.x
- npm ou yarn
- MongoDB (optionnel, pour l'adaptateur MongoDB)

### Installation des dépendances

```powershell
npm install
```

## 🧪 Tests

Exécuter tous les tests unitaires :

```powershell
npm test
```

Exécuter les tests avec couverture :

```powershell
npm run test
```

La couverture de code cible est **> 80%** pour tous les Use Cases.

## 🏃 Lancer les serveurs

### Serveur Fastify (Port 3000)

```powershell
npm run dev:fastify
```

Le serveur sera accessible à : `http://localhost:3000`

### Serveur NestJS (Port 3001)

```powershell
npm run dev:nestjs
```

Le serveur sera accessible à : `http://localhost:3001`

Documentation Swagger disponible à : `http://localhost:3001/api-docs`

## 📡 API Endpoints

### Comptes d'Épargne

#### Ouvrir un compte d'épargne
```http
POST /api/savings
Content-Type: application/json

{
  "accountId": "acc_123",
  "interestRate": 0.02
}
```

#### Appliquer les intérêts journaliers
```http
POST /api/savings/apply-interest
Content-Type: application/json

{
  "currentDate": "2025-10-16"  // optionnel
}
```

### Actions (Stocks)

#### Obtenir toutes les actions
```http
GET /api/stocks
```

#### Obtenir les actions disponibles
```http
GET /api/stocks/available
```

#### Obtenir une action par ID
```http
GET /api/stocks/:id
```

### Ordres (Orders)

#### Placer un ordre
```http
POST /api/orders
Content-Type: application/json

{
  "userId": "user_123",
  "stockId": "stk_456",
  "type": "BUY",  // ou "SELL"
  "quantity": 10,
  "price": 150.50
}
```

#### Exécuter un ordre
```http
POST /api/orders/:id/execute
Content-Type: application/json

{
  "executionPrice": 150.50
}
```

#### Calculer le prix d'équilibre
```http
GET /api/orders/stock/:stockId/price
```

### Portefeuille

#### Obtenir le portefeuille d'un utilisateur
```http
GET /api/portfolio/:userId
```

## 🗄️ Adaptateurs de Base de Données

### In-Memory (Défaut)
Utilisé par défaut pour le développement et les tests. Aucune configuration requise.

### MongoDB
Pour utiliser MongoDB :

1. Configurer la connexion dans votre code :
```typescript
import { MongoDBConnection } from '@infrastructure/database/MongoDBConnection';

const mongo = MongoDBConnection.getInstance();
await mongo.connect('mongodb://localhost:27017/banque-avenir');
```

2. Remplacer les repositories In-Memory par les repositories MongoDB dans les routes.

## 🧩 Entités Métier

### SavingsAccount
- `id`: Identifiant unique
- `accountId`: Référence au compte bancaire
- `interestRate`: Taux d'intérêt annuel (0-1)
- `lastInterestDate`: Date du dernier calcul d'intérêt
- `createdAt`: Date de création

### Stock
- `id`: Identifiant unique
- `symbol`: Symbole boursier (ex: AAPL)
- `name`: Nom court
- `companyName`: Nom complet de l'entreprise
- `isAvailable`: Disponibilité pour le trading
- `createdAt`: Date de création

### Order
- `id`: Identifiant unique
- `userId`: Identifiant de l'utilisateur
- `stockId`: Identifiant de l'action
- `type`: Type d'ordre (BUY/SELL)
- `quantity`: Quantité d'actions
- `price`: Prix par action
- `status`: Statut (PENDING/EXECUTED/CANCELLED)
- `createdAt`: Date de création
- `executedAt`: Date d'exécution (optionnel)

### Portfolio
- `userId`: Identifiant de l'utilisateur
- `stockId`: Identifiant de l'action
- `quantity`: Quantité possédée
- `averagePurchasePrice`: Prix d'achat moyen

## 📚 Use Cases Implémentés

1. **OpenSavingsAccountUseCase** - Ouvrir un compte d'épargne
2. **ApplyDailyInterestUseCase** - Appliquer les intérêts journaliers
3. **PlaceStockOrderUseCase** - Placer un ordre d'achat/vente
4. **CalculateStockPriceUseCase** - Calculer le prix d'équilibre
5. **ExecuteOrderUseCase** - Exécuter un ordre
6. **GetPortfolioUseCase** - Récupérer le portefeuille

## 🔧 Configuration TypeScript

Le projet utilise TypeScript avec les configurations suivantes :
- **Target**: ES2021
- **Module**: CommonJS
- **Strict mode**: Activé
- **Path aliases**: Configurés pour @domain, @application, @interface, @infrastructure

## 📝 Principes Clean Code Appliqués

- ✅ **SOLID**: Respect des 5 principes
- ✅ **DRY**: Pas de duplication de code
- ✅ **Nommage explicite**: Variables et fonctions en anglais
- ✅ **Fonctions courtes**: < 20 lignes
- ✅ **Tests unitaires**: Couverture > 80%
- ✅ **Séparation des responsabilités**: Architecture en couches

## 🎯 Frameworks Backend

### Fastify
**Avantages:**
- Performance exceptionnelle
- Validation de schéma intégrée
- Plugin ecosystem riche
- TypeScript first-class support

**Port:** 3000

### NestJS
**Avantages:**
- Architecture structurée par défaut
- Dependency Injection native
- Documentation Swagger automatique
- Écosystème complet

**Port:** 3001

## 📦 Dépendances Principales

- **fastify**: Framework web rapide
- **@nestjs/core**: Framework NestJS
- **mongoose**: ODM MongoDB
- **jest**: Framework de tests
- **typescript**: Langage TypeScript

## 👨‍💻 Auteur

**Samuel** - Module Épargne & Investissement

## 📄 Licence

MIT

## 🚀 Prochaines Étapes (Bonus)

- [ ] Implémentation CQRS sur les ordres d'actions
- [ ] Event-Sourcing pour le carnet d'ordres
- [ ] Microservices pour la scalabilité
- [ ] Frontend Angular pour l'interface utilisateur

---

**Note**: Ce projet respecte les exigences du projet Banque AVENIR avec une architecture Clean, 2 adaptateurs de base de données (In-Memory + MongoDB), et 2 frameworks backend (Fastify + NestJS).
