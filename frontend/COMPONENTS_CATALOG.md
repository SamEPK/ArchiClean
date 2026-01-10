# 📦 Catalogue des Composants - Frontend Banque AVENIR

## 🔹 Atoms (Composants de Base)

### Button
**Chemin** : `src/components/atoms/Button.tsx`

Bouton personnalisable avec plusieurs variants.

**Props** :
```typescript
{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}
```

**Utilisation** :
```tsx
<Button variant="primary" size="md">
  Cliquez ici
</Button>
```

---

### Input
**Chemin** : `src/components/atoms/Input.tsx`

Champ de saisie avec support d'icônes et erreurs.

**Props** :
```typescript
{
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}
```

**Utilisation** :
```tsx
<Input
  type="email"
  placeholder="email@example.com"
  error={errors.email?.message}
/>
```

---

### Card
**Chemin** : `src/components/atoms/Card.tsx`

Carte conteneur avec header, content, footer.

**Composants** :
- `Card` - Conteneur principal
- `CardHeader` - En-tête
- `CardTitle` - Titre
- `CardContent` - Contenu
- `CardFooter` - Pied de page

**Utilisation** :
```tsx
<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>
    Contenu de la carte
  </CardContent>
</Card>
```

---

### Badge
**Chemin** : `src/components/atoms/Badge.tsx`

Badge coloré pour afficher des statuts.

**Props** :
```typescript
{
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}
```

**Utilisation** :
```tsx
<Badge variant="success" dot>
  Actif
</Badge>
```

---

### Avatar
**Chemin** : `src/components/atoms/Avatar.tsx`

Avatar utilisateur avec initiales ou image.

**Props** :
```typescript
{
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}
```

**Utilisation** :
```tsx
<Avatar
  name="John Doe"
  status="online"
  size="md"
/>
```

---

### Loading
**Chemin** : `src/components/atoms/Loading.tsx`

Indicateur de chargement avec plusieurs styles.

**Props** :
```typescript
{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  className?: string;
}
```

**Utilisation** :
```tsx
<Loading
  size="lg"
  variant="spinner"
  text="Chargement..."
/>
```

---

### Skeleton
**Chemin** : `src/components/atoms/Loading.tsx`

Placeholder animé pendant le chargement.

**Props** :
```typescript
{
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}
```

**Utilisation** :
```tsx
<Skeleton variant="text" width="100%" />
<Skeleton variant="circular" width={40} height={40} />
```

---

### Select
**Chemin** : `src/components/atoms/Select.tsx`

Sélecteur déroulant personnalisé.

**Props** :
```typescript
{
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}
```

**Utilisation** :
```tsx
<Select
  options={[
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' }
  ]}
  value={language}
  onChange={setLanguage}
/>
```

---

## 🔸 Molecules (Composants Composés)

### FormField
**Chemin** : `src/components/molecules/FormField.tsx`

Champ de formulaire complet avec label et gestion d'erreur.

**Props** :
```typescript
{
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

**Utilisation** :
```tsx
<FormField
  label="Email"
  error={errors.email?.message}
  required
>
  <Input {...register('email')} />
</FormField>
```

---

### NavBar
**Chemin** : `src/components/molecules/NavBar.tsx`

Barre de navigation responsive avec authentification.

**Props** :
```typescript
{
  className?: string;
}
```

**Features** :
- Navigation responsive
- Menu mobile
- Avatar utilisateur
- Boutons Login/Logout
- Sélecteur de langue

**Utilisation** :
```tsx
<NavBar />
```

---

### Footer
**Chemin** : `src/components/molecules/Footer.tsx`

Pied de page avec liens et informations.

**Props** :
```typescript
{
  className?: string;
}
```

**Contenu** :
- Logo et description
- Liens de navigation
- Réseaux sociaux
- Copyright

**Utilisation** :
```tsx
<Footer />
```

---

### TransactionList
**Chemin** : `src/components/molecules/TransactionList.tsx`

Liste de transactions avec badges de statut.

**Props** :
```typescript
{
  transactions: Transaction[];
  className?: string;
  onTransactionClick?: (transaction: Transaction) => void;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  recipient?: string;
}
```

**Utilisation** :
```tsx
<TransactionList
  transactions={transactions}
  onTransactionClick={handleClick}
