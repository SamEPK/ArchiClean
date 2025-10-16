import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { Message } from '../../../domain/entities/Message';
import { Conversation } from '../../../domain/entities/Conversation';

export class InMemoryMessageRepository implements IMessageRepository {
  private messages: Map<string, Message[]> = new Map();
  private conversations: Map<string, Conversation> = new Map();

  async saveMessage(message: Message): Promise<void> {
    const arr = this.messages.get(message.conversationId) ?? [];
    arr.push(message);
    this.messages.set(message.conversationId, arr);
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    return this.messages.get(conversationId) ?? [];
  }

  async createConversation(conv: Conversation): Promise<void> {
    this.conversations.set(conv.id, conv);
  }

  async findOpenConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(c => c.status === 'open');
  }

  async assignConversation(convId: string, advisorId: string): Promise<void> {
    const conv = this.conversations.get(convId);
    if (!conv) return;
    conv.advisorId = advisorId;
    conv.status = 'assigned';
    this.conversations.set(convId, conv);
  }

  async transferConversation(convId: string, fromAdvisorId: string, toAdvisorId: string): Promise<void> {
    const conv = this.conversations.get(convId);
    if (!conv) return;
    if (conv.advisorId !== fromAdvisorId) return;
    conv.advisorId = toAdvisorId;
    this.conversations.set(convId, conv);
  }

  async findConversationById(convId: string): Promise<Conversation | null> {
    return this.conversations.get(convId) ?? null;
  }
}
