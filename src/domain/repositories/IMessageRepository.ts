import { Message } from '../entities/Message';
import { Conversation } from '../entities/Conversation';

export interface IMessageRepository {
  saveMessage(message: Message): Promise<void>;
  listMessages(conversationId: string): Promise<Message[]>;
  createConversation(conv: Conversation): Promise<void>;
  findOpenConversations(): Promise<Conversation[]>;
  assignConversation(convId: string, advisorId: string): Promise<void>;
  transferConversation(convId: string, fromAdvisorId: string, toAdvisorId: string): Promise<void>;
  findConversationById(convId: string): Promise<Conversation | null>;
}
