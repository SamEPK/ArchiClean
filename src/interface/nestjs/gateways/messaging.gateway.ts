import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SendPrivateMessageUseCase } from '@application/use-cases/SendPrivateMessageUseCase';
import { SendGroupMessageUseCase } from '@application/use-cases/SendGroupMessageUseCase';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private typingUsers: Map<string, Set<string>> = new Map(); // receiverId -> Set<senderIds>

  constructor(
    private sendPrivateMessageUseCase: SendPrivateMessageUseCase,
    private sendGroupMessageUseCase: SendGroupMessageUseCase
  ) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      client.join(`user_${userId}`);

      // Notify others that user is online
      this.server.emit('user:status', { userId, status: 'online' });
      console.log(`User ${userId} connected (${client.id})`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserIdBySocketId(client.id);
    if (userId) {
      this.connectedUsers.delete(userId);
      this.server.emit('user:status', { userId, status: 'offline' });
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('send:private-message')
  async handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string }
  ) {
    try {
      const senderId = client.handshake.query.userId as string;
      const message = await this.sendPrivateMessageUseCase.execute(senderId, data.receiverId, data.content);

      // Send to receiver
      this.server.to(`user_${data.receiverId}`).emit('receive:private-message', { message });

      // Confirm to sender
      client.emit('message:sent', { messageId: message.id });

      return { success: true, messageId: message.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      client.emit('error', { message });
      return { success: false, error: message };
    }
  }

  @SubscribeMessage('send:group-message')
  async handleGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; content: string }
  ) {
    try {
      const senderId = client.handshake.query.userId as string;
      const message = await this.sendGroupMessageUseCase.execute(data.groupId, senderId, data.content);

      // Broadcast to all group members
      this.server.to(`group_${data.groupId}`).emit('receive:group-message', { message });

      return { success: true, messageId: message.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      client.emit('error', { message });
      return { success: false, error: message };
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string }
  ) {
    const senderId = client.handshake.query.userId as string;

    if (!this.typingUsers.has(data.receiverId)) {
      this.typingUsers.set(data.receiverId, new Set());
    }
    this.typingUsers.get(data.receiverId)!.add(senderId);

    // Notify receiver
    this.server.to(`user_${data.receiverId}`).emit('user:typing', {
      userId: senderId,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string }
  ) {
    const senderId = client.handshake.query.userId as string;

    if (this.typingUsers.has(data.receiverId)) {
      this.typingUsers.get(data.receiverId)!.delete(senderId);
    }

    // Notify receiver
    this.server.to(`user_${data.receiverId}`).emit('user:typing', {
      userId: senderId,
      isTyping: false,
    });
  }

  @SubscribeMessage('group:typing:start')
  handleGroupTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string }
  ) {
    const userId = client.handshake.query.userId as string;

    // Broadcast to group
    this.server.to(`group_${data.groupId}`).emit('group:typing', {
      groupId: data.groupId,
      userId,
      isTyping: true,
    });
  }

  @SubscribeMessage('group:typing:stop')
  handleGroupTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string }
  ) {
    const userId = client.handshake.query.userId as string;

    // Broadcast to group
    this.server.to(`group_${data.groupId}`).emit('group:typing', {
      groupId: data.groupId,
      userId,
      isTyping: false,
    });
  }

  @SubscribeMessage('join:group')
  handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string }
  ) {
    client.join(`group_${data.groupId}`);
    return { success: true };
  }

  @SubscribeMessage('leave:group')
  handleLeaveGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string }
  ) {
    client.leave(`group_${data.groupId}`);
    return { success: true };
  }

  private getUserIdBySocketId(socketId: string): string | null {
    for (const [userId, sid] of this.connectedUsers.entries()) {
      if (sid === socketId) {
        return userId;
      }
    }
    return null;
  }

  // Method to notify from use cases
  async notifyNewMessage(receiverId: string, message: any): Promise<void> {
    this.server.to(`user_${receiverId}`).emit('receive:private-message', { message });
  }
}
