# 🚀 Guide de Démarrage Rapide - Frontend Banque AVENIR

## 📦 Installation

```bash
# Se placer dans le dossier frontend
cd frontend

# Installer toutes les dépendances
npm install
```

## ⚙️ Configuration

```bash
# Copier le fichier d'environnement exemple
cp .env.example .env.local

# Éditer les variables d'environnement
# Ouvrir .env.local dans votre éditeur
```

Variables importantes :
```env
NEXT_PUBLIC_API_URL=http://localhost:3000       # URL du backend
NEXT_PUBLIC_SITE_URL=http://localhost:3001      # URL du frontend
REDIS_URL=redis://localhost:6379                # URL Redis (optionnel)
REDIS_ENABLED=false                             # Activer Redis
```

## 🏃 Commandes de Développement

### Démarrer le serveur de développement
```bash
npm run dev
# Accéder à : http://localhost:3001
```

### Build pour la production
```bash
npm run build
```

### Démarrer en mode production
```bash
npm start
```

### Vérifier les types TypeScript
```bash
npm run type-check
```

### Linter le code
```bash
npm run lint
```

## 🧪 Tests et Qualité

### Lancer ESLint
```bash
npm run lint
```

### Corriger automatiquement les erreurs
```bash
npm run lint -- --fix
```

### Vérifier TypeScript sans compiler
```bash
npm run type-check
```

## 📁 Structure Importante

```
frontend/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── not-found.tsx      # Page 404
│   │   ├── global-error.tsx   # Page 500
│   │   └── sitemap.ts         # Génération sitemap
│   │
│   ├── components/
│   │   ├── atoms/             # Composants de base
│   │   ├── molecules/         # Composants composés
│   │   └── organisms/         # Composants complexes
│   │
│   ├── contexts/              # Contextes React
│   ├── hooks/                 # Hooks personnalisés
│   ├── lib/                   # Utilitaires
│   └── types/                 # Types TypeScript
│
├── public/
│   └── locales/              # Traductions i18n
│
└── Configuration files
```

## 🌐 URLs Importantes

- **Frontend Dev** : http://localhost:3001
- **API Backend** : http://localhost:3000
- **Sitemap** : http://localhost:3001/sitemap.xml
- **API Docs** : http://localhost:3000/api

## 🎨 Commandes Tailwind

### Régénérer le CSS (si nécessaire)
```bash
npx tailwindcss -i ./src/app/globals.css -o ./dist/output.css --watch
```

## 🔧 Dépannage

### Port déjà utilisé
```bash
# Changer le port dans package.json
"dev": "next dev -p 3002"
```

### Erreur de cache
```bash
# Nettoyer le cache Next.js
rm -rf .next
npm run dev
```

### Problème avec node_modules
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### TypeScript strict errors
```bash
# Vérifier tsconfig.json et corriger les erreurs
npm run type-check
```

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

## 🎯 Checklist Avant Commit

- [ ] `npm run type-check` passe sans erreur
- [ ] `npm run lint` ne montre pas d'erreur
- [ ] Code formaté correctement
- [ ] Nouvelles features testées
- [ ] Documentation mise à jour si nécessaire

## 🚀 Déploiement

### Build optimisé
```bash
npm run build
```

### Vérifier le build
```bash
npm run start
```

### Variables d'environnement en production
Assurez-vous de configurer :
- `NEXT_PUBLIC_API_URL` - URL de l'API en production
- `NEXT_PUBLIC_SITE_URL` - URL du site en production
- `REDIS_URL` - URL Redis en production
- `REDIS_ENABLED=true` - Activer Redis en production

## 📝 Notes

- Le frontend utilise le port **3001** par défaut
- Le backend doit tourner sur le port **3000**
- Redis est **optionnel** (désactivé par défaut)
- Les traductions sont dans `public/locales/`

## 🆘 Aide

En cas de problème :
1. Vérifier les logs de la console
2. Vérifier les variables d'environnement
3. S'assurer que le backend tourne
4. Consulter la documentation dans `FRONTEND_README.md`

## ⚡ Scripts Rapides

```bash
# Tout en un : installer et démarrer
npm install && npm run dev

# Nettoyer et redémarrer
rm -rf .next && npm run dev

# Build et démarrer en prod
npm run build && npm start
```

---

**Bon développement ! 🎉**
