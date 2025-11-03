# Module Messagerie & Communication Temps Réel - Progression

**Auteur**: FOUAD
**Date**: 2025-11-03
**Points**: ~6 points
**Statut**: 🚧 EN COURS

---

## 📊 Progression actuelle

### ✅ Complété (30%)

#### 1. Entités du Domaine
- ✅ **PrivateMessage** (src/domain/entities/PrivateMessage.ts) - Messages privés entre clients
- ✅ **Friendship** (src/domain/entities/Friendship.ts) - Gestion des relations d'amitié
- ✅ **Group** (src/domain/entities/Group.ts) - Groupes publics/privés
- ✅ **GroupMember** (src/domain/entities/GroupMember.ts) - Membres des groupes avec rôles
- ✅ **GroupMessage** (src/domain/entities/GroupMessage.ts) - Messages dans les groupes

#### 2. Interfaces des Repositories
- ✅ **IPrivateMessageRepository** - CRUD messages privés
- ✅ **IFriendshipRepository** - Gestion des amitiés
- ✅ **IGroupRepository** - CRUD groupes
- ✅ **IGroupMemberRepository** - Gestion membres groupes
- ✅ **IGroupMessageRepository** - Messages groupes

---

## 🚧 À faire (70%)

### Infrastructure WebSocket (Priorité 1)
- ⏳ Installer Socket.io et dépendances NestJS
- ⏳ Créer WebSocketGateway avec gestion connexions
- ⏳ Implémenter système de rooms
- ⏳ Gérer connexions/déconnexions

### Use Cases (Priorité 2)

#### Messages Privés
- ⏳ `SendPrivateMessageUseCase` - Envoi message
- ⏳ `GetConversationHistoryUseCase` - Historique
- ⏳ `MarkMessageAsReadUseCase` - Indicateurs lecture

#### Système d'Amitié
- ⏳ `SendFriendRequestUseCase` - Envoi demande
- ⏳ `AcceptFriendRequestUseCase` - Acceptation
- ⏳ `RejectFriendRequestUseCase` - Refus
- ⏳ `GetFriendsListUseCase` - Liste amis
- ⏳ `GetPendingRequestsUseCase` - Demandes en attente

#### Groupes
- ⏳ `CreateGroupUseCase` - Création groupe
- ⏳ `InviteToGroupUseCase` - Invitation membres
- ⏳ `JoinGroupUseCase` - Rejoindre groupe (public)
- ⏳ `LeaveGroupUseCase` - Quitter groupe
- ⏳ `SendGroupMessageUseCase` - Envoyer message
- ⏳ `GetGroupMessagesUseCase` - Historique groupe
- ⏳ `GetGroupMembersUseCase` - Liste membres

### Repositories (Priorité 3)
- ⏳ InMemoryPrivateMessageRepository
- ⏳ InMemoryFriendshipRepository
- ⏳ InMemoryGroupRepository
- ⏳ InMemoryGroupMemberRepository
- ⏳ InMemoryGroupMessageRepository
- ⏳ Versions MongoDB de tous les repositories

### Interface (Priorité 4)
- ⏳ MessagingController (REST endpoints)
- ⏳ WebSocketGateway (Socket.io events)
- ⏳ MessagingModule
- ⏳ Intégration dans AppModule

