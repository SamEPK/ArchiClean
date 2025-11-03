import { IPrivateMessageRepository } from '@domain/repositories/IPrivateMessageRepository';
import { PrivateMessage } from '@domain/entities/PrivateMessage';

export class InMemoryPrivateMessageRepository implements IPrivateMessageRepository {
  private messages: Map<string, PrivateMessage> = new Map();

  async create(message: PrivateMessage): Promise<void> {
    this.messages.set(message.id, message);
  }

  async findById(id: string): Promise<PrivateMessage | null> {
    return this.messages.get(id) || null;
  }

  async findConversation(userId1: string, userId2: string, limit: number = 50): Promise<PrivateMessage[]> {
    const messages = Array.from(this.messages.values())
      .filter(
        m =>
          (m.senderId === userId1 && m.receiverId === userId2) || (m.senderId === userId2 && m.receiverId === userId1)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return messages;
  }

  async markAsRead(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.markAsRead();
    }
  }

  async countUnreadMessages(userId: string): Promise<number> {
    return Array.from(this.messages.values()).filter(m => m.receiverId === userId && !m.isRead).length;
  }

  async findAll(): Promise<PrivateMessage[]> {
    return Array.from(this.messages.values());
  }

  clear(): void {
    this.messages.clear();
  }
}
