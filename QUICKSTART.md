# 🚀 Guide de Démarrage Rapide - ArchiClean

## Installation en 5 minutes

### Option 1 : Avec Docker (Recommandé)

```bash
# 1. Cloner le projet
git clone https://github.com/SamEPK/ArchiClean.git
cd ArchiClean

# 2. Installer les dépendances
npm install

# 3. Lancer MongoDB et l'application
npm run docker:up

# 4. Dans un nouveau terminal, générer les données de test
npm run seed

# ✅ L'application est prête sur http://localhost:3000
```

### Option 2 : Sans Docker

```bash
# 1. Cloner le projet
git clone https://github.com/SamEPK/ArchiClean.git
cd ArchiClean

# 2. Installer les dépendances
npm install

# 3. Démarrer MongoDB (assurez-vous qu'il tourne localement)
# MongoDB doit être accessible sur mongodb://localhost:27017

# 4. Copier et configurer .env
cp .env.example .env
# Éditer .env si nécessaire

# 5. Générer les données de test
npm run seed

# 6. Lancer l'application
npm run dev

# ✅ L'application est prête sur http://localhost:3000
```

## Test rapide avec cURL

### 1. Inscription
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Connexion avec un compte de test
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@archiclean.com",
    "password": "Admin123!"
  }'
```

Vous recevrez un token JWT à utiliser pour les requêtes authentifiées.

### 3. Accéder à son profil
```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

### 4. Lister les profils publics
```bash
curl -X GET http://localhost:3000/users/public
```

## Test avec Postman

1. **Importer la collection** : [ArchiClean.postman_collection.json](./docs/postman_collection.json)
2. **Configurer l'environnement** :
   - `baseUrl`: `http://localhost:3000`
   - `accessToken`: (sera rempli automatiquement après login)
3. **Exécuter les requêtes** dans l'ordre :
   - Auth → Login
   - Users → Get Profile
   - Users → Update Profile

## Comptes de test disponibles

| Email | Password | Rôle |
|-------|----------|------|
| admin@archiclean.com | Admin123! | ADMIN |
| quentin.dev@archiclean.com | Quentin123! | USER |
| marie.dupont@archiclean.com | Marie123! | USER |
| jean.martin@archiclean.com | Jean123! | ADVISOR |
| sophie.bernard@archiclean.com | Sophie123! | DIRECTOR |

## Commandes utiles

```bash
# Développement
npm run dev                # Lancer en mode dev
npm run dev:fastify        # Lancer avec Fastify

# Base de données
npm run seed               # Regénérer les données de test
npm run docker:up          # Démarrer Docker
npm run docker:down        # Arrêter Docker
npm run docker:logs        # Voir les logs

# Build & Production
npm run build              # Compiler
npm start                  # Lancer en production

# Tests
npm test                   # Lancer les tests
npm run test:watch         # Tests en mode watch
```

## Vérification rapide

```bash
# Vérifier que MongoDB tourne
npm run docker:logs mongodb

# Vérifier les endpoints
curl http://localhost:3000/auth/me

# Devrait retourner 401 (Unauthorized) - c'est normal !
```

## Problèmes courants

### Port 3000 déjà utilisé
```bash
# Changer le port dans .env
PORT=3001
```

### MongoDB ne démarre pas
```bash
# Vérifier Docker
docker ps

# Relancer MongoDB seul
docker-compose up -d mongodb
```

### Problème d'authentification
```bash
# Regénérer les données
npm run seed
```

## Prochaines étapes

1. ✅ Explorer l'API avec Postman
2. ✅ Lire la [documentation complète](./README.md)
3. ✅ Consulter l'[architecture](./ARCHITECTURE.md)
4. ✅ Voir les [exemples d'API](./API_EXAMPLES.md)

---

**Besoin d'aide ?** Consultez le [README](./README.md) ou les [issues GitHub](https://github.com/SamEPK/ArchiClean/issues)
