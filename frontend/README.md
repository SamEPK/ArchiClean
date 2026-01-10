# 🏦 Banque AVENIR - Frontend Next.js

Frontend moderne pour l'application Banque AVENIR, développé avec Next.js 14 et respectant toutes les exigences du partiel.

## ✅ Exigences Respectées

### 📐 Atomic Design
- **Atoms**: Button, Input, Select, Card (composants de base)
- **Molecules**: FormField (combinaison d'atomes)
- **Organisms**: LoginForm, RegisterForm, Navigation (composants complexes)
- **Templates**: DashboardLayout, AuthLayout (structures de pages)
- **Pages**: Home, Login, Dashboard, etc.

### 🔄 State Management
- **React Context API** pour l'authentification (`AuthContext`)
- **React Context API** pour le thème et la langue (`ThemeContext`)
- Gestion globale de l'état utilisateur

### 📝 Formulaires
- **React Hook Form** pour tous les formulaires
- **Zod** pour la validation des schémas
- Validation côté client et serveur

### 🚨 Pages d'erreur personnalisées
- ✅ Page 404 avec design custom
- ✅ Page 500 avec gestion d'erreurs
- Design cohérent avec la charte graphique

### 🌐 Internationalisation (i18n)
- ✅ Support Français et Anglais
- Traductions dans `/public/locales/`
- Hook personnalisé `useTranslations`

### 🗺️ SEO
- ✅ `sitemap.xml` généré dynamiquement
- ✅ Metadata optimisée sur toutes les pages
- ✅ OpenGraph et Twitter Cards
- ✅ Homepage avec SEO complet

### ⚡ Server-Side Rendering (SSR)
- Utilisation de Next.js 14 App Router
- Composants serveur par défaut
- Hydratation optimisée

### 💾 Caching
- **Cache applicatif** dans API client
- **Redis** pour le cache serveur (bonus)
- Stratégie de cache pour les données

## 🎁 Bonus Implémentés

- ✅ **Redis** pour le cache serveur
- ✅ **Animations** avec Framer Motion et Tailwind
- ✅ **Drag'n'Drop** avec react-dnd (pour transferts)

## 📁 Structure du Projet

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.tsx         # Layout racine
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # Styles globaux
│   │   ├── not-found.tsx      # Page 404
│   │   ├── error.tsx          # Page 500
│   │   ├── sitemap.ts         # Sitemap généré
│   │   ├── login/             # Page de connexion
│   │   └── dashboard/         # Dashboards
│   │
│   ├── components/            # Atomic Design
│   │   ├── atoms/            # Composants de base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Card.tsx
│   │   ├── molecules/        # Combinaisons d'atomes
│   │   │   └── FormField.tsx
│   │   ├── organisms/        # Composants complexes
│   │   │   ├── LoginForm.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── AccountCard.tsx
│   │   └── templates/        # Layouts de pages
│   │
│   ├── contexts/             # React Contexts
│   │   ├── AuthContext.tsx   # Authentification
│   │   └── ThemeContext.tsx  # Thème et langue
│   │
│   ├── hooks/                # Custom hooks
│   │   ├── useTranslations.ts
│   │   └── useAuth.ts
│   │
│   ├── lib/                  # Utilities
│   │   ├── api-client.ts    # Client API avec cache
│   │   ├── redis.ts         # Cache Redis
│   │   └── validations.ts   # Schémas Zod
│   │
│   └── types/               # TypeScript types
│       └── index.ts
│
├── public/
│   └── locales/             # Traductions
│       ├── fr.json
│       └── en.json
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🚀 Installation

```bash
cd frontend
npm install
```

## 💻 Développement

```bash
npm run dev
```

Le frontend sera accessible sur http://localhost:3001

## 🏗️ Build Production

```bash
npm run build
npm start
```

## 🔐 Comptes de Test

### Client
- `client1@test.com` / `password123`
- `client2@test.com` / `password123`

### Conseiller
- `conseiller1@banque.com` / `password123`

### Directeur
- `directeur@avenir.com` / `DirecteurSecure123!`

## 🎨 Fonctionnalités

### Pour les Clients
- 💳 Gestion des comptes bancaires
- 💰 Transactions (dépôt, retrait, virement)
- 📈 Trading d'actions
- 📊 Visualisation du portfolio
- 💬 Messagerie avec conseillers
- 💳 Demandes de crédit

### Pour les Conseillers
- 👥 Gestion des clients
- 💬 Conversations avec clients
- 💰 Octroyer des crédits
- 📊 Statistiques

### Pour les Directeurs
- 📈 Gestion des actions
- 👥 Gestion des clients et conseillers
- ⚙️ Configuration système
- 📊 Statistiques globales

## 🛠️ Technologies

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utility-first
- **React Hook Form** - Gestion de formulaires
- **Zod** - Validation de schémas
- **Framer Motion** - Animations
- **React DnD** - Drag and drop
- **Redis** - Cache serveur
- **Axios** - Client HTTP

## 📝 Notes sur l'Architecture

### SSR et Cache
- Toutes les pages utilisent le rendu serveur par défaut
- Cache Redis pour les données API (bonus)
- Cache applicatif dans le client API

### SEO
- Metadata dynamiques sur chaque page
- Sitemap.xml généré automatiquement
- Optimisation OpenGraph et Twitter Cards

### i18n
- Support complet FR/EN
- Détection automatique de la langue
- Traductions chargées dynamiquement

### Accessibilité
- Labels appropriés sur tous les formulaires
- Navigation au clavier
- Contraste respecté (WCAG AA)

## 🎯 Respect des Consignes

✅ Atomic Design complet  
✅ Contextes React pour state management  
✅ React Hook Form + Zod  
✅ Pages 404 et 500 personnalisées  
✅ i18n (FR/EN)  
✅ sitemap.xml  
✅ SEO optimisé  
✅ Maximum SSR  
✅ Cache applicatif et Redis  
✅ Animations (Framer Motion + Tailwind)  
✅ Drag'n'Drop  

## 📧 Contact

Pour toute question sur l'implémentation, consultez le code source ou les commentaires inline.
