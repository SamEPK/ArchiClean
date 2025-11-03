import { Module } from '@nestjs/common';
import { MessagingRealtimeController } from '../controllers/messaging-realtime.controller';
import { MessagingGateway } from '../gateways/messaging.gateway';

// Use Cases
import { SendPrivateMessageUseCase } from '@application/use-cases/SendPrivateMessageUseCase';
import { GetConversationHistoryUseCase } from '@application/use-cases/GetConversationHistoryUseCase';
import { SendFriendRequestUseCase } from '@application/use-cases/SendFriendRequestUseCase';
import { AcceptFriendRequestUseCase } from '@application/use-cases/AcceptFriendRequestUseCase';
import { RejectFriendRequestUseCase } from '@application/use-cases/RejectFriendRequestUseCase';
import { GetFriendsListUseCase } from '@application/use-cases/GetFriendsListUseCase';
import { CreateGroupUseCase } from '@application/use-cases/CreateGroupUseCase';
import { SendGroupMessageUseCase } from '@application/use-cases/SendGroupMessageUseCase';

// Repositories
import { InMemoryPrivateMessageRepository } from '@infrastructure/repositories/in-memory/InMemoryPrivateMessageRepository';
import { InMemoryFriendshipRepository } from '@infrastructure/repositories/in-memory/InMemoryFriendshipRepository';
import { InMemoryGroupRepository } from '@infrastructure/repositories/in-memory/InMemoryGroupRepository';
import { InMemoryGroupMemberRepository } from '@infrastructure/repositories/in-memory/InMemoryGroupMemberRepository';
import { InMemoryGroupMessageRepository } from '@infrastructure/repositories/in-memory/InMemoryGroupMessageRepository';
import { InMemoryClientRepository } from '@infrastructure/repositories/in-memory/InMemoryClientRepository';

// Create repository instances
const privateMessageRepository = new InMemoryPrivateMessageRepository();
const friendshipRepository = new InMemoryFriendshipRepository();
const groupRepository = new InMemoryGroupRepository();
const groupMemberRepository = new InMemoryGroupMemberRepository();
const groupMessageRepository = new InMemoryGroupMessageRepository();
const clientRepository = new InMemoryClientRepository();

// Create use case instances
const sendPrivateMessageUseCase = new SendPrivateMessageUseCase(
  privateMessageRepository,
  friendshipRepository,
  null as any // WebSocket notifier will be injected
);

const getConversationHistoryUseCase = new GetConversationHistoryUseCase(
  privateMessageRepository,
  friendshipRepository
);

const sendFriendRequestUseCase = new SendFriendRequestUseCase(friendshipRepository, clientRepository);

const acceptFriendRequestUseCase = new AcceptFriendRequestUseCase(friendshipRepository);

const rejectFriendRequestUseCase = new RejectFriendRequestUseCase(friendshipRepository);

const getFriendsListUseCase = new GetFriendsListUseCase(friendshipRepository);

const createGroupUseCase = new CreateGroupUseCase(groupRepository, groupMemberRepository);

const sendGroupMessageUseCase = new SendGroupMessageUseCase(groupMessageRepository, groupMemberRepository);

@Module({
  controllers: [MessagingRealtimeController],
  providers: [
    MessagingGateway,
    {
      provide: SendPrivateMessageUseCase,
      useValue: sendPrivateMessageUseCase,
    },
    {
      provide: GetConversationHistoryUseCase,
      useValue: getConversationHistoryUseCase,
    },
    {
      provide: SendFriendRequestUseCase,
      useValue: sendFriendRequestUseCase,
    },
    {
      provide: AcceptFriendRequestUseCase,
      useValue: acceptFriendRequestUseCase,
    },
    {
      provide: RejectFriendRequestUseCase,
      useValue: rejectFriendRequestUseCase,
    },
    {
      provide: GetFriendsListUseCase,
      useValue: getFriendsListUseCase,
    },
    {
      provide: CreateGroupUseCase,
      useValue: createGroupUseCase,
    },
    {
      provide: SendGroupMessageUseCase,
      useValue: sendGroupMessageUseCase,
    },
  ],
})
export class MessagingRealtimeModule {}
