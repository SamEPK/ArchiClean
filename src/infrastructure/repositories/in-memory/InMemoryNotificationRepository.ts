import { Notification } from '@domain/entities/Notification';
import { INotificationRepository } from '@domain/repositories/INotificationRepository';

export class InMemoryNotificationRepository implements INotificationRepository {
  private notifications: Map<string, Notification> = new Map();

  async save(notification: Notification): Promise<Notification> {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notifications.get(id) || null;
  }

  async findByRecipientId(recipientId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.recipientId === recipientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findUnreadByRecipientId(recipientId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.recipientId === recipientId && !n.isRead)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.markAsRead();
      this.notifications.set(id, notification);
    }
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    for (const [id, notification] of this.notifications) {
      if (notification.recipientId === recipientId && !notification.isRead) {
        notification.markAsRead();
        this.notifications.set(id, notification);
      }
    }
  }

  async delete(id: string): Promise<void> {
    this.notifications.delete(id);
  }

  clear(): void {
    this.notifications.clear();
  }
}
