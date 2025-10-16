# API Documentation - Module Épargne & Investissement

## Table des Matières
1. [Authentification](#authentification)
2. [Comptes d'Épargne](#comptes-dépargne)
3. [Actions](#actions)
4. [Ordres](#ordres)
5. [Portefeuille](#portefeuille)
6. [Codes d'Erreur](#codes-derreur)

## Authentification

*Note: L'authentification sera intégrée avec le module de Fouad (Client & Authentification)*

## Comptes d'Épargne

### Créer un compte d'épargne

**Endpoint:** `POST /api/savings`

**Description:** Ouvre un nouveau compte d'épargne pour un compte bancaire existant.

**Request Body:**
```json
{
  "accountId": "acc_123456",
  "interestRate": 0.02
}
```

**Paramètres:**
- `accountId` (string, required): ID du compte bancaire
- `interestRate` (number, required): Taux d'intérêt annuel (entre 0 et 1)

**Response Success (201):**
```json
{
  "id": "sa_1729123456_abc123",
  "accountId": "acc_123456",
  "interestRate": 0.02,
  "lastInterestDate": "2025-10-16T00:00:00.000Z",
  "createdAt": "2025-10-16T00:00:00.000Z"
}
```

**Response Error (400):**
```json
{
  "error": "Savings account already exists for this account"
}
```

---

### Appliquer les intérêts journaliers

**Endpoint:** `POST /api/savings/apply-interest`

**Description:** Applique les intérêts journaliers à tous les comptes d'épargne éligibles.

**Request Body:**
```json
{
  "currentDate": "2025-10-16T00:00:00.000Z"
}
```

**Paramètres:**
- `currentDate` (string, optional): Date de référence (par défaut: date actuelle)

**Response Success (200):**
```json
{
  "accountsUpdated": 15,
  "totalInterestApplied": 125.50
}
```

---

## Actions

### Lister toutes les actions

**Endpoint:** `GET /api/stocks`

**Description:** Récupère la liste de toutes les actions (disponibles et indisponibles).

**Response Success (200):**
```json
[
  {
    "id": "stk_1",
    "symbol": "AAPL",
    "name": "Apple",
    "companyName": "Apple Inc.",
    "isAvailable": true,
    "createdAt": "2025-10-16T00:00:00.000Z"
  },
  {
    "id": "stk_2",
    "symbol": "GOOGL",
    "name": "Google",
    "companyName": "Alphabet Inc.",
    "isAvailable": true,
    "createdAt": "2025-10-16T00:00:00.000Z"
  }
]
```

---

### Lister les actions disponibles

**Endpoint:** `GET /api/stocks/available`

**Description:** Récupère uniquement les actions disponibles pour le trading.

**Response Success (200):**
```json
[
  {
    "id": "stk_1",
    "symbol": "AAPL",
    "name": "Apple",
    "companyName": "Apple Inc.",
    "isAvailable": true,
    "createdAt": "2025-10-16T00:00:00.000Z"
  }
]
```

---

### Obtenir une action par ID

**Endpoint:** `GET /api/stocks/:id`

**Description:** Récupère les détails d'une action spécifique.

**Paramètres URL:**
- `id` (string): ID de l'action

**Response Success (200):**
```json
{
  "id": "stk_1",
  "symbol": "AAPL",
  "name": "Apple",
  "companyName": "Apple Inc.",
  "isAvailable": true,
  "createdAt": "2025-10-16T00:00:00.000Z"
}
```

**Response Error (404):**
```json
{
  "error": "Stock not found"
}
```

---

## Ordres

### Placer un ordre d'achat/vente

**Endpoint:** `POST /api/orders`

**Description:** Place un nouvel ordre d'achat ou de vente d'actions.

**Request Body:**
```json
{
  "userId": "user_123",
  "stockId": "stk_1",
  "type": "BUY",
  "quantity": 10,
  "price": 150.50
}
```

**Paramètres:**
- `userId` (string, required): ID de l'utilisateur
- `stockId` (string, required): ID de l'action
- `type` (string, required): Type d'ordre ("BUY" ou "SELL")
- `quantity` (number, required): Quantité d'actions (entier positif)
- `price` (number, required): Prix par action (positif)

**Response Success (201):**
```json
{
  "id": "ord_1729123456_xyz789",
  "userId": "user_123",
  "stockId": "stk_1",
  "type": "BUY",
  "quantity": 10,
  "price": 150.50,
  "status": "PENDING",
  "createdAt": "2025-10-16T00:00:00.000Z"
}
```

**Response Error (400):**
```json
{
  "error": "Stock not found"
}
```

```json
{
  "error": "Stock is not available for trading"
}
```

---

### Exécuter un ordre

**Endpoint:** `POST /api/orders/:id/execute`

**Description:** Exécute un ordre en attente et met à jour le portefeuille.

**Paramètres URL:**
- `id` (string): ID de l'ordre

**Request Body:**
```json
{
  "executionPrice": 150.50
}
```

**Paramètres:**
- `executionPrice` (number, required): Prix d'exécution

**Response Success (200):**
```json
{
  "orderId": "ord_1729123456_xyz789",
  "executed": true,
  "message": "Order executed successfully at price 150.5"
}
```

**Response Error (400):**
```json
{
  "error": "Order not found"
}
```

```json
{
  "error": "Order is not in pending status"
}
```

---

### Calculer le prix d'équilibre

**Endpoint:** `GET /api/orders/stock/:stockId/price`

**Description:** Calcule le prix d'équilibre entre les ordres d'achat et de vente pour une action.

**Paramètres URL:**
- `stockId` (string): ID de l'action

**Response Success (200):**
```json
{
  "equilibriumPrice": 147.50,
  "matchableVolume": 100,
  "buyOrders": 5,
  "sellOrders": 3
}
```

**Note:** Si aucun équilibre n'est trouvé, `equilibriumPrice` sera `null` et `matchableVolume` sera `0`.

---

## Portefeuille

### Obtenir le portefeuille d'un utilisateur

**Endpoint:** `GET /api/portfolio/:userId`

**Description:** Récupère le portefeuille d'actions d'un utilisateur.

**Paramètres URL:**
- `userId` (string): ID de l'utilisateur

**Response Success (200):**
```json
{
  "userId": "user_123",
  "items": [
    {
      "stockId": "stk_1",
      "stockSymbol": "AAPL",
      "stockName": "Apple",
      "quantity": 10,
      "averagePurchasePrice": 150.50
    },
    {
      "stockId": "stk_2",
      "stockSymbol": "GOOGL",
      "stockName": "Google",
      "quantity": 5,
      "averagePurchasePrice": 2800.00
    }
  ],
  "totalValue": 0,
  "totalProfit": 0
}
```

---

## Codes d'Erreur

### HTTP Status Codes

- **200 OK**: Requête réussie
- **201 Created**: Ressource créée avec succès
- **400 Bad Request**: Erreur dans les paramètres de la requête
- **404 Not Found**: Ressource non trouvée
- **500 Internal Server Error**: Erreur serveur

### Messages d'Erreur Communs

#### Comptes d'Épargne
- `"Savings account already exists for this account"`: Un compte d'épargne existe déjà
- `"Interest rate must be between 0 and 1"`: Taux d'intérêt invalide

#### Actions
- `"Stock not found"`: Action introuvable
- `"Stock is not available for trading"`: Action non disponible

#### Ordres
- `"Order not found"`: Ordre introuvable
- `"Order is not in pending status"`: Ordre déjà exécuté ou annulé
- `"Quantity must be greater than 0"`: Quantité invalide
- `"Price must be greater than 0"`: Prix invalide

#### Portefeuille
- `"Cannot remove more stocks than available"`: Vente impossible (quantité insuffisante)

---

## Calcul des Frais

Tous les ordres (achat et vente) ont des frais fixes de **1€ par transaction**.

**Calcul du coût total d'un ordre d'achat:**
```
Coût total = (Quantité × Prix) + 1€
```

**Exemple:**
- Achat de 10 actions à 150€ = (10 × 150) + 1 = **1501€**

---

## Notes Techniques

### Format des Dates
Toutes les dates sont au format ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`

### Format des IDs
- Savings Account: `sa_[timestamp]_[random]`
- Order: `ord_[timestamp]_[random]`

### Calcul des Intérêts
Les intérêts sont calculés quotidiennement selon la formule:
```
Intérêt journalier = Taux annuel / 365 × Nombre de jours
```

### Prix d'Équilibre
Le prix d'équilibre est calculé comme la moyenne entre le prix d'achat le plus élevé et le prix de vente le plus bas:
```
Prix d'équilibre = (Prix achat max + Prix vente min) / 2
```
