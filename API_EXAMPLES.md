# Exemples d'utilisation de l'API Client & Authentification

Ce fichier contient des exemples pratiques pour tester tous les endpoints du module Client & Authentification.

## Prérequis

Démarrez le serveur NestJS :
```bash
npm run dev:nestjs
```

Le serveur écoute sur `http://localhost:3001`

---

## 1. Inscription d'un nouveau client

### Requête
```bash
curl -X POST http://localhost:3001/clients/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "SecurePass123",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phoneNumber": "0612345678"
  }'
```

### Réponse attendue
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to confirm your account.",
  "clientId": "client_1730649600000_abc123xyz",
  "email": "jean.dupont@example.com"
}
```

**Note**: Un email de confirmation sera affiché dans les logs du serveur avec le token.

---

## 2. Confirmation de l'email

Récupérez le token depuis les logs du serveur ou depuis la réponse d'inscription.

### Requête (Browser ou curl)
```bash
curl -X GET "http://localhost:3001/clients/confirm-email?token=ABC123XYZ456DEF789GHI012JKL345"
```

### Réponse attendue
```json
{
  "success": true,
  "message": "Email confirmed successfully"
}
```

---

## 3. Connexion

### Requête
```bash
curl -X POST http://localhost:3001/clients/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "SecurePass123"
  }'
```

### Réponse attendue
```json
{
  "success": true,
  "message": "Authentication successful",
  "client": {
    "id": "client_1730649600000_abc123xyz",
    "email": "jean.dupont@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phoneNumber": "0612345678"
  }
}
```

**Sauvegardez le `clientId` pour les requêtes suivantes !**

---

## 4. Créer un compte bancaire

Remplacez `{clientId}` par l'ID reçu lors de la connexion.

### Requête - Compte Courant
```bash
curl -X POST http://localhost:3001/clients/client_1730649600000_abc123xyz/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Compte Courant",
    "initialBalance": 1000,
    "currency": "EUR"
  }'
```

### Réponse attendue
```json
{
  "success": true,
  "message": "Bank account created successfully",
  "account": {
    "id": "account_1730649700000_def456ghi",
    "iban": "FR76300030362012345678901",
    "accountName": "Compte Courant",
    "balance": 1000,
    "currency": "EUR",
    "isActive": true,
    "createdAt": "2025-11-03T10:30:00.000Z"
  }
}
```

**Note**: L'IBAN est généré automatiquement et est valide selon la norme SEPA !

### Requête - Compte Épargne
```bash
curl -X POST http://localhost:3001/clients/client_1730649600000_abc123xyz/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Compte Épargne",
    "initialBalance": 5000,
    "currency": "EUR"
  }'
```

### Requête - Compte avec solde zéro
```bash
curl -X POST http://localhost:3001/clients/client_1730649600000_abc123xyz/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Compte Projet"
  }'
```

---

## 5. Lister les comptes bancaires

### Requête - Comptes actifs uniquement
```bash
curl -X GET http://localhost:3001/clients/client_1730649600000_abc123xyz/accounts
```

### Réponse attendue
```json
{
  "success": true,
  "count": 3,
  "accounts": [
    {
      "id": "account_1730649700000_def456ghi",
      "iban": "FR76300030362012345678901",
      "accountName": "Compte Courant",
      "balance": 1000,
      "currency": "EUR",
      "isActive": true,
      "createdAt": "2025-11-03T10:30:00.000Z"
    },
    {
      "id": "account_1730649800000_jkl789mno",
      "iban": "FR14300030362098765432109",
      "accountName": "Compte Épargne",
      "balance": 5000,
      "currency": "EUR",
      "isActive": true,
      "createdAt": "2025-11-03T10:31:00.000Z"
    },
    {
      "id": "account_1730649900000_pqr012stu",
      "iban": "FR23300030362011223344556",
      "accountName": "Compte Projet",
      "balance": 0,
      "currency": "EUR",
      "isActive": true,
      "createdAt": "2025-11-03T10:32:00.000Z"
    }
  ]
}
```

### Requête - Tous les comptes (actifs + inactifs)
```bash
curl -X GET "http://localhost:3001/clients/client_1730649600000_abc123xyz/accounts?includeInactive=true"
```

---

## 6. Modifier le nom d'un compte

Remplacez `{clientId}` et `{accountId}` par les valeurs appropriées.

### Requête
```bash
curl -X PUT http://localhost:3001/clients/client_1730649600000_abc123xyz/accounts/account_1730649700000_def456ghi \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Compte Courant Principal"
  }'
```

### Réponse attendue
```json
{
  "success": true,
  "message": "Account name updated successfully",
  "account": {
    "id": "account_1730649700000_def456ghi",
    "iban": "FR76300030362012345678901",
    "accountName": "Compte Courant Principal",
    "balance": 1000,
    "currency": "EUR",
    "isActive": true
  }
}
```

---

## 7. Supprimer un compte bancaire

⚠️ **Important**: Vous ne pouvez supprimer qu'un compte avec un solde de 0 €.

### Requête - Échec (solde positif)
```bash
curl -X DELETE http://localhost:3001/clients/client_1730649600000_abc123xyz/accounts/account_1730649700000_def456ghi
```

### Réponse attendue (échec)
```json
{
  "success": false,
  "message": "Cannot delete account with positive balance. Please withdraw all funds first"
}
```

### Requête - Succès (solde zéro)
```bash
curl -X DELETE http://localhost:3001/clients/client_1730649600000_abc123xyz/accounts/account_1730649900000_pqr012stu
```

### Réponse attendue (succès)
```json
{
  "success": true,
  "message": "Bank account deactivated successfully"
}
```

**Note**: Le compte est désactivé (soft delete), pas supprimé de la base de données.

---

## Cas d'erreur

### 1. Email invalide à l'inscription
```bash
curl -X POST http://localhost:3001/clients/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "SecurePass123",
    "firstName": "Jean",
    "lastName": "Dupont"
  }'
