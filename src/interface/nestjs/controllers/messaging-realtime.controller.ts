import { Controller, Post, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SendPrivateMessageUseCase } from '@application/use-cases/SendPrivateMessageUseCase';
import { GetConversationHistoryUseCase } from '@application/use-cases/GetConversationHistoryUseCase';
import { MarkMessageAsReadUseCase } from '@application/use-cases/MarkMessageAsReadUseCase';
import { GetUnreadMessagesCountUseCase } from '@application/use-cases/GetUnreadMessagesCountUseCase';
import { SendFriendRequestUseCase } from '@application/use-cases/SendFriendRequestUseCase';
import { AcceptFriendRequestUseCase } from '@application/use-cases/AcceptFriendRequestUseCase';
import { RejectFriendRequestUseCase } from '@application/use-cases/RejectFriendRequestUseCase';
import { GetFriendsListUseCase } from '@application/use-cases/GetFriendsListUseCase';
import { GetPendingRequestsUseCase } from '@application/use-cases/GetPendingRequestsUseCase';
import { BlockUserUseCase } from '@application/use-cases/BlockUserUseCase';
import { UnblockUserUseCase } from '@application/use-cases/UnblockUserUseCase';
import { RemoveFriendUseCase } from '@application/use-cases/RemoveFriendUseCase';
import { CreateGroupUseCase } from '@application/use-cases/CreateGroupUseCase';
import { SendGroupMessageUseCase } from '@application/use-cases/SendGroupMessageUseCase';
import { InviteToGroupUseCase } from '@application/use-cases/InviteToGroupUseCase';
import { JoinGroupUseCase } from '@application/use-cases/JoinGroupUseCase';
import { LeaveGroupUseCase } from '@application/use-cases/LeaveGroupUseCase';
import { GetGroupMessagesUseCase } from '@application/use-cases/GetGroupMessagesUseCase';
import { GetGroupMembersUseCase } from '@application/use-cases/GetGroupMembersUseCase';
import { PromoteMemberUseCase } from '@application/use-cases/PromoteMemberUseCase';
import { BanMemberUseCase } from '@application/use-cases/BanMemberUseCase';
import { GetBlockedUsersUseCase } from '@application/use-cases/GetBlockedUsersUseCase';
import { GetPublicGroupsUseCase } from '@application/use-cases/GetPublicGroupsUseCase';
import { GetMyGroupsUseCase } from '@application/use-cases/GetMyGroupsUseCase';
import { GroupVisibility } from '@domain/entities/Group';

@ApiTags('Messaging')
@UseGuards(JwtAuthGuard)
@Controller('realtime')
export class MessagingRealtimeController {
  constructor(
    private sendPrivateMessageUseCase: SendPrivateMessageUseCase,
    private getConversationHistoryUseCase: GetConversationHistoryUseCase,
    private markMessageAsReadUseCase: MarkMessageAsReadUseCase,
    private getUnreadMessagesCountUseCase: GetUnreadMessagesCountUseCase,
    private sendFriendRequestUseCase: SendFriendRequestUseCase,
    private acceptFriendRequestUseCase: AcceptFriendRequestUseCase,
    private rejectFriendRequestUseCase: RejectFriendRequestUseCase,
    private getFriendsListUseCase: GetFriendsListUseCase,
    private getPendingRequestsUseCase: GetPendingRequestsUseCase,
    private blockUserUseCase: BlockUserUseCase,
    private unblockUserUseCase: UnblockUserUseCase,
    private removeFriendUseCase: RemoveFriendUseCase,
    private createGroupUseCase: CreateGroupUseCase,
    private sendGroupMessageUseCase: SendGroupMessageUseCase,
    private inviteToGroupUseCase: InviteToGroupUseCase,
    private joinGroupUseCase: JoinGroupUseCase,
    private leaveGroupUseCase: LeaveGroupUseCase,
    private getGroupMessagesUseCase: GetGroupMessagesUseCase,
    private getGroupMembersUseCase: GetGroupMembersUseCase,
    private promoteMemberUseCase: PromoteMemberUseCase,
    private banMemberUseCase: BanMemberUseCase,
    private getBlockedUsersUseCase: GetBlockedUsersUseCase,
    private getPublicGroupsUseCase: GetPublicGroupsUseCase,
    private getMyGroupsUseCase: GetMyGroupsUseCase
  ) {}

