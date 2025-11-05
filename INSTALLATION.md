# 📋 Checklist Installation - ArchiClean

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir :

- [ ] **Node.js >= 20.x** installé
  ```bash
  node --version  # Doit afficher v20.x ou supérieur
  ```

- [ ] **npm >= 9.x** installé
  ```bash
  npm --version   # Doit afficher 9.x ou supérieur
  ```

- [ ] **Git** installé
  ```bash
  git --version
  ```

## 📦 Installation du projet

### Étape 1 : Cloner le repository
```bash
git clone https://github.com/SamEPK/ArchiClean.git
cd ArchiClean
```

### Étape 2 : Installer les dépendances
```bash
npm install
```

### Étape 3 : Configuration de l'environnement

Le fichier `.env` est déjà configuré avec les valeurs par défaut.

**Vérifiez que le fichier `.env` existe** :
```bash
# Windows PowerShell
ls .env

# Si le fichier n'existe pas, copiez l'example
cp .env.example .env
```

## 🗄️ Base de données MongoDB

Vous avez **3 options** pour MongoDB :

### Option A : Docker (Recommandé si vous avez Docker)

```bash
# 1. Démarrer Docker Desktop
# 2. Lancer MongoDB
docker-compose up -d mongodb

# 3. Vérifier que MongoDB tourne
docker ps
```

### Option B : MongoDB local

Si vous avez MongoDB installé localement :

```bash
# Vérifier que MongoDB tourne
# Windows : Ouvrir "Services" et chercher "MongoDB"
# Linux/Mac : 
sudo systemctl status mongod

# Modifier .env si nécessaire avec votre URI MongoDB
# MONGODB_URI=mongodb://localhost:27017/archiclean
```

### Option C : MongoDB Atlas (Cloud)

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster gratuit
3. Obtenir votre URI de connexion
4. Modifier `.env` :
   ```env
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/archiclean
   ```

## 🌱 Génération des données de test

```bash
npm run seed
```

**Résultat attendu :**
```
🌱 Démarrage du seed de la base de données...

✓ Connecté à MongoDB

🗑️  Suppression des utilisateurs existants...
✓ Utilisateurs supprimés

👤 Création de l'administrateur...
✓ Utilisateur créé: admin@archiclean.com (ADMIN)

👥 Création des utilisateurs de test...
✓ Utilisateur créé: quentin.dev@archiclean.com (USER)
✓ Utilisateur créé: marie.dupont@archiclean.com (USER)
...

📊 Résumé:
   Total utilisateurs: 7
   - Admins: 1
   - Directors: 1
   - Advisors: 1
   - Users: 4

🔑 IDENTIFIANTS DE TEST:
...

✅ Seed terminé avec succès!
```

## 🚀 Lancement de l'application

```bash
npm run dev
```

**Résultat attendu :**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [InstanceLoader] AuthModule dependencies initialized
...
[Nest] LOG Application is running on: http://localhost:3000
```

## ✅ Vérification que tout fonctionne

### Test 1 : Endpoint de health check
```bash
curl http://localhost:3000/auth/me
```
**Attendu :** `401 Unauthorized` (c'est normal, vous n'êtes pas connecté)

### Test 2 : Login avec compte admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@archiclean.com","password":"Admin123!"}'
```
**Attendu :** Un objet JSON avec `accessToken` et `refreshToken`

### Test 3 : Récupérer les profils publics
```bash
curl http://localhost:3000/users/public
```
**Attendu :** Liste des profils publics

## 🐛 Résolution de problèmes

### Problème : MongoDB ne se connecte pas

**Erreur :**
```
MongooseServerSelectionError: connect ECONNREFUSED
```

**Solutions :**
1. Vérifier que MongoDB tourne :
   ```bash
   # Avec Docker
   docker ps | grep mongodb
   
   # Local
   # Windows : Services > MongoDB
   # Linux : sudo systemctl status mongod
   ```

2. Vérifier l'URI dans `.env`
   ```env
   MONGODB_URI=mongodb://admin:admin123@localhost:27017/archiclean?authSource=admin
   ```

3. Redémarrer MongoDB :
   ```bash
   # Avec Docker
   docker-compose restart mongodb
   
   # Local
   # Windows : Services > MongoDB > Redémarrer
   # Linux : sudo systemctl restart mongod
   ```

### Problème : Port 3000 déjà utilisé

**Erreur :**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution :**
Modifier le port dans `.env` :
```env
PORT=3001
```

### Problème : Dépendances manquantes

**Erreur :**
```
Cannot find module 'xxx'
```

**Solution :**
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Problème : TypeScript errors

**Erreur :**
```
TS2307: Cannot find module
```

**Solution :**
```bash
# Rebuild le projet
npm run build
```

## 📝 Checklist finale

Avant de dire que tout fonctionne, vérifiez :

- [ ] MongoDB est démarré et accessible
- [ ] `npm install` a réussi sans erreur
- [ ] Le fichier `.env` existe et est configuré
- [ ] `npm run seed` a créé les utilisateurs de test
- [ ] `npm run dev` démarre l'application
- [ ] L'application répond sur `http://localhost:3000`
- [ ] Vous pouvez vous connecter avec `admin@archiclean.com` / `Admin123!`

## 🎉 Félicitations !

Si toutes les étapes sont validées, votre environnement ArchiClean est prêt !

**Prochaines étapes :**
1. Lire le [README principal](./README.md)
2. Consulter l'[architecture](./ARCHITECTURE.md)
3. Tester l'API avec [Postman](./docs/)
4. Développer vos propres fonctionnalités

---

**Besoin d'aide ?**
- Consultez le [Guide de démarrage rapide](./QUICKSTART.md)
- Ouvrez une [issue sur GitHub](https://github.com/SamEPK/ArchiClean/issues)
