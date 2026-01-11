import { Notification } from '../entities/Notification';

export interface INotificationRepository {
  save(notification: Notification): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByRecipientId(recipientId: string): Promise<Notification[]>;
  findUnreadByRecipientId(recipientId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(recipientId: string): Promise<void>;
  delete(id: string): Promise<void>;
}
