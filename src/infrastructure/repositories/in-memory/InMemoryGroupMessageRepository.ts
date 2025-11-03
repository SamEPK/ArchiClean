import { IGroupMessageRepository } from '@domain/repositories/IGroupMessageRepository';
import { GroupMessage } from '@domain/entities/GroupMessage';

export class InMemoryGroupMessageRepository implements IGroupMessageRepository {
  private messages: Map<string, GroupMessage> = new Map();

  async create(message: GroupMessage): Promise<void> {
    this.messages.set(message.id, message);
  }

  async findById(id: string): Promise<GroupMessage | null> {
    return this.messages.get(id) || null;
  }

  async findByGroupId(groupId: string, limit: number = 100): Promise<GroupMessage[]> {
    return Array.from(this.messages.values())
      .filter(m => m.groupId === groupId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async findAll(): Promise<GroupMessage[]> {
    return Array.from(this.messages.values());
  }

  clear(): void {
    this.messages.clear();
  }
}