  @Post('messages/send')
  @ApiOperation({ summary: 'Envoyer un message privé', description: 'Envoyer un message privé à un ami (nécessite une relation d\'amitié acceptée)' })
  @ApiResponse({ status: 201, description: 'Message envoyé avec succès' })
  @ApiResponse({ status: 403, description: 'Vous devez être ami avec le destinataire pour lui envoyer un message' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['senderId', 'receiverId', 'content'],
      properties: {
        senderId: { type: 'string', example: 'client123' },
        receiverId: { type: 'string', example: 'client456' },
        content: { type: 'string', example: 'Bonjour, comment vas-tu ?' },
      },
    },
  })
  async sendPrivateMessage(@Body() body: { senderId: string; receiverId: string; content: string }) {
    try {
      const message = await this.sendPrivateMessageUseCase.execute(body.senderId, body.receiverId, body.content);
      return { success: true, message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('messages/conversation/:userId/:otherUserId')
  @ApiOperation({ summary: 'Récupérer l\'historique de conversation', description: 'Obtenir les messages échangés entre deux utilisateurs' })
  @ApiResponse({ status: 200, description: 'Historique de conversation récupéré' })
  @ApiResponse({ status: 403, description: 'Vous devez être ami pour voir l\'historique' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  @ApiParam({ name: 'otherUserId', description: 'ID de l\'autre utilisateur' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre maximum de messages (par défaut: 50)' })
  async getConversation(
    @Param('userId') userId: string,
    @Param('otherUserId') otherUserId: string,
    @Query('limit') limit?: string
  ) {
    try {
      const messages = await this.getConversationHistoryUseCase.execute(
        userId,
        otherUserId,
        limit ? parseInt(limit) : 50
      );
      return { success: true, messages };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Put('messages/:messageId/read')
  @ApiOperation({ summary: 'Marquer un message comme lu' })
  async markMessageAsRead(@Param('messageId') messageId: string, @Body() body: { userId: string }) {
    try {
      await this.markMessageAsReadUseCase.execute(messageId, body.userId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('messages/unread/:userId')
  @ApiOperation({ summary: 'Compter les messages non lus' })
  async getUnreadMessages(@Param('userId') userId: string) {
    try {
      const count = await this.getUnreadMessagesCountUseCase.execute(userId);
      return { success: true, count };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('messages/conversations/:userId')
  @ApiOperation({ summary: 'Liste des conversations' })
  @ApiResponse({ status: 200, description: 'Liste des conversations récupérée' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  async getConversationsList(@Param('userId') userId: string) {
    try {
      // This is a simple implementation - in production, you'd want a dedicated use case
      // For now, return empty array as this functionality requires more backend work
      return [];
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post('friendships/request')
  @ApiOperation({ summary: 'Envoyer une demande d\'ami', description: 'Envoyer une demande d\'amitié à un autre utilisateur' })
  @ApiResponse({ status: 201, description: 'Demande d\'ami envoyée' })
  @ApiResponse({ status: 400, description: 'Demande déjà existante ou auto-demande' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['requesterId', 'addresseeId'],
      properties: {
        requesterId: { type: 'string', example: 'client123', description: 'ID de l\'émetteur' },
        addresseeId: { type: 'string', example: 'client456', description: 'ID du destinataire' },
      },
    },
  })
  async sendFriendRequest(@Body() body: { requesterId: string; addresseeId: string }) {
    try {
      const friendship = await this.sendFriendRequestUseCase.execute(body.requesterId, body.addresseeId);
      return { success: true, friendship };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Put('friendships/:friendshipId/accept')
  @ApiOperation({ summary: 'Accepter une demande d\'ami', description: 'Accepter une demande d\'amitié reçue' })
  @ApiResponse({ status: 200, description: 'Demande d\'ami acceptée' })
  @ApiResponse({ status: 403, description: 'Vous n\'êtes pas autorisé à accepter cette demande' })
  @ApiParam({ name: 'friendshipId', description: 'ID de la demande d\'amitié' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string', example: 'client456', description: 'ID de l\'utilisateur qui accepte' },
      },
    },
  })
  async acceptFriendRequest(@Param('friendshipId') friendshipId: string, @Body() body: { userId: string }) {
    try {
      const friendship = await this.acceptFriendRequestUseCase.execute(friendshipId, body.userId);
      return { success: true, friendship };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Put('friendships/:friendshipId/reject')
  @ApiOperation({ summary: 'Rejeter une demande d\'ami', description: 'Refuser une demande d\'amitié reçue' })
  @ApiResponse({ status: 200, description: 'Demande d\'ami rejetée' })
  @ApiResponse({ status: 403, description: 'Vous n\'êtes pas autorisé à rejeter cette demande' })
  @ApiParam({ name: 'friendshipId', description: 'ID de la demande d\'amitié' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string', example: 'client456', description: 'ID de l\'utilisateur qui rejette' },
      },
    },
  })
  async rejectFriendRequest(@Param('friendshipId') friendshipId: string, @Body() body: { userId: string }) {
    try {
      const friendship = await this.rejectFriendRequestUseCase.execute(friendshipId, body.userId);
      return { success: true, friendship };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('friendships/friends/:userId')
  @ApiOperation({ summary: 'Liste des amis', description: 'Récupérer la liste de tous les amis d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des amis récupérée' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  async getFriendsList(@Param('userId') userId: string) {
    try {
      const friends = await this.getFriendsListUseCase.execute(userId);
      return { success: true, friends };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('friendships/pending/:userId')
  @ApiOperation({ summary: 'Demandes d\'ami en attente' })
  async getPendingRequests(@Param('userId') userId: string) {
    try {
      const requests = await this.getPendingRequestsUseCase.execute(userId);
      return { success: true, requests };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('friendships/blocked/:userId')
  @ApiOperation({ summary: 'Liste des utilisateurs bloqués' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs bloqués récupérée' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  async getBlockedUsers(@Param('userId') userId: string) {
    try {
      const result = await this.getBlockedUsersUseCase.execute({ userId });
      return result.blockedUsers;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post('friendships/block')
  @ApiOperation({ summary: 'Bloquer un utilisateur' })
  async blockUser(@Body() body: { blockerId: string; targetId: string }) {
    try {
      const friendship = await this.blockUserUseCase.execute(body.blockerId, body.targetId);
      return { success: true, friendship };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post('friendships/unblock')
  @ApiOperation({ summary: 'Débloquer un utilisateur' })
  async unblockUser(@Body() body: { requesterId: string; targetId: string }) {
    try {
      await this.unblockUserUseCase.execute(body.requesterId, body.targetId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post('friendships/remove')
  @ApiOperation({ summary: 'Supprimer un ami' })
  async removeFriend(@Body() body: { userId: string; friendId: string }) {
    try {
      await this.removeFriendUseCase.execute(body.userId, body.friendId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post('groups')
  @ApiOperation({ summary: 'Créer un groupe', description: 'Créer un nouveau groupe de discussion (public ou privé)' })
  @ApiResponse({ status: 201, description: 'Groupe créé avec succès' })
  @ApiResponse({ status: 400, description: 'Nom du groupe requis' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['creatorId', 'name', 'description', 'visibility'],
      properties: {
        creatorId: { type: 'string', example: 'client123' },
        name: { type: 'string', example: 'Groupe Investisseurs' },
        description: { type: 'string', example: 'Groupe pour discuter des stratégies d\'investissement' },
        visibility: { type: 'string', enum: ['public', 'private'], example: 'public' },
      },
    },
  })
  async createGroup(
    @Body()
    body: {
      creatorId: string;
      name: string;
      description: string;
      visibility: GroupVisibility;
    }
  ) {
    try {
      const group = await this.createGroupUseCase.execute(body.creatorId, body.name, body.description, body.visibility);
      return { success: true, group };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('groups/public')
  @ApiOperation({ summary: 'Groupes publics', description: 'Récupérer la liste de tous les groupes publics' })
  @ApiResponse({ status: 200, description: 'Liste des groupes publics récupérée' })
  async getPublicGroups() {
    try {
      const result = await this.getPublicGroupsUseCase.execute();
      return result.groups;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('groups/my/:userId')
  @ApiOperation({ summary: 'Mes groupes', description: 'Récupérer la liste des groupes dont l\'utilisateur est membre' })
  @ApiResponse({ status: 200, description: 'Liste des groupes récupérée' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  async getMyGroups(@Param('userId') userId: string) {
    try {
      const result = await this.getMyGroupsUseCase.execute({ userId });
      return result.groups;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post('groups/:groupId/messages')
  @ApiOperation({ summary: 'Envoyer un message dans un groupe', description: 'Poster un message dans un groupe (nécessite d\'être membre)' })
  @ApiResponse({ status: 201, description: 'Message de groupe envoyé' })
  @ApiResponse({ status: 403, description: 'Vous devez être membre du groupe' })
  @ApiParam({ name: 'groupId', description: 'ID du groupe' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['senderId', 'content'],
      properties: {
        senderId: { type: 'string', example: 'client123' },
        content: { type: 'string', example: 'Que pensez-vous de l\'action AAPL ?' },
      },
    },
  })
  async sendGroupMessage(@Param('groupId') groupId: string, @Body() body: { senderId: string; content: string }) {
    try {
      const message = await this.sendGroupMessageUseCase.execute(groupId, body.senderId, body.content);
      return { success: true, message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post('groups/:groupId/invite')
  @ApiOperation({ summary: 'Inviter un membre dans un groupe privé' })
  async inviteToGroup(
    @Param('groupId') groupId: string,
    @Body() body: { inviterId: string; inviteeId: string }
  ) {
    try {
      const invite = await this.inviteToGroupUseCase.execute(groupId, body.inviterId, body.inviteeId);
      return { success: true, invite };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post('groups/:groupId/join')
  @ApiOperation({ summary: 'Rejoindre un groupe' })
  async joinGroup(@Param('groupId') groupId: string, @Body() body: { userId: string }) {
    try {
      const membership = await this.joinGroupUseCase.execute(groupId, body.userId);
      return { success: true, membership };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post('groups/:groupId/leave')
  @ApiOperation({ summary: 'Quitter un groupe' })
  async leaveGroup(@Param('groupId') groupId: string, @Body() body: { userId: string }) {
    try {
      await this.leaveGroupUseCase.execute(groupId, body.userId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('groups/:groupId/messages')
  @ApiOperation({ summary: 'Historique des messages de groupe' })
  async getGroupMessages(
    @Param('groupId') groupId: string,
    @Query('userId') userId: string,
    @Query('limit') limit?: string
  ) {
    try {
      const messages = await this.getGroupMessagesUseCase.execute(
        groupId,
        userId,
        limit ? parseInt(limit, 10) : 100
      );
      return { success: true, messages };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('groups/:groupId/members')
  @ApiOperation({ summary: 'Liste des membres du groupe' })
  async getGroupMembers(
    @Param('groupId') groupId: string,
    @Query('requesterId') requesterId: string
  ) {
    try {
      const members = await this.getGroupMembersUseCase.execute(groupId, requesterId);
      return { success: true, members };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post('groups/:groupId/promote')
  @ApiOperation({ summary: 'Promouvoir un membre en administrateur' })
  async promoteMember(
    @Param('groupId') groupId: string,
    @Body() body: { requesterId: string; memberId: string }
  ) {
    try {
      const member = await this.promoteMemberUseCase.execute(groupId, body.requesterId, body.memberId);
      return { success: true, member };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post('groups/:groupId/ban')
  @ApiOperation({ summary: 'Bannir un membre du groupe' })
  async banMember(
    @Param('groupId') groupId: string,
    @Body() body: { requesterId: string; memberId: string }
  ) {
    try {
      const member = await this.banMemberUseCase.execute(groupId, body.requesterId, body.memberId);
      return { success: true, member };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
