import { PrivateMessage } from '../entities/PrivateMessage';

export interface IPrivateMessageRepository {
  create(message: PrivateMessage): Promise<void>;
  findById(id: string): Promise<PrivateMessage | null>;
  findConversation(userId1: string, userId2: string, limit?: number): Promise<PrivateMessage[]>;
  markAsRead(messageId: string): Promise<void>;
  countUnreadMessages(userId: string): Promise<number>;
  findAll(): Promise<PrivateMessage[]>;
}
