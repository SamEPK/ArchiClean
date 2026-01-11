import { Controller, Get, Post, Put, Body, Param, Sse, Inject, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable, interval, map, merge } from 'rxjs';
import { Notification, NotificationType } from '@domain/entities/Notification';
import { INotificationRepository } from '@domain/repositories/INotificationRepository';
import { SSEService } from '@infrastructure/services/SSEService';
import { uuidv4 } from '@infrastructure/utils/uuid-helper';

// DTOs
class SendNotificationDto {
  recipientId!: string;
  title!: string;
  message!: string;
  type?: NotificationType;
  senderId?: string;
  senderName?: string;
  metadata?: Record<string, any>;
}

class BroadcastNotificationDto {
  title!: string;
  message!: string;
  type?: NotificationType;
  senderId?: string;
  senderName?: string;
  recipientIds!: string[];
}

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject('NotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    private readonly sseService: SSEService,
  ) {}

  // ==================== SSE ENDPOINT ====================

  @Get('stream/:userId')
  @Sse()
  @ApiOperation({ 
    summary: 'Flux SSE des notifications', 
    description: 'Server-Sent Events pour recevoir les notifications en temps réel' 
  })
  streamNotifications(@Param('userId') userId: string): Observable<MessageEvent> {
    console.log('[Notifications SSE] New client connected:', userId);
    
    // Heartbeat toutes les 30 secondes
    const heartbeat = interval(30000).pipe(
      map(() => ({ data: JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() }) } as MessageEvent))
    );
    
    return merge(this.sseService.getNotificationStream(userId), heartbeat);
  }

  // ==================== REST ENDPOINTS ====================

  @Post()
  @ApiOperation({ summary: 'Envoyer une notification', description: 'Envoie une notification à un utilisateur spécifique' })
  @ApiResponse({ status: 201, description: 'Notification envoyée' })
  async sendNotification(@Body() dto: SendNotificationDto) {
    const notification = new Notification(
      uuidv4(),
      dto.recipientId,
      dto.title,
      dto.message,
      dto.type || 'info',
      dto.senderId,
      dto.senderName,
      new Date(),
      false,
      dto.metadata,
    );

    await this.notificationRepository.save(notification);
    
    // Envoyer via SSE
    this.sseService.emitNotification(notification.toJSON(), dto.recipientId);

    console.log('[Notifications] Notification sent to:', dto.recipientId);

    return {
      success: true,
      message: 'Notification envoyée',
      notification: notification.toJSON(),
    };
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Diffuser une notification', description: 'Envoie une notification à plusieurs utilisateurs' })
  async broadcastNotification(@Body() dto: BroadcastNotificationDto) {
    const notifications: Notification[] = [];

    for (const recipientId of dto.recipientIds) {
      const notification = new Notification(
        uuidv4(),
        recipientId,
        dto.title,
        dto.message,
        dto.type || 'info',
        dto.senderId,
        dto.senderName,
        new Date(),
        false,
      );

      await this.notificationRepository.save(notification);
      this.sseService.emitNotification(notification.toJSON(), recipientId);
      notifications.push(notification);
    }

    console.log('[Notifications] Broadcast sent to', dto.recipientIds.length, 'users');

    return {
      success: true,
      message: `Notification diffusée à ${dto.recipientIds.length} utilisateurs`,
      count: notifications.length,
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Notifications d\'un utilisateur' })
  async getUserNotifications(@Param('userId') userId: string) {
    const notifications = await this.notificationRepository.findByRecipientId(userId);
    return {
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.isRead).length,
      notifications: notifications.map(n => n.toJSON()),
    };
  }

  @Get('user/:userId/unread')
  @ApiOperation({ summary: 'Notifications non lues d\'un utilisateur' })
  async getUnreadNotifications(@Param('userId') userId: string) {
    const notifications = await this.notificationRepository.findUnreadByRecipientId(userId);
    return {
      success: true,
      count: notifications.length,
      notifications: notifications.map(n => n.toJSON()),
    };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Marquer comme lue' })
  async markAsRead(@Param('id') id: string) {
    // Vérifier que la notification existe
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification non trouvée');
    }
    
    await this.notificationRepository.markAsRead(id);
    
    return {
      success: true,
      message: 'Notification marquée comme lue',
    };
  }

  @Put('user/:userId/read-all')
  @ApiOperation({ summary: 'Marquer toutes comme lues' })
  async markAllAsRead(@Param('userId') userId: string) {
    await this.notificationRepository.markAllAsRead(userId);
    return {
      success: true,
      message: 'Toutes les notifications marquées comme lues',
    };
  }
}