### Features Bonus
- ⏳ Typing indicator (en train d'écrire)
- ⏳ Online/Offline status
- ⏳ Message notifications

### Tests (Priorité 5)
- ⏳ Tests unitaires pour toutes les entités
- ⏳ Tests pour tous les use cases
- ⏳ Tests d'intégration WebSocket

---

## 🏗️ Architecture prévue

```
Domain Layer (✅ Complété)
├── entities/
│   ├── PrivateMessage.ts
│   ├── Friendship.ts
│   ├── Group.ts
│   ├── GroupMember.ts
│   └── GroupMessage.ts
└── repositories/
    ├── IPrivateMessageRepository.ts
    ├── IFriendshipRepository.ts
    ├── IGroupRepository.ts
    ├── IGroupMemberRepository.ts
    └── IGroupMessageRepository.ts

Application Layer (⏳ À faire)
└── use-cases/
    ├── messaging/
    │   ├── SendPrivateMessageUseCase.ts
    │   ├── GetConversationHistoryUseCase.ts
    │   └── MarkMessageAsReadUseCase.ts
    ├── friendship/
    │   ├── SendFriendRequestUseCase.ts
    │   ├── AcceptFriendRequestUseCase.ts
    │   ├── RejectFriendRequestUseCase.ts
    │   └── GetFriendsListUseCase.ts
    └── group/
        ├── CreateGroupUseCase.ts
        ├── InviteToGroupUseCase.ts
        ├── SendGroupMessageUseCase.ts
        └── GetGroupMessagesUseCase.ts

Infrastructure Layer (⏳ À faire)
├── repositories/
│   ├── in-memory/
│   │   ├── InMemoryPrivateMessageRepository.ts
│   │   ├── InMemoryFriendshipRepository.ts
│   │   ├── InMemoryGroupRepository.ts
│   │   ├── InMemoryGroupMemberRepository.ts
│   │   └── InMemoryGroupMessageRepository.ts
│   └── mongodb/
│       └── (versions MongoDB)
└── websocket/
    └── (Socket.io configuration)

Interface Layer (⏳ À faire)
├── nestjs/
│   ├── controllers/
│   │   └── messaging.controller.ts
│   ├── gateways/
│   │   └── messaging.gateway.ts
│   └── modules/
│       └── messaging.module.ts
```

---

## 📡 Events WebSocket prévus

### Client → Serveur
```typescript
// Messages privés
'send:private-message' → { receiverId, content }
'mark:read' → { messageId }

// Typing indicator
'typing:start' → { receiverId }
'typing:stop' → { receiverId }

// Groupes
'send:group-message' → { groupId, content }
'group:typing:start' → { groupId }
'group:typing:stop' → { groupId }

// Connexion
'user:online' → { userId }
'user:offline' → { userId }
```

### Serveur → Client
```typescript
// Messages privés
'receive:private-message' → { message: PrivateMessage }
'message:read' → { messageId, readBy }

// Typing indicator
'user:typing' → { userId, isTyping }

// Groupes
'receive:group-message' → { message: GroupMessage }
'group:typing' → { groupId, userId, isTyping }

// Amis
'friend:request' → { friendship: Friendship }
'friend:accepted' → { friendship: Friendship }

// Statut
'user:status' → { userId, status: 'online'|'offline' }
```

---

## 🔧 Dépendances à ajouter

```json
{
  "dependencies": {
    "@nestjs/websockets": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "socket.io": "^4.6.0"
  },
  "devDependencies": {
    "@types/socket.io": "^3.0.2"
  }
}
```

---

## 🎯 Fonctionnalités implémentées

### ✅ Domaine complet (30%)
1. **Messages privés** - Entité avec marquage lecture
2. **Système d'amitié** - États: pending, accepted, rejected, blocked
3. **Groupes** - Public/Private avec gestion membres
4. **Membres groupes** - Rôles: owner, admin, member
5. **Messages groupes** - Communication multi-utilisateurs

### Fonctionnalités métier
- ✅ Conversation ID consistant (indépendant de l'ordre sender/receiver)
- ✅ Gestion états amitié avec validations
- ✅ Système de rôles dans les groupes
- ✅ Invitations pour groupes privés
- ✅ Protection: owner ne peut être banni/démote

---

## 📈 Prochaines étapes

### Phase 1: Infrastructure WebSocket (2-3h)
1. Installer Socket.io
2. Créer WebSocketGateway de base
3. Gérer connexions/déconnexions
4. Système de rooms

### Phase 2: Use Cases Core (3-4h)
1. Messages privés (send, get history)
2. Système d'amitié (request, accept, list)
3. Groupes (create, invite, send message)

### Phase 3: Repositories (2h)
1. Implémentations in-memory
2. Tests unitaires

### Phase 4: Integration (2h)
1. Controller REST
2. WebSocket Gateway complet
3. Module NestJS
4. Tests d'intégration

### Phase 5: Features Bonus (1-2h)
1. Typing indicator
2. Online/Offline status
3. Notifications

**Estimation totale**: 10-13 heures de développement

---

## 💡 Notes techniques

### Sécurité
- Vérifier que les utilisateurs sont amis avant message privé
- Vérifier appartenance au groupe avant message groupe
- Valider permissions pour actions admin (ban, promote, etc.)
- Authentification WebSocket via JWT/session

### Performance
- Limiter historique messages (pagination)
- Cache des listes d'amis
- Index MongoDB sur les clés fréquentes
- Déconnexion auto après timeout

### Évolutivité
- Structure prête pour sharding
- Repositories abstraits (MongoDB/Redis)
- Events découplés
- Microservices-ready

---

## 📝 Fichiers créés

### Domain
- [src/domain/entities/PrivateMessage.ts](src/domain/entities/PrivateMessage.ts)
- [src/domain/entities/Friendship.ts](src/domain/entities/Friendship.ts)
- [src/domain/entities/Group.ts](src/domain/entities/Group.ts)
- [src/domain/entities/GroupMember.ts](src/domain/entities/GroupMember.ts)
- [src/domain/entities/GroupMessage.ts](src/domain/entities/GroupMessage.ts)
- [src/domain/repositories/IPrivateMessageRepository.ts](src/domain/repositories/IPrivateMessageRepository.ts)
- [src/domain/repositories/IFriendshipRepository.ts](src/domain/repositories/IFriendshipRepository.ts)
- [src/domain/repositories/IGroupRepository.ts](src/domain/repositories/IGroupRepository.ts)
- [src/domain/repositories/IGroupMemberRepository.ts](src/domain/repositories/IGroupMemberRepository.ts)
- [src/domain/repositories/IGroupMessageRepository.ts](src/domain/repositories/IGroupMessageRepository.ts)

---

**Statut**: Fondations solides posées (30%). Prêt pour la phase de développement intensive des use cases et de l'infrastructure WebSocket.

Pour continuer le développement, il faudra:
1. Installer les dépendances Socket.io
2. Implémenter les use cases un par un
3. Créer les repositories
4. Intégrer WebSocket
5. Tester l'ensemble

Ce module est plus complexe que le module Client car il nécessite:
- Communication bidirectionnelle temps réel
- Gestion d'états connectés
- Multiple entités inter-reliées
- Events asynchrones
- Tests WebSocket plus complexes

**Temps estimé pour complétion**: 10-13 heures supplémentaires
