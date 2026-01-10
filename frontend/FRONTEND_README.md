# 🏦 Banque AVENIR - Frontend Next.js

Frontend moderne pour l'application bancaire Banque AVENIR, construit avec Next.js 14, TypeScript, et Tailwind CSS.

## ✅ Fonctionnalités Implémentées

### 📋 Exigences du Sujet

- ✅ **Atomic Design** : Architecture complète en atoms, molecules, et organisms
- ✅ **Contextes React** : `AuthContext` et `ThemeContext` pour la gestion d'état
- ✅ **React Hook Form + Zod** : Validation des formulaires avec schémas
- ✅ **Pages d'erreur** : Pages 404 et 500 personnalisées
- ✅ **Internationalisation** : Support FR/EN avec `next-intl`
- ✅ **Sitemap** : Fichier sitemap.xml généré dynamiquement
- ✅ **SEO** : Metadata optimisée sur toutes les pages
- ✅ **Server-Side Rendering** : Maximum de rendu côté serveur
- ✅ **Cache** : Système de cache avec Redis (optionnel) et cache Next.js

### 🎁 Bonus Implémentés

- ✅ **Redis Cache** : Configuration complète pour la mise en cache
- ✅ **Animations** : Framer Motion pour tableaux, cards, et listes
- ✅ **Drag'n'Drop** : Transferts d'argent par glisser-déposer

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── app/                    # App Router Next.js
│   │   ├── [locale]/          # Routes internationalisées
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── error.tsx          # Page d'erreur
│   │   ├── not-found.tsx      # Page 404
│   │   ├── global-error.tsx   # Page 500
│   │   └── sitemap.ts         # Génération sitemap
│   │
│   ├── components/
│   │   ├── atoms/             # Composants atomiques
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── Loading.tsx
│   │   │
│   │   ├── molecules/         # Composants moléculaires
│   │   │   ├── FormField.tsx
│   │   │   ├── NavBar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── TransactionList.tsx
│   │   │
│   │   └── organisms/         # Composants organismes
│   │       ├── LoginForm.tsx
│   │       ├── AccountsGrid.tsx
│   │       ├── StocksList.tsx
│   │       ├── TransferZone.tsx
│   │       └── ClientDashboard.tsx
│   │
│   ├── contexts/              # Contextes React
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── hooks/                 # Hooks personnalisés
│   ├── lib/                   # Utilitaires
│   │   ├── redis.ts          # Configuration Redis
│   │   └── cache.ts          # Utilitaires de cache
│   │
│   ├── types/                 # Types TypeScript
│   └── i18n.ts               # Configuration i18n
│
├── public/
│   └── locales/              # Fichiers de traduction
│       ├── fr.json
│       └── en.json
│
├── middleware.ts             # Middleware i18n
└── next.config.js           # Configuration Next.js
```

## 🚀 Installation

```bash
cd frontend
npm install
```

## ⚙️ Configuration

Copiez le fichier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Configurez les variables d'environnement :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false
```

## 🏃 Lancement

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3001](http://localhost:3001)

### Build production

```bash
npm run build
npm start
```

## 🎨 Composants Principaux

### Atoms (Composants de base)

- **Button** : Boutons avec variants (primary, secondary, outline)
- **Input** : Champs de saisie avec validation
- **Card** : Cartes avec header, content, footer
- **Badge** : Badges colorés avec variants
- **Avatar** : Avatars avec initiales et statut
- **Loading** : Indicateurs de chargement (spinner, dots, pulse)
- **Skeleton** : Placeholders de chargement

### Molecules

- **FormField** : Champ de formulaire avec label et erreur
- **NavBar** : Barre de navigation responsive
- **Footer** : Footer avec liens
- **TransactionList** : Liste de transactions animée

### Organisms

- **LoginForm** : Formulaire de connexion avec validation
- **AccountsGrid** : Grille de comptes bancaires animée
- **StocksList** : Liste d'actions avec achats/ventes
- **TransferZone** : Zone de transfert avec drag'n'drop
- **ClientDashboard** : Tableau de bord client complet

## 🌐 Internationalisation

L'application supporte le français et l'anglais. Les traductions se trouvent dans :

- `public/locales/fr.json`
- `public/locales/en.json`

Pour utiliser les traductions dans un composant :

```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');
  return <h1>{t('welcome')}</h1>;
}
```

## 🎭 Animations

Les animations utilisent **Framer Motion** :

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Contenu animé
</motion.div>
```

## 🎯 Drag and Drop

Le système de transfert par glisser-déposer utilise **react-dnd** :

```tsx
import { TransferZone } from '@/components/organisms/TransferZone';

<TransferZone
  accounts={accounts}
  onTransfer={(from, to, amount) => {
    // Gérer le transfert
  }}
/>
```

## 💾 Cache

### Cache Redis (Optionnel)

```typescript
import { getCachedData, setCachedData } from '@/lib/redis';

// Récupérer depuis le cache
const data = await getCachedData('my-key');

// Mettre en cache
await setCachedData('my-key', data, 3600); // TTL: 1 heure
```

### Cache Next.js

```typescript
// App Router avec revalidation
export const revalidate = 3600; // 1 heure

// Fetch avec cache
fetch(url, {
  next: { revalidate: 3600, tags: ['my-data'] }
});
```

## 📝 Formulaires

Les formulaires utilisent **React Hook Form** et **Zod** :

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

## 🎨 Styling

L'application utilise **Tailwind CSS** avec des variables personnalisées :

```css
/* globals.css */
@layer base {
  :root {
    --primary-50: 239 246 255;
    --primary-600: 37 99 235;
    /* ... */
  }
}
```

## 📊 SEO

Chaque page inclut des metadata optimisées :

```tsx
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
  },
};
```

## 🔒 Authentification

Le contexte `AuthContext` gère l'authentification :

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  return user ? <Dashboard /> : <Login />;
}
```

## 📦 Build & Déploiement

```bash
# Build
npm run build

# Vérifier le build
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Coverage
npm run test:coverage
```

## 📚 Technologies

- **Next.js 14** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styling utilitaire
- **Framer Motion** : Animations
- **React Hook Form** : Gestion de formulaires
- **Zod** : Validation de schémas
- **next-intl** : Internationalisation
- **react-dnd** : Drag and Drop
- **Redis** : Cache distribué (optionnel)

## 🤝 Contribution

Ce projet suit les principes de Clean Architecture et Atomic Design. Respectez la structure des composants lors de vos contributions.

## 📄 License

Projet académique - Tous droits réservés