/>
```

---

### LanguageSwitcher
**Chemin** : `src/components/molecules/LanguageSwitcher.tsx`

Sélecteur de langue FR/EN.

**Props** :
```typescript
{
  className?: string;
}
```

**Features** :
- Changement instantané
- Indicateur visuel
- Support FR et EN

**Utilisation** :
```tsx
<LanguageSwitcher />
```

---

## 🔷 Organisms (Composants Complexes)

### LoginForm
**Chemin** : `src/components/organisms/LoginForm.tsx`

Formulaire de connexion complet avec validation.

**Props** :
```typescript
{
  onSubmit: (data: LoginFormData) => Promise<void>;
  className?: string;
}

interface LoginFormData {
  email: string;
  password: string;
  role: 'client' | 'advisor' | 'director';
}
```

**Features** :
- Validation avec Zod
- Messages d'erreur
- Sélection du rôle
- États de chargement

**Utilisation** :
```tsx
<LoginForm onSubmit={handleLogin} />
```

---

### AccountsGrid
**Chemin** : `src/components/organisms/AccountsGrid.tsx`

Grille de comptes bancaires avec animations.

**Props** :
```typescript
{
  accounts: Account[];
  className?: string;
  onAccountClick?: (account: Account) => void;
}

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'investment';
  accountNumber: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive';
}
```

**Features** :
- Animation d'entrée en cascade
- Hover avec scale
- Dégradés par type de compte
- Actions rapides (Virement, Détails)

**Utilisation** :
```tsx
<AccountsGrid
  accounts={accounts}
  onAccountClick={handleAccountClick}
/>
```

---

### StocksList
**Chemin** : `src/components/organisms/StocksList.tsx`

Liste d'actions boursières avec prix et variations.

**Props** :
```typescript
{
  stocks: Stock[];
  className?: string;
  showQuantity?: boolean;
  onStockClick?: (stock: Stock) => void;
  onBuy?: (stock: Stock) => void;
  onSell?: (stock: Stock) => void;
}

interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  quantity?: number;
}
```

**Features** :
- Animation progressive
- Badges de variation (vert/rouge)
- Boutons Acheter/Vendre
- Calcul valeur totale

**Utilisation** :
```tsx
<StocksList
  stocks={stocks}
  showQuantity
  onBuy={handleBuy}
  onSell={handleSell}
/>
```

---

### TransferZone
**Chemin** : `src/components/organisms/TransferZone.tsx`

Zone de transfert d'argent avec drag'n'drop.

**Props** :
```typescript
{
  accounts: Account[];
  onTransfer: (fromAccountId: string, toAccountId: string, amount: number) => void;
  className?: string;
}
```

**Features** :
- Drag'n'drop de comptes
- Zones de dépôt animées
- Modal de confirmation
- Validation montant en temps réel
- Instructions visuelles

**Utilisation** :
```tsx
<TransferZone
  accounts={accounts}
  onTransfer={handleTransfer}
/>
```

---

### ClientDashboard
**Chemin** : `src/components/organisms/ClientDashboard.tsx`

Dashboard client complet avec statistiques et données.

**Props** :
```typescript
{
  className?: string;
}
```

**Features** :
- Cartes de statistiques animées
- Grille de comptes
- Liste de transactions récentes
- Portfolio d'actions
- Animation en cascade

**Utilisation** :
```tsx
<ClientDashboard />
```

---

## 🎨 Système de Design

### Couleurs

```css
Primary: --primary-50 à --primary-900
Secondary: --secondary-50 à --secondary-900
Success: Green
Warning: Yellow
Danger: Red
Info: Blue
```

### Tailles

```typescript
sm: small
md: medium (default)
lg: large
xl: extra large
2xl: double extra large
```

### Variantes

```typescript
primary: Couleur principale
secondary: Couleur secondaire
outline: Bordure uniquement
ghost: Transparent avec hover
danger: Rouge (actions destructives)
success: Vert (confirmations)
warning: Jaune (avertissements)
info: Bleu (informations)
```

---

## 🔧 Conventions d'Utilisation

### Import
```tsx
import { ComponentName } from '@/components/category/ComponentName';
```

### Props TypeScript
Toujours typer les props avec une interface ou un type.

### className
Utiliser `clsx` pour les classes conditionnelles :
```tsx
className={clsx(
  'base-class',
  condition && 'conditional-class',
  anotherCondition ? 'class-a' : 'class-b'
)}
```

### Accessibilité
- Toujours inclure `aria-label` sur les boutons sans texte
- Utiliser des labels pour les inputs
- Respecter la hiérarchie des headings

---

## 📚 Ressources

- **Storybook** (à venir) : Pour visualiser tous les composants
- **Tests** (à venir) : Tests unitaires avec Jest et React Testing Library
- **Documentation** : Ce fichier + JSDoc dans le code

---

**Composants créés avec ❤️ pour Banque AVENIR**
