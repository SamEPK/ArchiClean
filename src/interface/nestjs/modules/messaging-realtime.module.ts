import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagingRealtimeController } from '../controllers/messaging-realtime.controller';
import { MessagingGateway } from '../gateways/messaging.gateway';
import { 
  RepositoriesModule,
  CLIENT_REPOSITORY,
  MESSAGE_REPOSITORY,
  PRIVATE_MESSAGE_REPOSITORY,
  FRIENDSHIP_REPOSITORY,
  GROUP_REPOSITORY,
  GROUP_MEMBER_REPOSITORY,
  GROUP_MESSAGE_REPOSITORY,
  USER_REPOSITORY
} from './repositories.module';

// Use Cases - Messaging
import { SendMessage } from '../../../application/use-cases/SendMessage';
import { SendPrivateMessageUseCase } from '../../../application/use-cases/SendPrivateMessageUseCase';
import { GetConversationHistoryUseCase } from '../../../application/use-cases/GetConversationHistoryUseCase';
import { MarkMessageAsReadUseCase } from '../../../application/use-cases/MarkMessageAsReadUseCase';
import { GetUnreadMessagesCountUseCase } from '../../../application/use-cases/GetUnreadMessagesCountUseCase';

// Use Cases - Friendship
import { SendFriendRequestUseCase } from '../../../application/use-cases/SendFriendRequestUseCase';
import { AcceptFriendRequestUseCase } from '../../../application/use-cases/AcceptFriendRequestUseCase';
import { RejectFriendRequestUseCase } from '../../../application/use-cases/RejectFriendRequestUseCase';
import { GetFriendsListUseCase } from '../../../application/use-cases/GetFriendsListUseCase';
import { GetPendingRequestsUseCase } from '../../../application/use-cases/GetPendingRequestsUseCase';
import { BlockUserUseCase } from '../../../application/use-cases/BlockUserUseCase';
import { UnblockUserUseCase } from '../../../application/use-cases/UnblockUserUseCase';
import { RemoveFriendUseCase } from '../../../application/use-cases/RemoveFriendUseCase';
import { GetBlockedUsersUseCase } from '../../../application/use-cases/GetBlockedUsersUseCase';

// Use Cases - Groups
import { CreateGroupUseCase } from '../../../application/use-cases/CreateGroupUseCase';
import { SendGroupMessageUseCase } from '../../../application/use-cases/SendGroupMessageUseCase';
import { InviteToGroupUseCase } from '../../../application/use-cases/InviteToGroupUseCase';
import { JoinGroupUseCase } from '../../../application/use-cases/JoinGroupUseCase';
import { LeaveGroupUseCase } from '../../../application/use-cases/LeaveGroupUseCase';
import { GetGroupMessagesUseCase } from '../../../application/use-cases/GetGroupMessagesUseCase';
import { GetGroupMembersUseCase } from '../../../application/use-cases/GetGroupMembersUseCase';
import { PromoteMemberUseCase } from '../../../application/use-cases/PromoteMemberUseCase';
import { BanMemberUseCase } from '../../../application/use-cases/BanMemberUseCase';
import { GetPublicGroupsUseCase } from '../../../application/use-cases/GetPublicGroupsUseCase';
import { GetMyGroupsUseCase } from '../../../application/use-cases/GetMyGroupsUseCase';

console.log('[MessagingRealtimeModule] Using SINGLETON repositories from RepositoriesModule');

