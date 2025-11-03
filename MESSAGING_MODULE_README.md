# Module Messagerie & Communication Temps Réel

**Auteur**: FOUAD
**Points**: ~6 points
**Statut**: 🚧 **FONDATIONS COMPLÉTÉES (30%)** - Prêt pour implémentation complète

---

## 📋 Vue d'ensemble

Ce module implémente un système complet de messagerie et communication temps réel avec WebSocket, incluant:
- Messages privés entre amis
- Système de réseautage (demandes d'amis)
- Groupes de discussion publics/privés
- Communication temps réel via WebSocket
- Indicateurs de frappe (bonus)

---

## ✅ Ce qui est implémenté (30%)

### 1. **Entités du Domaine** ✅ COMPLET

#### PrivateMessage
```typescript
- id: string
- senderId: string
- receiverId: string
- content: string
- isRead: boolean
- createdAt: Date
- updatedAt?: Date

Méthodes:
- markAsRead(): void
- getConversationId(): string  // ID consistant indépendant de l'ordre
```

**Fichier**: [src/domain/entities/PrivateMessage.ts](src/domain/entities/PrivateMessage.ts)

#### Friendship
```typescript
- id: string
- requesterId: string
- addresseeId: string
- status: 'pending' | 'accepted' | 'rejected' | 'blocked'
- createdAt: Date
- updatedAt?: Date

Méthodes:
- accept(): void
- reject(): void
- block(): void
- isPending(): boolean
- isAccepted(): boolean
- areFriends(userId1, userId2): boolean
```

**Fichier**: [src/domain/entities/Friendship.ts](src/domain/entities/Friendship.ts)

#### Group
```typescript
- id: string
- name: string
- description?: string
- creatorId: string
- visibility: 'public' | 'private'
- createdAt: Date
- updatedAt?: Date

Méthodes:
- updateInfo(name?, description?): void
- changeVisibility(visibility): void
- isPublic(): boolean
- isPrivate(): boolean
```

**Fichier**: [src/domain/entities/Group.ts](src/domain/entities/Group.ts)

#### GroupMember
```typescript
- id: string
- groupId: string
- userId: string
- role: 'owner' | 'admin' | 'member'
- status: 'active' | 'invited' | 'banned'
- joinedAt: Date
- updatedAt?: Date

Méthodes:
- promoteToAdmin(): void
- demoteToMember(): void
- acceptInvitation(): void
- ban(): void
- unban(): void
- isOwner(): boolean
- isAdmin(): boolean
- isActive(): boolean
```

**Fichier**: [src/domain/entities/GroupMember.ts](src/domain/entities/GroupMember.ts)

#### GroupMessage
```typescript
- id: string
- groupId: string
- senderId: string
- content: string
- createdAt: Date
- updatedAt?: Date
```

**Fichier**: [src/domain/entities/GroupMessage.ts](src/domain/entities/GroupMessage.ts)

### 2. **Interfaces des Repositories** ✅ COMPLET

Toutes les interfaces de repositories sont définies et prêtes:

- **IPrivateMessageRepository** - CRUD messages privés + conversation history
- **IFriendshipRepository** - Gestion amitiés + recherches
- **IGroupRepository** - CRUD groupes
- **IGroupMemberRepository** - Gestion membres
- **IGroupMessageRepository** - Messages groupes

**Fichiers**: [src/domain/repositories/](src/domain/repositories/)

### 3. **Use Cases** ✅ PARTIELLEMENT (3/15+)

#### SendPrivateMessageUseCase ✅
- Validation que les utilisateurs sont amis
- Création et sauvegarde du message
- Notification WebSocket du destinataire
- Gestion d'erreurs appropriée

**Fichier**: [src/application/use-cases/SendPrivateMessageUseCase.ts](src/application/use-cases/SendPrivateMessageUseCase.ts)

#### SendFriendRequestUseCase ✅
- Validation de l'existence du destinataire
- Vérification de demandes existantes
- Gestion des différents états (pending, accepted, rejected, blocked)
- Création de la relation d'amitié

**Fichier**: [src/application/use-cases/SendFriendRequestUseCase.ts](src/application/use-cases/SendFriendRequestUseCase.ts)

#### AcceptFriendRequestUseCase ✅
- Vérification que seul l'addressee peut accepter
- Validation de l'état (doit être pending)
- Mise à jour du statut

**Fichier**: [src/application/use-cases/AcceptFriendRequestUseCase.ts](src/application/use-cases/AcceptFriendRequestUseCase.ts)

---

## 🚧 Ce qui reste à implémenter (70%)

### Use Cases à créer (12+)

#### Messages Privés
- ⏳ `GetConversationHistoryUseCase` - Récupérer historique discussion
- ⏳ `MarkMessageAsReadUseCase` - Marquer comme lu
- ⏳ `GetUnreadMessagesCountUseCase` - Compteur messages non lus

#### Système d'Amitié
- ⏳ `RejectFriendRequestUseCase` - Refuser demande
- ⏳ `BlockUserUseCase` - Bloquer utilisateur
- ⏳ `UnblockUserUseCase` - Débloquer
- ⏳ `GetFriendsListUseCase` - Liste des amis
- ⏳ `GetPendingRequestsUseCase` - Demandes en attente
- ⏳ `RemoveFriendUseCase` - Supprimer ami

#### Groupes
- ⏳ `CreateGroupUseCase` - Créer groupe
- ⏳ `InviteToGroupUseCase` - Inviter membres (privé)
- ⏳ `JoinGroupUseCase` - Rejoindre (public)
- ⏳ `LeaveGroupUseCase` - Quitter groupe
- ⏳ `SendGroupMessageUseCase` - Envoyer message groupe
- ⏳ `GetGroupMessagesUseCase` - Historique groupe
- ⏳ `GetGroupMembersUseCase` - Liste membres
- ⏳ `PromoteMemberUseCase` - Promouvoir admin
- ⏳ `BanMemberUseCase` - Bannir membre

### Infrastructure WebSocket ⏳

#### Installation
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/socket.io
```

#### WebSocketGateway à créer
```typescript
@WebSocketGateway({
  cors: { origin: '*' }
})
export class MessagingGateway {
  @SubscribeMessage('send:private-message')
  handlePrivateMessage() { }

  @SubscribeMessage('typing:start')
  handleTypingStart() { }

  @SubscribeMessage('send:group-message')
  handleGroupMessage() { }

  // etc.
}
```

### Repositories ⏳

#### In-Memory (pour tests)
- ⏳ InMemoryPrivateMessageRepository
- ⏳ InMemoryFriendshipRepository
- ⏳ InMemoryGroupRepository
- ⏳ InMemoryGroupMemberRepository
- ⏳ InMemoryGroupMessageRepository

#### MongoDB (pour production)
- ⏳ MongoPrivateMessageRepository
- ⏳ MongoFriendshipRepository
- ⏳ MongoGroupRepository
- ⏳ MongoGroupMemberRepository
- ⏳ MongoGroupMessageRepository

### Interface NestJS ⏳

#### Controller REST
- ⏳ `POST /messaging/send` - Envoyer message privé
- ⏳ `GET /messaging/conversations/:userId` - Historique
- ⏳ `POST /friendships/request` - Demande d'ami
- ⏳ `POST /friendships/:id/accept` - Accepter
- ⏳ `GET /friendships/friends` - Liste amis
- ⏳ `POST /groups` - Créer groupe
- ⏳ `POST /groups/:id/messages` - Message groupe
- ⏳ `GET /groups/:id/members` - Membres

#### MessagingModule
```typescript
@Module({
  imports: [],
  controllers: [MessagingController],
  providers: [
    MessagingGateway,
    // Use cases providers
    // Repositories providers
  ],
})
export class MessagingModule {}
```

### Tests ⏳

- ⏳ Tests unitaires entités (Friendship, Group, etc.)
- ⏳ Tests use cases (tous)
- ⏳ Tests repositories
- ⏳ Tests d'intégration WebSocket
- ⏳ Tests E2E

### Features Bonus ⏳

- ⏳ Typing indicator (en train d'écrire)
- ⏳ Online/Offline status
- ⏳ Message delivery status (sent/delivered/read)
- ⏳ Push notifications

---

## 🏗️ Architecture

Le module suit **Clean Architecture**:

```
Domain Layer (✅ 100%)
├── entities/ (5 entités)
│   ├── PrivateMessage
│   ├── Friendship
│   ├── Group
│   ├── GroupMember
│   └── GroupMessage
└── repositories/ (5 interfaces)

Application Layer (⏳ 20%)
└── use-cases/
    ├── 3 use cases implémentés
    └── 12+ use cases à implémenter

Infrastructure Layer (⏳ 0%)
├── repositories/in-memory/
├── repositories/mongodb/
└── websocket/

Interface Layer (⏳ 0%)
├── controllers/
├── gateways/
└── modules/
```

---

## 🔧 Guide d'implémentation (suite)

### Étape 1: Installer Socket.io

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/socket.io
```

### Étape 2: Créer les repositories in-memory

Exemple pour PrivateMessage:

```typescript
export class InMemoryPrivateMessageRepository implements IPrivateMessageRepository {
  private messages: Map<string, PrivateMessage> = new Map();

  async create(message: PrivateMessage): Promise<void> {
    this.messages.set(message.id, message);
  }

  async findConversation(userId1: string, userId2: string, limit = 50): Promise<PrivateMessage[]> {
    const messages = Array.from(this.messages.values())
      .filter(m =>
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return messages;
  }

  // ... autres méthodes
}
```

### Étape 3: Implémenter les use cases restants

Suivre le pattern des 3 use cases existants:
1. Validation des entrées
2. Vérifications métier
3. Appel repository
4. Notification WebSocket si nécessaire

### Étape 4: Créer le WebSocket Gateway

```typescript
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagingGateway {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.connectedUsers.set(userId, client.id);
    client.join(`user_${userId}`);
  }

  handleDisconnect(client: Socket) {
    // Remove from connectedUsers
  }

  @SubscribeMessage('send:private-message')
  async handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string }
  ) {
    // Use SendPrivateMessageUseCase
    // Emit to receiver
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string }
  ) {
    this.server.to(`user_${data.receiverId}`).emit('user:typing', {
      userId: client.handshake.query.userId,
      isTyping: true
    });
  }

  // ... autres handlers
}
```

### Étape 5: Créer le Controller REST

```typescript
@Controller('messaging')
export class MessagingController {
  constructor(
    private sendPrivateMessageUseCase: SendPrivateMessageUseCase,
    private getFriendsListUseCase: GetFriendsListUseCase,
    // ... autres use cases
  ) {}

  @Post('send')
  async sendMessage(@Body() body: { receiverId: string; content: string }, @Request() req) {
    return await this.sendPrivateMessageUseCase.execute(
      req.user.id,
      body.receiverId,
      body.content
    );
  }

  // ... autres endpoints
}
```

### Étape 6: Créer le Module

```typescript
@Module({
  controllers: [MessagingController],
  providers: [
    MessagingGateway,
    SendPrivateMessageUseCase,
    SendFriendRequestUseCase,
    AcceptFriendRequestUseCase,
    // ... autres use cases
    {
      provide: 'IPrivateMessageRepository',
      useClass: InMemoryPrivateMessageRepository,
    },
    // ... autres repositories
  ],
})
export class MessagingModule {}
```

### Étape 7: Tests

Exemple de test pour SendPrivateMessageUseCase:

```typescript
describe('SendPrivateMessageUseCase', () => {
  let useCase: SendPrivateMessageUseCase;
  let messageRepo: InMemoryPrivateMessageRepository;
  let friendshipRepo: InMemoryFriendshipRepository;
  let notifier: IWebSocketNotifier;

  beforeEach(() => {
    messageRepo = new InMemoryPrivateMessageRepository();
    friendshipRepo = new InMemoryFriendshipRepository();
    notifier = { notifyNewMessage: jest.fn() };
    useCase = new SendPrivateMessageUseCase(messageRepo, friendshipRepo, notifier);
  });

  it('should send message between friends', async () => {
    // Setup friendship
    const friendship = new Friendship({
      id: 'f1',
      requesterId: 'user1',
      addresseeId: 'user2',
      status: 'accepted',
      createdAt: new Date(),
    });
    await friendshipRepo.create(friendship);

    // Send message
    const message = await useCase.execute('user1', 'user2', 'Hello!');

    expect(message.content).toBe('Hello!');
    expect(notifier.notifyNewMessage).toHaveBeenCalledWith('user2', message);
  });

  it('should reject message to non-friend', async () => {
    await expect(
      useCase.execute('user1', 'user2', 'Hello!')
    ).rejects.toThrow('You can only send messages to your friends');
  });
});
```

---

## 📡 API WebSocket Events

### Client → Serveur

```typescript
// Messages privés
socket.emit('send:private-message', { receiverId: 'user123', content: 'Hello!' });
socket.emit('mark:read', { messageId: 'msg123' });

// Typing indicator
socket.emit('typing:start', { receiverId: 'user123' });
socket.emit('typing:stop', { receiverId: 'user123' });

// Groupes
socket.emit('send:group-message', { groupId: 'group123', content: 'Hello everyone!' });
socket.emit('group:typing:start', { groupId: 'group123' });

// Connexion avec userId
const socket = io('http://localhost:3001', {
  query: { userId: 'myUserId' }
});
```

### Serveur → Client

```typescript
// Recevoir messages
socket.on('receive:private-message', (data) => {
  // { message: PrivateMessage }
});

// Typing indicator
socket.on('user:typing', (data) => {
  // { userId: 'user123', isTyping: true }
});

// Messages groupe
socket.on('receive:group-message', (data) => {
  // { message: GroupMessage }
});

// Demandes d'amis
socket.on('friend:request', (data) => {
  // { friendship: Friendship }
});

socket.on('friend:accepted', (data) => {
  // { friendship: Friendship }
});

// Statut utilisateur
socket.on('user:status', (data) => {
  // { userId: 'user123', status: 'online' }
});
```

---

## 📊 Estimation du travail restant

| Tâche | Temps estimé | Statut |
|-------|--------------|--------|
| Use cases messages privés | 2h | ⏳ |
| Use cases amitiés | 2h | ⏳ |
| Use cases groupes | 3h | ⏳ |
| Repositories in-memory | 2h | ⏳ |
| Repositories MongoDB | 2h | ⏳ |
| WebSocket Gateway | 3h | ⏳ |
| Controller REST | 2h | ⏳ |
| Tests unitaires | 4h | ⏳ |
| Tests intégration | 2h | ⏳ |
| Features bonus | 2h | ⏳ |
| **TOTAL** | **24h** | ⏳ |

---

## 🎯 Fonctionnalités métier implémentées

### ✅ Dans les entités

1. **Messages privés**
   - Marquage comme lu
   - ID de conversation consistant (indépendant de l'ordre sender/receiver)

2. **Système d'amitié complet**
   - États: pending, accepted, rejected, blocked
   - Transitions validées
   - Méthode `areFriends()` pour vérifications

3. **Groupes avec visibilité**
   - Public: tout le monde peut rejoindre
   - Privé: invitation requise

4. **Membres avec rôles**
   - Owner: créateur, ne peut être démis
   - Admin: peut gérer le groupe
   - Member: utilisateur standard

5. **Statuts membres**
   - Active: membre actif
   - Invited: invitation en attente
   - Banned: banni du groupe

### ✅ Dans les use cases

1. **SendPrivateMessageUseCase**
   - Vérification que les utilisateurs sont amis
   - Ne peut envoyer à soi-même
   - Notification WebSocket automatique

2. **SendFriendRequestUseCase**
   - Vérification existence destinataire
   - Empêche doublons
   - Gestion tous les cas d'états existants

3. **AcceptFriendRequestUseCase**
   - Seul l'addressee peut accepter
   - Validation de l'état pending

---

## 💡 Points techniques importants

### Sécurité

- ✅ Vérification amitié avant envoi message
- ✅ Validation propriété demande d'ami
- ⏳ Authentification WebSocket (JWT/session)
- ⏳ Vérification appartenance groupe
- ⏳ Validation permissions admin

### Performance

- ⏳ Pagination historique messages
- ⏳ Cache liste amis
- ⏳ Index MongoDB (userId, groupId, etc.)
- ⏳ Déconnexion automatique timeout

### Évolutivité

- ✅ Architecture découplée (repositories abstraits)
- ✅ Events WebSocket séparés de la logique métier
- ⏳ Prêt pour Redis pub/sub (multi-serveurs)
- ⏳ Prêt pour microservices

---

## 📝 Fichiers créés

### Domain Layer (✅ 100%)
- [src/domain/entities/PrivateMessage.ts](src/domain/entities/PrivateMessage.ts) - 38 lignes
- [src/domain/entities/Friendship.ts](src/domain/entities/Friendship.ts) - 65 lignes
- [src/domain/entities/Group.ts](src/domain/entities/Group.ts) - 52 lignes
- [src/domain/entities/GroupMember.ts](src/domain/entities/GroupMember.ts) - 91 lignes
- [src/domain/entities/GroupMessage.ts](src/domain/entities/GroupMessage.ts) - 23 lignes
- [src/domain/repositories/IPrivateMessageRepository.ts](src/domain/repositories/IPrivateMessageRepository.ts) - 11 lignes
- [src/domain/repositories/IFriendshipRepository.ts](src/domain/repositories/IFriendshipRepository.ts) - 14 lignes
- [src/domain/repositories/IGroupRepository.ts](src/domain/repositories/IGroupRepository.ts) - 13 lignes
- [src/domain/repositories/IGroupMemberRepository.ts](src/domain/repositories/IGroupMemberRepository.ts) - 13 lignes
- [src/domain/repositories/IGroupMessageRepository.ts](src/domain/repositories/IGroupMessageRepository.ts) - 10 lignes

### Application Layer (⏳ 20%)
- [src/application/use-cases/SendPrivateMessageUseCase.ts](src/application/use-cases/SendPrivateMessageUseCase.ts) - 61 lignes
- [src/application/use-cases/SendFriendRequestUseCase.ts](src/application/use-cases/SendFriendRequestUseCase.ts) - 62 lignes
- [src/application/use-cases/AcceptFriendRequestUseCase.ts](src/application/use-cases/AcceptFriendRequestUseCase.ts) - 27 lignes

**Total code produit**: ~480 lignes

---

## ✨ Conclusion

### Ce qui est fait

✅ **Fondations solides (30%)**
- Architecture domaine complète
- 5 entités métier robustes
- 5 interfaces repositories
- 3 use cases critiques
- Logique métier validée
- Prêt pour les tests

### Ce qui reste

⏳ **Implémentation complète (70%)**
- 12+ use cases supplémentaires
- Infrastructure WebSocket
- 10 repositories (in-memory + MongoDB)
- Controller REST complet
- WebSocket Gateway
- Tests complets
- Features bonus

### Estimation

**Temps nécessaire pour finir**: 20-24 heures de développement

**Complexité**: HAUTE
- WebSocket bidirectionnel
- Gestion états temps réel
- Multiple entités inter-reliées
- Tests WebSocket complexes
- Notifications asynchrones

---

**Statut actuel**: Fondations excellentes posées. Le module est architecturalement complet au niveau domaine. Prêt pour l'implémentation intensive de l'infrastructure et des use cases restants.

**Recommandation**: Continuer l'implémentation par phases:
1. Use cases (messages + amitiés) → 4h
2. Repositories in-memory + tests → 3h
3. Controller REST → 2h
4. WebSocket Gateway → 3h
5. Use cases groupes → 3h
6. Repositories MongoDB → 2h
7. Tests intégration → 2h
8. Features bonus → 2h

**TOTAL estimé**: 21 heures supplémentaires
