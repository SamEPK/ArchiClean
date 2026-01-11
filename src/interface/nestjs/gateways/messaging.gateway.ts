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
import { SendMessage } from '@application/use-cases/SendMessage';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private typingUsers: Map<string, Set<string>> = new Map(); // receiverId -> Set<senderIds>

  constructor(
    private sendPrivateMessageUseCase: SendPrivateMessageUseCase,
    private sendGroupMessageUseCase: SendGroupMessageUseCase,
    private sendMessageUseCase: SendMessage,
    private jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    const token = (client.handshake.auth as any)?.token || (client.handshake.query?.token as string);
    console.log('🔗 Socket connection attempt with token:', token ? 'present' : 'missing');
    
    try {
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub as string;
      const userRole = payload.role as string;
      
      if (!userId) throw new UnauthorizedException('Invalid token payload');

      this.connectedUsers.set(userId, client.id);
      client.join(`user_${userId}`);

      // Notify others that user is online
      this.server.emit('user:status', { userId, status: 'online' });
      client.data.userId = userId;
      client.data.userRole = userRole;
      
      console.log(`✅ User ${userId} (${userRole}) connected (${client.id})`);
    } catch (err) {
      console.error('❌ Socket auth error:', err);
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect(true);
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
      const senderId = client.data.userId as string;
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
      const senderId = client.data.userId as string;
      const senderRole = client.data.userRole as string;
      const message = await this.sendGroupMessageUseCase.execute(data.groupId, senderId, data.content);

      // Enrichir le message avec les infos du rôle pour distinction visuelle
      const enrichedMessage = {
        ...message,
        senderRole,
        isDirector: senderRole === 'director',
        isAdvisor: senderRole === 'advisor',
        roleLabel: this.getRoleLabel(senderRole),
        roleBadgeColor: this.getRoleBadgeColor(senderRole),
      };

      // Broadcast to all group members
      this.server.to(`group_${data.groupId}`).emit('receive:group-message', { message: enrichedMessage });

      return { success: true, messageId: message.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      client.emit('error', { message });
      return { success: false, error: message };
    }
  }

  // ===== HELPER METHODS FOR ROLE DISPLAY =====
  private getRoleLabel(role: string): string {
    switch (role) {
      case 'director': return '👑 Directeur';
      case 'advisor': return '💼 Conseiller';
      case 'client': return '👤 Client';
      default: return role;
    }
  }

  private getRoleBadgeColor(role: string): string {
    switch (role) {
      case 'director': return '#FFD700'; // Gold
      case 'advisor': return '#4CAF50'; // Green
      case 'client': return '#2196F3'; // Blue
      default: return '#9E9E9E'; // Gray
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string }
  ) {
    const senderId = client.data.userId as string;

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
    const senderId = client.data.userId as string;

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
    const userId = client.data.userId as string;

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
    const userId = client.data.userId as string;

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

  // ===== CLIENT-ADVISOR CHAT =====
  @SubscribeMessage('client:message')
  async handleClientMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string }
  ) {
    try {
      const clientId = client.data.userId as string;

      // Save message to conversation
      await this.sendMessageUseCase.execute({
        conversationId: data.conversationId,
        senderId: clientId,
        content: data.content,
        senderRole: 'client',
      });

      // Join conversation room for real-time updates
      client.join(`conversation_${data.conversationId}`);

      // Broadcast to all advisors (they will see it in their open conversations list)
      this.server.emit('new:client-message', {
        conversationId: data.conversationId,
        clientId,
        content: data.content,
        createdAt: new Date().toISOString(),
      });

      console.log(`💬 Client ${clientId} sent message to conversation ${data.conversationId}`);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Client message error:', message);
      client.emit('error', { message });
      return { success: false, error: message };
    }
  }

  @SubscribeMessage('advisor:message')
  async handleAdvisorMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string }
  ) {
    try {
      const advisorId = client.data.userId as string;

      // Save message to conversation
      await this.sendMessageUseCase.execute({
        conversationId: data.conversationId,
        senderId: advisorId,
        content: data.content,
        senderRole: 'advisor',
      });

      // Join conversation room
      client.join(`conversation_${data.conversationId}`);

      // Send to client (conversation ID is the client ID)
      this.server.to(`user_${data.conversationId}`).emit('advisor:message', {
        senderId: advisorId,
        content: data.content,
        createdAt: new Date().toISOString(),
      });

      console.log(`💬 Advisor ${advisorId} sent message to conversation ${data.conversationId}`);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Advisor message error:', message);
      client.emit('error', { message });
      return { success: false, error: message };
    }
  }

  @SubscribeMessage('advisor:typing')
  handleAdvisorTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean }
  ) {
    // Notify client (conversation ID is the client ID)
    this.server.to(`user_${data.conversationId}`).emit('advisor:typing', {
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('join:conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    client.join(`conversation_${data.conversationId}`);
    console.log(`👤 User ${client.data.userId} joined conversation ${data.conversationId}`);
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
