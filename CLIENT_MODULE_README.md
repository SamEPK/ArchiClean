# Module Client & Authentification - Documentation

## Vue d'ensemble

Ce module implémente toutes les fonctionnalités liées à l'authentification des clients et à la gestion de leurs comptes bancaires dans le projet Banque Avenir (ArchiClean).

## Fonctionnalités implémentées

### 1. Authentification (✅ Complète)

#### Inscription utilisateur
- **Endpoint**: `POST /clients/register`
- **Validation automatique**:
  - Format d'email valide
  - Mot de passe fort (minimum 8 caractères, majuscules, minuscules, chiffres)
  - Email unique dans le système
- **Hashage sécurisé** du mot de passe avec bcryptjs (10 rounds)
- **Génération automatique** d'un token de confirmation (valide 24h)

#### Confirmation par email
- **Endpoint**: `GET /clients/confirm-email?token={token}`
- Système de **tokens avec expiration** (24 heures)
- **Vérification de la validité** du token avant confirmation
- Protection contre les confirmations multiples

#### Connexion / Déconnexion
- **Endpoint**: `POST /clients/login`
- **Vérification** de l'email ET du mot de passe
- **Contrôle** que l'email est confirmé avant autorisation
- Authentification sécurisée avec bcrypt

#### Gestion de session
- Structure prête pour l'intégration JWT (à venir)
- Session basée sur les informations client retournées

### 2. Gestion des comptes bancaires (✅ Complète)

#### Création de compte
- **Endpoint**: `POST /clients/:clientId/accounts`
- **Génération automatique d'IBAN valide** (format français FR + algorithme mod97)
- Validation que l'email du client est confirmé
- Support multi-devises (EUR par défaut)
- Nom personnalisé du compte
- Solde initial configurable

#### Affichage de la liste des comptes
- **Endpoint**: `GET /clients/:clientId/accounts`
- Liste tous les comptes actifs d'un client
- Option pour inclure les comptes inactifs (`?includeInactive=true`)
- Affichage de toutes les informations: IBAN, nom, solde, devise, statut

#### Modification du nom du compte
- **Endpoint**: `PUT /clients/:clientId/accounts/:accountId`
- Vérification de la propriété du compte
- Validation que le compte est actif
- Trim automatique du nouveau nom

#### Suppression de compte
- **Endpoint**: `DELETE /clients/:clientId/accounts/:accountId`
- Protection: **impossible de supprimer un compte avec solde positif**
- Vérification de la propriété du compte
- Désactivation (soft delete) au lieu de suppression réelle

## Architecture du code

Le module suit l'architecture Clean Architecture en place dans le projet :

```
src/
├── domain/
│   ├── entities/
│   │   ├── Client.ts              # Entité Client avec gestion des tokens
│   │   └── BankAccount.ts         # Entité Compte bancaire avec IBAN
│   └── repositories/
│       ├── IClientRepository.ts
│       └── IBankAccountRepository.ts
│
├── application/
│   └── use-cases/
│       ├── RegisterClientUseCase.ts
│       ├── ConfirmEmailUseCase.ts
│       ├── AuthenticateClientUseCase.ts
│       ├── CreateBankAccountUseCase.ts
│       ├── ListBankAccountsUseCase.ts
│       ├── UpdateBankAccountNameUseCase.ts
│       └── DeleteBankAccountUseCase.ts
│
├── infrastructure/
│   ├── repositories/
│   │   ├── in-memory/
│   │   │   ├── InMemoryClientRepository.ts      # Pour tests
│   │   │   └── InMemoryBankAccountRepository.ts  # Pour tests
│   │   └── mongodb/
│   │       ├── MongoClientRepository.ts          # Production
│   │       └── MongoBankAccountRepository.ts     # Production
│   └── services/
│       └── EmailService.ts                        # Service d'envoi d'emails
│
└── interface/
    └── nestjs/
        ├── controllers/
        │   └── client.controller.ts
        └── modules/
            └── client.module.ts
```

## Tests

### Couverture des tests
- **65 tests** passent avec succès
- **Couverture globale**: 88.07% (statements), 88.51% (lines)
- **Use cases**: 96.16% de couverture

### Tests unitaires créés
- `RegisterClientUseCase.spec.ts` (8 tests)
- `AuthenticateClientUseCase.spec.ts` (7 tests)
- `ConfirmEmailUseCase.spec.ts` (4 tests)
- `CreateBankAccountUseCase.spec.ts` (8 tests)
- `BankAccountManagement.spec.ts` (9 tests pour update, delete, list)

Tous les tests utilisent des **repositories in-memory** pour des tests rapides et isolés.

## Endpoints API disponibles

### Authentification

```http
# Inscription
POST /clients/register
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "SecurePass123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phoneNumber": "0612345678"  // optionnel
}

# Confirmation d'email
GET /clients/confirm-email?token={confirmation_token}

# Connexion
POST /clients/login
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "SecurePass123"
}
```

### Gestion des comptes

