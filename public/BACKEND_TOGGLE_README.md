# Backend Toggle - Guide d'utilisation

## 🎯 Fonctionnalité

Un toggle visuel permettant de basculer entre les 2 backends implémentés :
- **NestJS** (port 3000) - Backend principal
- **Fastify** (port 3001) - Backend alternatif haute performance

## 📍 Emplacement

Le toggle est situé **en haut à gauche** de chaque page du frontend :
- Page de login (`index.html`)
- Dashboard Client (`client-complete.html`)
- Dashboard Conseiller (`advisor-complete.html`)
- Dashboard Directeur (`director-dashboard.html`)

## 🎨 Apparence

```
┌─────────────────────────────────┐
│ Backend: NestJS  [○──] :3000  │  ← Position OFF (NestJS)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Backend: Fastify [──●] :3001  │  ← Position ON (Fastify)
└─────────────────────────────────┘
```

**Couleurs :**
- **NestJS** : Rouge (#e0234e)
- **Fastify** : Cyan (#38bdf8)

## ⚙️ Fonctionnement

### 1. Sélection du backend
- Cliquez sur le toggle pour basculer entre NestJS et Fastify
- Le choix est **sauvegardé dans localStorage**
- La page se recharge automatiquement après 300ms

### 2. Routage automatique des API

Le script `backend-toggle.js` gère automatiquement les URLs :

**NestJS (port 3000) :**
```
/clients/login          → http://localhost:3000/clients/login
/advisors/login         → http://localhost:3000/advisors/login
/stocks                 → http://localhost:3000/stocks
```

**Fastify (port 3001) :**
```
/clients/login          → http://localhost:3001/api/auth/client/login
/advisors/login         → http://localhost:3001/api/auth/advisor/login
/stocks                 → http://localhost:3001/api/stocks
```

### 3. Préfixe `/api` automatique

Pour Fastify, certaines routes nécessitent le préfixe `/api` :
- `/auth/*` → `/api/auth/*`
- `/clients/*` → `/api/clients/*`
- `/transactions/*` → `/api/transactions/*`
- `/stocks/*` → `/api/stocks/*`
- `/orders/*` → `/api/orders/*`
- `/portfolio/*` → `/api/portfolio/*`
- `/savings/*` → `/api/savings/*`

## 📂 Architecture des fichiers

### Script partagé
```
public/backend-toggle.js
```
Ce fichier contient :
- Configuration des backends (ports, noms, couleurs)
- Logique du toggle (sauvegarde, UI)
- Fonction `getApiUrl(path)` pour routage dynamique
- Injection automatique des styles CSS

### Intégration dans les pages

**HTML (ajouté dans le body) :**
```html
<!-- Backend Toggle -->
<div class="backend-toggle">
  <span class="backend-toggle-label">Backend:</span>
  <span class="backend-name" id="backendName">NestJS</span>
  <div class="toggle-switch" id="backendToggle" onclick="toggleBackend()">
    <div class="toggle-slider"></div>
  </div>
  <span class="backend-port" id="backendPort">:3000</span>
</div>
```

**JavaScript (avant les autres scripts) :**
```html
<script src="/backend-toggle.js"></script>
<script src="client-complete.js"></script>
```

### Fonction API mise à jour

Dans `client-complete.js`, `advisor-complete.js` :
```javascript
async function api(path, options = {}) {
  // Utilise getApiUrl() du toggle pour obtenir l'URL complète
  const url = typeof getApiUrl === 'function' ? getApiUrl(path) : (window.location.origin + path);
  const res = await fetch(url, { ...options, headers });
  // ...
}
```

## 🔧 Configuration

### LocalStorage

Clé : `selectedBackend`
Valeurs : `'nestjs'` | `'fastify'`

```javascript
// Forcer NestJS
localStorage.setItem('selectedBackend', 'nestjs');

// Forcer Fastify
localStorage.setItem('selectedBackend', 'fastify');

// Réinitialiser (par défaut: NestJS)
localStorage.removeItem('selectedBackend');
```

### Objet de configuration

Dans `backend-toggle.js` :
```javascript
const BACKENDS = {
  nestjs: { 
    name: 'NestJS', 
    port: 3000, 
    color: 'nestjs', 
    apiPrefix: '' 
  },
  fastify: { 
    name: 'Fastify', 
    port: 3001, 
    color: 'fastify', 
    apiPrefix: '/api' 
  }
};
```

## 🧪 Tests

### 1. Vérifier le toggle visuel
- Ouvrir `http://localhost:3000/web/index.html`
- Le toggle doit apparaître en haut à gauche
- Cliquer dessus change la couleur et le texte

### 2. Vérifier le routage
**Console du navigateur :**
```javascript
// Avec NestJS sélectionné
getApiUrl('/clients/login')
// → "http://localhost:3000/clients/login"

// Avec Fastify sélectionné
getApiUrl('/clients/login')
// → "http://localhost:3001/api/auth/client/login"
```

### 3. Test de connexion
1. Sélectionner **NestJS**
2. Se connecter comme client
3. Vérifier la console réseau (DevTools) : requête vers port 3000
4. Se déconnecter
5. Sélectionner **Fastify**
6. Se reconnecter
7. Vérifier la console réseau : requête vers port 3001

## 🚀 Démarrage des 2 backends

**Terminal 1 - NestJS :**
```bash
npm run dev:nestjs
# Écoute sur http://localhost:3000
```

**Terminal 2 - Fastify :**
```bash
npm run dev:fastify
# Écoute sur http://localhost:3001
```

**Terminal 3 - Frontend (optionnel) :**
```bash
# Si serveur web séparé
python -m http.server 8000
# Accès via http://localhost:8000/public/index.html
```

## 🐛 Dépannage

### Le toggle ne s'affiche pas
- Vérifier que `backend-toggle.js` est bien chargé (Console > Network)
- Vérifier l'ordre des scripts : `backend-toggle.js` doit être en premier

### Les appels API échouent
- Vérifier que le backend sélectionné est bien démarré
- Console réseau : vérifier l'URL générée
- Console JS : `console.log(getCurrentBackend())`

### Le toggle ne change pas
- Vérifier la console : erreur JavaScript ?
- localStorage accessible ? (pas en navigation privée)
- Cache du navigateur : Ctrl+Shift+R

### Routes Fastify 404
- Vérifier que le préfixe `/api` est bien ajouté
- Comparer avec `FRAMEWORK_COMPARISON.md` pour les endpoints disponibles

## 📊 Comparaison des endpoints

| Endpoint | NestJS | Fastify |
|----------|--------|---------|
| Login client | `/clients/login` | `/api/auth/client/login` |
| Login conseiller | `/advisors/login` | `/api/auth/advisor/login` |
| Login directeur | `/directors/login` | `/api/auth/director/login` |
| Profil client | `/clients/:id` | `/api/clients/:id` |
| Transactions | `/transactions/transfer` | `/api/transactions/transfer` |
| Actions | `/stocks` | `/api/stocks` |

Voir `FRAMEWORK_COMPARISON.md` pour la liste complète.

## 💡 Améliorations futures

- [ ] Indicateur visuel de disponibilité (ping health check)
- [ ] Statistiques de latence par backend
- [ ] Basculement automatique en cas d'erreur
- [ ] Mode "Load Balancing" (alternance automatique)
- [ ] Logs des requêtes en mode debug
