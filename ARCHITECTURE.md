# 🏗️ Architecture du Projet ArchiClean

## Vue d'ensemble

ArchiClean implémente une **Clean Architecture** stricte avec 4 couches distinctes, garantissant :
- ✅ Séparation des responsabilités
- ✅ Testabilité maximale
- ✅ Indépendance des frameworks
- ✅ Maintenabilité à long terme

## Diagramme de l'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        COUCHE INTERFACE                         │
│  (Présentation - NestJS Controllers, Routes, WebSockets)        │
├─────────────────────────────────────────────────────────────────┤
│  - AuthController          - UserController                     │
│  - BankAccountController   - StockController                    │
│  - MessagingGateway       - Guards & Strategies                │
│  - DTOs & Validators       - Decorators                         │
└────────────────────┬────────────────────────────────────────────┘
                     │ Appelle les Use Cases
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COUCHE APPLICATION                         │
│            (Logique métier - Use Cases)                         │
├─────────────────────────────────────────────────────────────────┤
│  - RegisterUserUseCase      - LoginUserUseCase                  │
│  - CreateBankAccountUseCase - TransferMoneyUseCase              │
│  - PlaceStockOrderUseCase   - SendMessageUseCase                │
│  - ApplyDailyInterestUseCase                                    │
└────────────────────┬────────────────────────────────────────────┘
                     │ Utilise les Entités & Repositories
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        COUCHE DOMAINE                           │
│         (Entités & Règles métier pures)                         │
├─────────────────────────────────────────────────────────────────┤
│  Entités:                   Repositories Interfaces:             │
│  - User                     - IUserRepository                    │
│  - BankAccount              - IBankAccountRepository             │
│  - Stock                    - IStockRepository                   │
│  - Order                    - IOrderRepository                   │
│  - Message                  - IMessageRepository                 │
│  - Portfolio                - IPortfolioRepository               │
└────────────────────┬────────────────────────────────────────────┘
                     │ Implémenté par
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COUCHE INFRASTRUCTURE                        │
│     (Implémentations techniques - DB, Services externes)        │
├─────────────────────────────────────────────────────────────────┤
│  Repositories:               Services:                           │
│  - MongoUserRepository       - HashService (bcrypt)              │
│  - MongoBankAccountRepo      - EmailService (nodemailer)         │
│  - MongoStockRepository      - FileUploadService                 │
│                                                                  │
│  Database:                   External APIs:                      │
│  - MongoDBConnection         - SMTP Server                       │
│  - Mongoose Models           - File Storage                      │
└─────────────────────────────────────────────────────────────────┘
```

## Flux de données

### Exemple : Inscription d'un utilisateur

```
Client HTTP Request
      │
      ▼
┌──────────────────────────┐
│  AuthController          │  (Interface Layer)
│  POST /auth/register     │
└──────────┬───────────────┘
           │ Validation (DTO)
           ▼
┌──────────────────────────┐
│  RegisterUserUseCase     │  (Application Layer)
│  - Valide les règles     │
│  - Hash le password      │
│  - Génère le token       │
└──────────┬───────────────┘
           │ Utilise
           ▼
┌──────────────────────────┐
│  User (Entity)           │  (Domain Layer)
│  - Logique métier        │
│  - Validations           │
└──────────┬───────────────┘
           │ Sauvegarde via
           ▼
┌──────────────────────────┐
│  IUserRepository         │  (Domain Interface)
└──────────┬───────────────┘
           │ Implémenté par
           ▼
┌──────────────────────────┐
│  MongoUserRepository     │  (Infrastructure Layer)
│  - Mongoose Model        │
│  - MongoDB Operations    │
└──────────────────────────┘
           │
           ▼
      MongoDB Database
```

## Module d'Authentification (Détaillé)

### Structure des fichiers

```
src/
├── domain/
│   ├── entities/
│   │   └── User.ts                    # Entité User avec règles métier
│   └── repositories/
│       └── IUserRepository.ts         # Interface du repository
│
├── application/
│   └── use-cases/
│       ├── RegisterUserUseCase.ts     # Inscription
│       ├── LoginUserUseCase.ts        # Connexion
│       ├── ConfirmUserEmailUseCase.ts # Confirmation email
│       ├── RefreshTokenUseCase.ts     # Rafraîchissement token
│       ├── LogoutUserUseCase.ts       # Déconnexion
│       ├── UpdateProfileUseCase.ts    # MAJ profil
│       ├── GetProfileUseCase.ts       # Récup profil
│       ├── UploadAvatarUseCase.ts     # Upload avatar
│       ├── GetPublicProfilesUseCase.ts # Profils publics
│       └── SearchUsersUseCase.ts      # Recherche users
│
├── infrastructure/
│   ├── repositories/
│   │   └── mongodb/
│   │       ├── UserModel.ts           # Mongoose Schema
│   │       └── MongoUserRepository.ts # Implémentation
│   └── services/
│       ├── HashService.ts             # bcrypt
│       ├── EmailService.ts            # nodemailer
│       └── FileUploadService.ts       # multer
│
└── interface/
    └── nestjs/
        ├── controllers/
        │   ├── auth.controller.ts     # Routes auth
        │   └── user.controller.ts     # Routes users
        ├── modules/
        │   └── auth.module.ts         # Module NestJS
        ├── guards/
        │   ├── jwt-auth.guard.ts      # Protection JWT
        │   ├── local-auth.guard.ts    # Login
        │   └── roles.guard.ts         # RBAC
        ├── strategies/
        │   ├── jwt.strategy.ts        # Stratégie JWT
        │   ├── jwt-refresh.strategy.ts # Refresh
        │   └── local.strategy.ts      # Local
        ├── decorators/
        │   ├── current-user.decorator.ts # @CurrentUser()
        │   └── roles.decorator.ts     # @Roles()
        └── dto/
            ├── auth.dto.ts            # DTOs auth
            └── user.dto.ts            # DTOs user