```http
# Créer un compte bancaire
POST /clients/{clientId}/accounts
Content-Type: application/json

{
  "accountName": "Compte Courant",
  "initialBalance": 1000,    // optionnel, défaut: 0
  "currency": "EUR"          // optionnel, défaut: EUR
}

# Lister les comptes
GET /clients/{clientId}/accounts
GET /clients/{clientId}/accounts?includeInactive=true

# Modifier le nom d'un compte
PUT /clients/{clientId}/accounts/{accountId}
Content-Type: application/json

{
  "accountName": "Nouveau nom"
}

# Supprimer un compte
DELETE /clients/{clientId}/accounts/{accountId}
```

## Sécurité

### Mesures de sécurité implémentées

1. **Mots de passe**
   - Hashage avec bcryptjs (10 rounds)
   - Validation de complexité (8 caractères min, majuscules, minuscules, chiffres)
   - Jamais stockés ou retournés en clair

2. **Emails**
   - Validation du format
   - Unicité garantie
   - Normalisation (lowercase + trim)
   - Confirmation obligatoire avant utilisation

3. **Tokens de confirmation**
   - Générés aléatoirement (32 caractères)
   - Expiration après 24 heures
   - Supprimés après utilisation

4. **Comptes bancaires**
   - Vérification de propriété pour toutes les opérations
   - Protection contre la suppression de comptes avec solde
   - IBAN valide selon norme SEPA

5. **Validation des entrées**
   - Trim automatique des espaces
   - Validation des champs requis
   - Messages d'erreur appropriés

## Configuration

### Variables d'environnement

Ajouter au fichier `.env` (voir `.env.example`) :

```env
# Email Configuration
EMAIL_SERVICE=mock
EMAIL_FROM=noreply@banque-avenir.fr
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
CONFIRMATION_EMAIL_BASE_URL=http://localhost:3001/api/clients/confirm-email
```

### Changement de repository (In-Memory → MongoDB)

Pour passer en production avec MongoDB, modifier `client.module.ts` :

```typescript
// Remplacer
import { InMemoryClientRepository } from '@infrastructure/repositories/in-memory/InMemoryClientRepository';
import { InMemoryBankAccountRepository } from '@infrastructure/repositories/in-memory/InMemoryBankAccountRepository';

// Par
import { MongoClientRepository } from '@infrastructure/repositories/mongodb/MongoClientRepository';
import { MongoBankAccountRepository } from '@infrastructure/repositories/mongodb/MongoBankAccountRepository';

// Et instancier
const clientRepository = new MongoClientRepository();
const bankAccountRepository = new MongoBankAccountRepository();
```

## Génération d'IBAN

Le système génère des IBAN français valides selon la norme SEPA :

- **Format**: FRxx 3000 3036 20xx xxxx xxxx x
- **Algorithme**: Mod-97 pour les chiffres de contrôle
- **Validation**: Méthode `BankAccount.validateIBAN()` disponible
- **Unicité**: Vérification en base avant création

### Exemple d'IBAN généré
```
FR76 3000 3036 2012 3456 7890 1
│  │  │    │    │              │
│  │  │    │    │              └─ Numéro de compte (11 chiffres)
│  │  │    │    └─ Code guichet (5 chiffres)
│  │  │    └─ Code banque (5 chiffres)
│  │  └─ Clé de contrôle (2 chiffres, calculés)
│  └─ Code pays (FR)
```

## Service Email

Le service d'email actuel est un **mock** qui affiche les emails dans la console.

### Emails envoyés automatiquement
- **Confirmation d'inscription**: lien de confirmation avec token

### Intégration d'un vrai service d'email

Pour utiliser un vrai service (ex: SendGrid, Mailgun, SMTP), implémenter `IEmailService` :

```typescript
export class RealEmailService implements IEmailService {
  async sendConfirmationEmail(email: string, token: string, clientName: string): Promise<void> {
    // Votre implémentation
  }
}
```

## Points d'amélioration futurs

1. **JWT/Sessions**
   - Implémenter JWT pour les sessions authentifiées
   - Middleware de protection des routes
   - Refresh tokens

2. **Email réel**
   - Intégration SendGrid ou service similaire
   - Templates HTML pour les emails
   - Emails de notification (compte créé, etc.)

3. **Validation avancée**
   - Validation téléphone international
   - Détection d'emails jetables
   - Rate limiting sur les inscriptions

4. **Fonctionnalités complémentaires**
   - Réinitialisation de mot de passe
   - Changement de mot de passe
   - Modification du profil client
   - Désactivation de compte client

5. **Sécurité**
   - 2FA (authentification à deux facteurs)
   - Historique des connexions
   - Alertes de sécurité

## Lancer le projet

```bash
# Installer les dépendances
npm install

# Lancer les tests
npm test

# Lancer le serveur de développement
npm run dev:nestjs

# Build pour production
npm run build
```

## Auteur

**FOUAD** - Module Client & Authentification

---

## Points de points (~5 points)

✅ **Authentification**
- Inscription utilisateur avec validation email
- Système de confirmation par lien
- Connexion / Déconnexion
- Gestion de session

✅ **Gestion des comptes bancaires**
- Création de compte avec génération IBAN unique et valide
- Suppression de compte (avec protection solde positif)
- Modification du nom personnalisé du compte
- Affichage de la liste des comptes

**Bonus implémentés**:
- Tests unitaires complets (65 tests)
- Couverture > 88%
- Sécurité (bcrypt, validation, tokens)
- Architecture Clean Architecture respectée
- MongoDB + In-Memory repositories
- Documentation complète
