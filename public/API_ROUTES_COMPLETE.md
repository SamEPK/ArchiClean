# 📋 Liste Complète des Routes API - Banque AVENIR

## 🔐 Authentication (`/auth`)

### POST /auth/register
Inscription d'un nouvel utilisateur
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

### POST /auth/login
Connexion utilisateur
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### GET /auth/confirm-email?token=xxx
Confirmer l'email

### POST /auth/refresh
Rafraîchir le token
```json
{
  "refreshToken": "your-refresh-token"
}
```

### POST /auth/logout
Déconnexion (nécessite JWT)

### GET /auth/me
Profil utilisateur courant (nécessite JWT)

---

## 👤 Users (`/users`)

### GET /users/profile
Mon profil (nécessite JWT)

### PUT /users/profile
Mettre à jour mon profil (nécessite JWT)
```json
{
  "firstName": "Jean-Pierre",
  "lastName": "Martin",
  "bio": "Passionné d'investissement"
}
```

### POST /users/avatar
Upload d'avatar (nécessite JWT, multipart/form-data)

### GET /users/public?skip=0&limit=20
Liste des profils publics

### GET /users/search?query=jean
Rechercher des utilisateurs

### GET /users/:id
Voir un profil utilisateur

---

## 👥 Clients (`/clients`)

### POST /clients/register
Inscription client
```json
{
  "email": "client@example.com",
  "password": "SecurePass123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phoneNumber": "+33612345678"
}
```

### GET /clients/confirm-email?token=xxx
Confirmer l'email client

### POST /clients/login
Authentification client
```json
{
  "email": "client@example.com",
  "password": "SecurePass123"
}
```

### POST /clients/:clientId/accounts
Créer un compte bancaire
```json
{
  "accountName": "Mon compte principal",
  "initialBalance": 1000,
  "currency": "EUR"
}
```

### GET /clients/:clientId/accounts?includeInactive=true
Lister les comptes bancaires

### PUT /clients/:clientId/accounts/:accountId
Modifier le nom d'un compte
```json
{
  "accountName": "Mon compte épargne"
}
```

### DELETE /clients/:clientId/accounts/:accountId
Supprimer un compte bancaire

---

## 📈 Stocks (`/stocks`)

### GET /stocks
Lister toutes les actions

### GET /stocks/available
Actions disponibles uniquement

### GET /stocks/:id
Détails d'une action

---

## 📊 Orders (`/orders`)

### POST /orders
Placer un ordre
```json
{
  "clientId": "client-123",
  "stockSymbol": "AAPL",
  "orderType": "buy",
  "quantity": 10,
  "price": 150.50
}
```

### POST /orders/:id/execute
Exécuter un ordre
```json
{
  "executionPrice": 150.75
}
```

### GET /orders/stock/:stockId/price
Calculer le prix d'équilibre

---

## 💼 Portfolio (`/portfolio`)

### GET /portfolio/:userId
Récupérer le portfolio d'un utilisateur

---

## 💰 Savings (`/savings`)

### POST /savings
Ouvrir un compte d'épargne
```json
{
  "clientId": "client-123",
  "sourceAccountId": "account-123",
  "initialAmount": 1000
}
```

### POST /savings/apply-interest
Appliquer les intérêts quotidiens
```json
{
  "currentDate": "2024-01-15"
}
```

---

## 💳 Transactions (`/transactions`)

### POST /transactions/deposit
Déposer des fonds
```json
{
  "accountId": "account-123",
  "amount": 500,
  "description": "Dépôt initial"
}
```

### POST /transactions/withdraw
Retirer des fonds
```json
{
  "accountId": "account-123",
  "amount": 100,
  "description": "Retrait DAB"
}
```

### POST /transactions/transfer
Transférer des fonds
```json
{
  "fromAccountId": "account-123",
  "toAccountId": "account-456",
  "amount": 50,
  "description": "Remboursement"
}
```

### GET /transactions/account/:accountId?limit=50
Historique des transactions d'un compte

---

## 💼 Advisors (`/advisors`)

### POST /advisors/register
Inscription conseiller
```json
{
  "email": "conseiller@banque.com",
  "password": "SecurePass123",
  "firstName": "Marie",
  "lastName": "Martin"
}
```

### POST /advisors/login
Authentification conseiller
```json
{
  "email": "conseiller@banque.com",
  "password": "SecurePass123"
}
```

### POST /advisors/credits
Octroyer un crédit (nécessite AdvisorAuth)
```json
{
  "clientId": "client-123",
  "amount": 20000,
  "annualRate": 3.2,
  "insuranceRate": 0.3,
  "durationMonths": 60
}
```

### GET /advisors/conversations/open
Lister les conversations ouvertes (nécessite AdvisorAuth)

### POST /advisors/conversations/:conversationId/reply
Répondre à une conversation (nécessite AdvisorAuth)
```json
{
  "content": "Bonjour, je prends en charge votre demande."
}
```

### POST /advisors/conversations/:conversationId/assign
Prendre en charge une conversation (nécessite AdvisorAuth)

### POST /advisors/conversations/:conversationId/transfer
Transférer une conversation (nécessite AdvisorAuth)
```json
{
  "toAdvisorId": "advisor-456"
}
```

### GET /advisors/clients/:clientId/credits
Lister les crédits d'un client (nécessite AdvisorAuth)

---

## ⭐ Director (`/director`)

Toutes les routes nécessitent JWT avec rôle DIRECTOR

