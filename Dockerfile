# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Installer les dépendances avec legacy-peer-deps
RUN npm ci --legacy-peer-deps

# Copier le code source
COPY src ./src

# Build l'application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production --legacy-peer-deps

# Copier les fichiers buildés
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3000

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

# Démarrer l'application
CMD ["node", "dist/interface/nestjs/main.js"]
