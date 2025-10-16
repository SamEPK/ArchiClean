import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { Message } from '../../domain/entities/Message';
import { Conversation } from '../../domain/entities/Conversation';

export class SendMessage {
  constructor(private messageRepo: IMessageRepository) {}

  async execute(conversationId: string, senderId: string, content: string): Promise<void> {
    // create conversation if missing
    const conv = new Conversation({ id: conversationId, clientId: senderId });
    // we attempt to create - repository may ignore duplicates
    await this.messageRepo.createConversation(conv);
    const msg = new Message({ id: `${Date.now()}-${Math.random()}`, conversationId, senderId, content });
    await this.messageRepo.saveMessage(msg);
  }
}