### POST /director/stocks
Créer une action
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "companyName": "Apple Inc.",
  "isAvailable": true
}
```

### PUT /director/stocks/:stockId
Modifier une action
```json
{
  "name": "Apple Inc. - Updated",
  "companyName": "Apple Corporation",
  "isAvailable": false
}
```

### DELETE /director/stocks/:stockId
Supprimer une action

### PUT /director/stocks/:stockId/availability
Activer/Désactiver une action
```json
{
  "isAvailable": true
}
```

### PUT /director/savings/interest-rate
Modifier le taux d'intérêt d'épargne
```json
{
  "interestRate": 0.03
}
```

### POST /director/clients
Créer un compte client
```json
{
  "email": "client@example.com",
  "password": "SecurePass123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phoneNumber": "+33612345678"
}
```

### PUT /director/clients/:clientId
Modifier un client
```json
{
  "email": "newemail@example.com",
  "password": "NewPass123",
  "firstName": "Jean-Pierre",
  "lastName": "Martin",
  "phoneNumber": "+33698765432"
}
```

### DELETE /director/clients/:clientId
Supprimer un client

### PUT /director/clients/:clientId/ban
Bannir/Débannir un client
```json
{
  "banned": true
}
```

---

## 💬 Messaging Realtime (`/realtime`)

Toutes les routes nécessitent JWT

### Messages Privés

#### POST /realtime/messages/send
Envoyer un message privé
```json
{
  "senderId": "user-123",
  "receiverId": "user-456",
  "content": "Bonjour, comment vas-tu ?"
}
```

#### GET /realtime/messages/conversation/:userId/:otherUserId?limit=50
Historique de conversation

#### PUT /realtime/messages/:messageId/read
Marquer un message comme lu
```json
{
  "userId": "user-123"
}
```

#### GET /realtime/messages/unread/:userId
Compter les messages non lus

### Friendships (Amis)

#### POST /realtime/friendships/request
Envoyer une demande d'ami
```json
{
  "requesterId": "user-123",
  "addresseeId": "user-456"
}
```

#### PUT /realtime/friendships/:friendshipId/accept
Accepter une demande d'ami
```json
{
  "userId": "user-456"
}
```

#### PUT /realtime/friendships/:friendshipId/reject
Rejeter une demande d'ami
```json
{
  "userId": "user-456"
}
```

#### GET /realtime/friendships/friends/:userId
Liste des amis

#### GET /realtime/friendships/pending/:userId
Demandes d'ami en attente

#### POST /realtime/friendships/block
Bloquer un utilisateur
```json
{
  "blockerId": "user-123",
  "targetId": "user-456"
}
```

#### POST /realtime/friendships/unblock
Débloquer un utilisateur
```json
{
  "requesterId": "user-123",
  "targetId": "user-456"
}
```

#### POST /realtime/friendships/remove
Retirer un ami
```json
{
  "userId": "user-123",
  "friendId": "user-456"
}
```

### Groupes

#### POST /realtime/groups
Créer un groupe
```json
{
  "creatorId": "user-123",
  "name": "Groupe Investisseurs",
  "description": "Groupe pour discuter des stratégies d'investissement",
  "visibility": "public"
}
```

#### POST /realtime/groups/:groupId/messages
Envoyer un message dans un groupe
```json
{
  "senderId": "user-123",
  "content": "Que pensez-vous de l'action AAPL ?"
}
```

#### POST /realtime/groups/:groupId/invite
Inviter un membre
```json
{
  "inviterId": "user-123",
  "inviteeId": "user-456"
}
```

#### POST /realtime/groups/:groupId/join
Rejoindre un groupe
```json
{
  "userId": "user-123"
}
```

#### POST /realtime/groups/:groupId/leave
Quitter un groupe
```json
{
  "userId": "user-123"
}
```

#### GET /realtime/groups/:groupId/messages?userId=user-123&limit=100
Historique des messages de groupe

#### GET /realtime/groups/:groupId/members?requesterId=user-123
Liste des membres du groupe

#### POST /realtime/groups/:groupId/promote
Promouvoir un membre en administrateur
```json
{
  "requesterId": "user-123",
  "memberId": "user-456"
}
```

#### POST /realtime/groups/:groupId/ban
Bannir un membre du groupe
```json
{
  "requesterId": "user-123",
  "memberId": "user-456"
}
```

---

## 📨 Messaging Legacy (`/messaging`)

### POST /messaging/send
Envoyer un message
```json
{
  "conversationId": "conv-123",
  "senderId": "user-123",
  "content": "Message content"
}
```

### POST /messaging/assign
Assigner une conversation
```json
{
  "convId": "conv-123",
  "advisorId": "advisor-123"
}
```

### POST /messaging/transfer
Transférer une conversation
```json
{
  "convId": "conv-123",
  "fromAdvisorId": "advisor-123",
  "toAdvisorId": "advisor-456"
}
```

### GET /messaging/open
Conversations ouvertes

---

## 🔧 Admin (`/admin`)

### POST /admin/register
Inscription directeur
```json
{
  "id": "director-123",
  "email": "director@bank.com",
  "password": "SecurePass123",
  "firstName": "Director",
  "lastName": "Admin"
}
```

### POST /admin/login
Authentification directeur
```json
{
  "email": "director@bank.com",
  "password": "SecurePass123"
}
```

---

## 📝 Notes

- **JWT** : La plupart des routes nécessitent un token JWT dans le header `Authorization: Bearer <token>`
- **Ports** : Par défaut l'API écoute sur `http://localhost:3000`
- **Swagger** : Documentation interactive disponible sur `http://localhost:3000/api-docs`
- **Portail Web** : Dashboard de test sur `http://localhost:3000/web/`

### Exemples de tests rapides avec curl

```bash
# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get stocks (public)
curl http://localhost:3000/stocks

# Get profile (with JWT)
curl http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