@Module({
  imports: [
    RepositoriesModule,
    AuthModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: '1h' as const,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MessagingRealtimeController],
  providers: [
    // Use Cases - Messaging
    {
      provide: SendMessage,
      useFactory: (messageRepository) => new SendMessage(messageRepository),
      inject: [MESSAGE_REPOSITORY],
    },
    {
      provide: SendPrivateMessageUseCase,
      useFactory: (privateMessageRepository, clientRepository) => 
        new SendPrivateMessageUseCase(privateMessageRepository, clientRepository),
      inject: [PRIVATE_MESSAGE_REPOSITORY, CLIENT_REPOSITORY],
    },
    {
      provide: GetConversationHistoryUseCase,
      useFactory: (privateMessageRepository, friendshipRepository) => 
        new GetConversationHistoryUseCase(privateMessageRepository, friendshipRepository),
      inject: [PRIVATE_MESSAGE_REPOSITORY, FRIENDSHIP_REPOSITORY],
    },
    {
      provide: MarkMessageAsReadUseCase,
      useFactory: (privateMessageRepository) => 
        new MarkMessageAsReadUseCase(privateMessageRepository),
      inject: [PRIVATE_MESSAGE_REPOSITORY],
    },
    {
      provide: GetUnreadMessagesCountUseCase,
      useFactory: (privateMessageRepository) => 
        new GetUnreadMessagesCountUseCase(privateMessageRepository),
      inject: [PRIVATE_MESSAGE_REPOSITORY],
    },
    
    // Use Cases - Friendship
    {
      provide: SendFriendRequestUseCase,
      useFactory: (friendshipRepository, userRepository) => 
        new SendFriendRequestUseCase(friendshipRepository, userRepository),
      inject: [FRIENDSHIP_REPOSITORY, USER_REPOSITORY],
    },
    {
      provide: AcceptFriendRequestUseCase,
      useFactory: (friendshipRepository) => 
        new AcceptFriendRequestUseCase(friendshipRepository),
      inject: [FRIENDSHIP_REPOSITORY],
    },
    {
      provide: RejectFriendRequestUseCase,
      useFactory: (friendshipRepository) => 
        new RejectFriendRequestUseCase(friendshipRepository),
      inject: [FRIENDSHIP_REPOSITORY],
    },
    {
      provide: GetFriendsListUseCase,
      useFactory: (friendshipRepository) => 
        new GetFriendsListUseCase(friendshipRepository),
      inject: [FRIENDSHIP_REPOSITORY],
    },
    {
      provide: GetPendingRequestsUseCase,
      useFactory: (friendshipRepository) => 
        new GetPendingRequestsUseCase(friendshipRepository),
      inject: [FRIENDSHIP_REPOSITORY],
    },
    {
      provide: BlockUserUseCase,
      useFactory: (friendshipRepository, clientRepository) => 
        new BlockUserUseCase(friendshipRepository, clientRepository),
      inject: [FRIENDSHIP_REPOSITORY, CLIENT_REPOSITORY],
    },
    {
      provide: UnblockUserUseCase,
      useFactory: (friendshipRepository) => 
        new UnblockUserUseCase(friendshipRepository),
      inject: [FRIENDSHIP_REPOSITORY],
    },
    {
      provide: RemoveFriendUseCase,
      useFactory: (friendshipRepository) => 
        new RemoveFriendUseCase(friendshipRepository),
      inject: [FRIENDSHIP_REPOSITORY],
    },
    {
      provide: GetBlockedUsersUseCase,
      useFactory: (friendshipRepository, userRepository) => 
        new GetBlockedUsersUseCase(friendshipRepository, userRepository),
      inject: [FRIENDSHIP_REPOSITORY, USER_REPOSITORY],
    },

    // Use Cases - Groups
    {
      provide: CreateGroupUseCase,
      useFactory: (groupRepository, groupMemberRepository) => 
        new CreateGroupUseCase(groupRepository, groupMemberRepository),
      inject: [GROUP_REPOSITORY, GROUP_MEMBER_REPOSITORY],
    },
    {
      provide: SendGroupMessageUseCase,
      useFactory: (groupMessageRepository, groupMemberRepository) => 
        new SendGroupMessageUseCase(groupMessageRepository, groupMemberRepository),
      inject: [GROUP_MESSAGE_REPOSITORY, GROUP_MEMBER_REPOSITORY],
    },
    {
      provide: InviteToGroupUseCase,
      useFactory: (groupRepository, groupMemberRepository) => 
        new InviteToGroupUseCase(groupRepository, groupMemberRepository),
      inject: [GROUP_REPOSITORY, GROUP_MEMBER_REPOSITORY],
    },
    {
      provide: JoinGroupUseCase,
      useFactory: (groupRepository, groupMemberRepository) => 
        new JoinGroupUseCase(groupRepository, groupMemberRepository),
      inject: [GROUP_REPOSITORY, GROUP_MEMBER_REPOSITORY],
    },
    {
      provide: LeaveGroupUseCase,
      useFactory: (groupMemberRepository) => 
        new LeaveGroupUseCase(groupMemberRepository),
      inject: [GROUP_MEMBER_REPOSITORY],
    },
    {
      provide: GetGroupMessagesUseCase,
      useFactory: (groupMessageRepository, groupMemberRepository) => 
        new GetGroupMessagesUseCase(groupMessageRepository, groupMemberRepository),
      inject: [GROUP_MESSAGE_REPOSITORY, GROUP_MEMBER_REPOSITORY],
    },
    {
      provide: GetGroupMembersUseCase,
      useFactory: (groupMemberRepository, groupRepository) => 
        new GetGroupMembersUseCase(groupMemberRepository, groupRepository),
      inject: [GROUP_MEMBER_REPOSITORY, GROUP_REPOSITORY],
    },
    {
      provide: PromoteMemberUseCase,
      useFactory: (groupMemberRepository) => 
        new PromoteMemberUseCase(groupMemberRepository),
      inject: [GROUP_MEMBER_REPOSITORY],
    },
    {
      provide: BanMemberUseCase,
      useFactory: (groupMemberRepository) => 
        new BanMemberUseCase(groupMemberRepository),
      inject: [GROUP_MEMBER_REPOSITORY],
    },
    {
      provide: GetPublicGroupsUseCase,
      useFactory: (groupRepository, groupMemberRepository, clientRepository) => 
        new GetPublicGroupsUseCase(groupRepository, groupMemberRepository, clientRepository),
      inject: [GROUP_REPOSITORY, GROUP_MEMBER_REPOSITORY, CLIENT_REPOSITORY],
    },
    {
      provide: GetMyGroupsUseCase,
      useFactory: (groupMemberRepository, groupRepository) => 
        new GetMyGroupsUseCase(groupMemberRepository, groupRepository),
      inject: [GROUP_MEMBER_REPOSITORY, GROUP_REPOSITORY],
    },

    // WebSocket Gateway
    MessagingGateway,
  ],
})
export class MessagingRealtimeModule {}
