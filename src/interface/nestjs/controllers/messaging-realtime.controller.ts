import { Controller, Post, Get, Put, Body, Param, Query } from '@nestjs/common';
import { SendPrivateMessageUseCase } from '@application/use-cases/SendPrivateMessageUseCase';
import { GetConversationHistoryUseCase } from '@application/use-cases/GetConversationHistoryUseCase';
import { SendFriendRequestUseCase } from '@application/use-cases/SendFriendRequestUseCase';
import { AcceptFriendRequestUseCase } from '@application/use-cases/AcceptFriendRequestUseCase';
import { RejectFriendRequestUseCase } from '@application/use-cases/RejectFriendRequestUseCase';
import { GetFriendsListUseCase } from '@application/use-cases/GetFriendsListUseCase';
import { CreateGroupUseCase } from '@application/use-cases/CreateGroupUseCase';
import { SendGroupMessageUseCase } from '@application/use-cases/SendGroupMessageUseCase';
import { GroupVisibility } from '@domain/entities/Group';

@Controller('realtime')
export class MessagingRealtimeController {
  constructor(
    private sendPrivateMessageUseCase: SendPrivateMessageUseCase,
    private getConversationHistoryUseCase: GetConversationHistoryUseCase,
    private sendFriendRequestUseCase: SendFriendRequestUseCase,
    private acceptFriendRequestUseCase: AcceptFriendRequestUseCase,
    private rejectFriendRequestUseCase: RejectFriendRequestUseCase,
    private getFriendsListUseCase: GetFriendsListUseCase,
    private createGroupUseCase: CreateGroupUseCase,
    private sendGroupMessageUseCase: SendGroupMessageUseCase
  ) {}

  @Post('messages/send')
  async sendPrivateMessage(@Body() body: { senderId: string; receiverId: string; content: string }) {
    try {
      const message = await this.sendPrivateMessageUseCase.execute(body.senderId, body.receiverId, body.content);
      return { success: true, message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('messages/conversation/:userId/:otherUserId')
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

  @Post('friendships/request')
  async sendFriendRequest(@Body() body: { requesterId: string; addresseeId: string }) {
    try {
      const friendship = await this.sendFriendRequestUseCase.execute(body.requesterId, body.addresseeId);
      return { success: true, friendship };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Put('friendships/:friendshipId/accept')
  async acceptFriendRequest(@Param('friendshipId') friendshipId: string, @Body() body: { userId: string }) {
    try {
      const friendship = await this.acceptFriendRequestUseCase.execute(friendshipId, body.userId);
      return { success: true, friendship };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Put('friendships/:friendshipId/reject')
  async rejectFriendRequest(@Param('friendshipId') friendshipId: string, @Body() body: { userId: string }) {
    try {
      const friendship = await this.rejectFriendRequestUseCase.execute(friendshipId, body.userId);
      return { success: true, friendship };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get('friendships/friends/:userId')
  async getFriendsList(@Param('userId') userId: string) {
    try {
      const friends = await this.getFriendsListUseCase.execute(userId);
      return { success: true, friends };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post('groups')
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

  @Post('groups/:groupId/messages')
  async sendGroupMessage(@Param('groupId') groupId: string, @Body() body: { senderId: string; content: string }) {
    try {
      const message = await this.sendGroupMessageUseCase.execute(groupId, body.senderId, body.content);
      return { success: true, message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