```

## Principes SOLID appliqués

### 1. Single Responsibility Principle (SRP)
Chaque classe a une seule responsabilité :
- `User` : Logique métier utilisateur
- `RegisterUserUseCase` : Inscription uniquement
- `HashService` : Hachage uniquement
- `EmailService` : Emails uniquement

### 2. Open/Closed Principle (OCP)
Ouvert à l'extension, fermé à la modification :
- Nouveaux use cases sans modifier les existants
- Nouveaux repositories sans changer les interfaces

### 3. Liskov Substitution Principle (LSP)
Les implémentations sont interchangeables :
- `MongoUserRepository` peut être remplacé par `InMemoryUserRepository`
- Même interface `IUserRepository`

### 4. Interface Segregation Principle (ISP)
Interfaces spécifiques et cohésives :
- `IUserRepository` : uniquement opérations user
- `IEmailService` : uniquement envoi emails

### 5. Dependency Inversion Principle (DIP)
Les modules de haut niveau ne dépendent pas des modules de bas niveau :
- Use Cases dépendent de `IUserRepository` (interface)
- Pas de dépendance directe à MongoDB ou autre implémentation

## Sécurité - Architecture multi-couches

```
┌─────────────────────────────────────┐
│  Client Request                     │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  CORS Middleware                    │  ✓ Protection cross-origin
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Validation Middleware              │  ✓ class-validator
│  (DTOs)                             │  ✓ Validation input
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  JWT Guard                          │  ✓ Vérification token
│  @UseGuards(JwtAuthGuard)           │  ✓ Authentification
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Roles Guard                        │  ✓ RBAC
│  @UseGuards(RolesGuard)             │  ✓ Autorisation
│  @Roles(UserRole.ADMIN)             │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Controller                         │  ✓ Business logic
│  Use Case Execution                 │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Domain Validation                  │  ✓ Règles métier
│  (Entity methods)                   │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Data Access Layer                  │  ✓ Repository pattern
│  (Repository)                       │  ✓ Parameterized queries
└─────────────────────────────────────┘
```

## Gestion des erreurs

### Hiérarchie des erreurs

```
Application Error
    ├── ValidationError        (400 Bad Request)
    ├── AuthenticationError    (401 Unauthorized)
    ├── AuthorizationError     (403 Forbidden)
    ├── NotFoundError          (404 Not Found)
    ├── ConflictError          (409 Conflict)
    └── InternalError          (500 Internal Server Error)
```

### Exemple de gestion

```typescript
try {
  const result = await useCase.execute(dto);
  return { success: true, data: result };
} catch (error) {
  if (error instanceof ValidationError) {
    throw new BadRequestException(error.message);
  }
  if (error instanceof NotFoundError) {
    throw new NotFoundException(error.message);
  }
  throw new InternalServerErrorException('Internal error');
}
```

## Testing Strategy

### 1. Tests Unitaires (Domain & Application)
- Entités du domaine
- Use Cases isolés
- Services métier

### 2. Tests d'Intégration (Infrastructure)
- Repositories avec base de données de test
- Services externes mockés

### 3. Tests E2E (Interface)
- Controllers complets
- Authentification flow
- API endpoints

## Déploiement

### Architecture de production

```
┌─────────────────┐
│  Load Balancer  │  (nginx/traefik)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│ App 1 │ │ App 2 │  (Docker containers)
└───┬───┘ └──┬────┘
    │         │
    └────┬────┘
         │
    ┌────▼────┐
    │ MongoDB │  (Replica Set)
    │ Cluster │
    └─────────┘
```

## Avantages de cette architecture

✅ **Maintenabilité** : Code organisé et facile à comprendre
✅ **Testabilité** : Chaque couche testable indépendamment
✅ **Évolutivité** : Ajout de fonctionnalités sans casser l'existant
✅ **Flexibilité** : Changement de DB ou framework facilité
✅ **Sécurité** : Séparation claire des responsabilités
✅ **Performance** : Optimisations possibles à chaque couche

## Évolutions futures possibles

- 🔄 Ajout de CQRS (Command Query Responsibility Segregation)
- 📊 Event Sourcing pour l'historique
- 🔍 ElasticSearch pour la recherche
- 📱 API GraphQL en complément
- 🚀 Microservices (découpage par domaine)
- 📈 Monitoring & Observability (Prometheus, Grafana)