```

**Réponse**:
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

### 2. Mot de passe trop faible
```bash
curl -X POST http://localhost:3001/clients/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "weak",
    "firstName": "Jean",
    "lastName": "Dupont"
  }'
```

**Réponse**:
```json
{
  "success": false,
  "message": "Password must be at least 8 characters long and contain uppercase, lowercase, and numbers"
}
```

### 3. Email déjà enregistré
```bash
curl -X POST http://localhost:3001/clients/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "SecurePass123",
    "firstName": "Jean",
    "lastName": "Dupont"
  }'
```

**Réponse**:
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 4. Connexion sans confirmation d'email
```bash
curl -X POST http://localhost:3001/clients/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau@example.com",
    "password": "SecurePass123"
  }'
```

**Réponse**:
```json
{
  "success": false,
  "message": "Please confirm your email before logging in"
}
```

### 5. Créer un compte avant confirmation
```bash
curl -X POST http://localhost:3001/clients/client_nonconfirme/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Mon compte"
  }'
```

**Réponse**:
```json
{
  "success": false,
  "message": "Client email must be confirmed before creating a bank account"
}
```

---

## Scénario complet de test

Voici un scénario de test complet étape par étape :

```bash
# 1. Inscription
curl -X POST http://localhost:3001/clients/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@example.com",
    "password": "TestPass123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Récupérer le clientId et le token depuis la réponse et les logs

# 2. Confirmer l'email
curl -X GET "http://localhost:3001/clients/confirm-email?token=VOTRE_TOKEN_ICI"

# 3. Se connecter
curl -X POST http://localhost:3001/clients/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@example.com",
    "password": "TestPass123"
  }'

# 4. Créer un compte courant
curl -X POST http://localhost:3001/clients/VOTRE_CLIENT_ID/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Compte Courant",
    "initialBalance": 2000
  }'

# 5. Créer un compte épargne
curl -X POST http://localhost:3001/clients/VOTRE_CLIENT_ID/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Compte Épargne",
    "initialBalance": 10000
  }'

# 6. Lister les comptes
curl -X GET http://localhost:3001/clients/VOTRE_CLIENT_ID/accounts

# 7. Modifier un nom de compte
curl -X PUT http://localhost:3001/clients/VOTRE_CLIENT_ID/accounts/VOTRE_ACCOUNT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Compte Courant Pro"
  }'

# 8. Créer un compte temporaire (solde 0)
curl -X POST http://localhost:3001/clients/VOTRE_CLIENT_ID/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Compte Temporaire"
  }'

# 9. Supprimer le compte temporaire
curl -X DELETE http://localhost:3001/clients/VOTRE_CLIENT_ID/accounts/VOTRE_TEMP_ACCOUNT_ID
```

---

## Tester avec Postman

Importez cette collection dans Postman :

```json
{
  "info": {
    "name": "Banque Avenir - Client API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/clients/register",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"SecurePass123\",\n  \"firstName\": \"Test\",\n  \"lastName\": \"User\"\n}"
        }
      }
    },
    {
      "name": "Confirm Email",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/clients/confirm-email?token={{token}}"
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/clients/login",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"SecurePass123\"\n}"
        }
      }
    },
    {
      "name": "Create Account",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/clients/{{clientId}}/accounts",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"accountName\": \"Compte Courant\",\n  \"initialBalance\": 1000\n}"
        }
      }
    },
    {
      "name": "List Accounts",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/clients/{{clientId}}/accounts"
      }
    },
    {
      "name": "Update Account Name",
      "request": {
        "method": "PUT",
        "url": "http://localhost:3001/clients/{{clientId}}/accounts/{{accountId}}",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"accountName\": \"Nouveau Nom\"\n}"
        }
      }
    },
    {
      "name": "Delete Account",
      "request": {
        "method": "DELETE",
        "url": "http://localhost:3001/clients/{{clientId}}/accounts/{{accountId}}"
      }
    }
  ]
}
```

---

## Vérification de l'IBAN

Pour vérifier qu'un IBAN généré est valide, vous pouvez utiliser des outils en ligne :
- https://fr.iban.com/validation-iban
- https://www.iban.fr/verifier-iban

Tous les IBAN générés par l'API respectent la norme SEPA et passent la validation Mod-97.

---

## Logs du serveur

Le serveur affiche dans les logs :
- Les emails de confirmation (avec le token)
- Les erreurs détaillées
- Les opérations réussies

Exemple de log d'email :
```
=====================================
Email Confirmation
=====================================
To: test@example.com
Subject: Confirm your email address

Hello Test User,

Thank you for registering! Please confirm your email address by clicking the link below:

http://localhost:3001/api/clients/confirm-email?token=ABC123XYZ456DEF789GHI012JKL345

This link will expire in 24 hours.
=====================================
```

---

## Résumé des endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/clients/register` | Inscription d'un nouveau client |
| GET | `/clients/confirm-email?token={token}` | Confirmation d'email |
| POST | `/clients/login` | Connexion |
| POST | `/clients/:clientId/accounts` | Créer un compte bancaire |
| GET | `/clients/:clientId/accounts` | Lister les comptes |
| PUT | `/clients/:clientId/accounts/:accountId` | Modifier le nom d'un compte |
| DELETE | `/clients/:clientId/accounts/:accountId` | Supprimer un compte |

---

**Bon test ! 🚀**
