import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { Message } from '../../domain/entities/Message';
import { Conversation } from '../../domain/entities/Conversation';

interface SendMessageRequest {
  conversationId: string;
  senderId: string;
  content: string;
  senderRole: 'client' | 'advisor';
}

export class SendMessage {
  constructor(private messageRepo: IMessageRepository) {}

  async execute(request: SendMessageRequest): Promise<void> {
    const { conversationId, senderId, content, senderRole } = request;

    // Create conversation if missing; for client messages we set clientId
    const existingConv = await this.messageRepo.findConversationById(conversationId);
    const conv =
      existingConv ??
      new Conversation({ id: conversationId, clientId: senderId });

    await this.messageRepo.createConversation(conv);

    // Auto-assign to first responding advisor
    if (senderRole === 'advisor') {
      await this.messageRepo.markConversationAssignedByFirstResponder(
        conversationId,
        senderId,
      );
    }

    const msg = new Message({
      id: `${Date.now()}-${Math.random()}`,
      conversationId,
      senderId,
      content,
    });
    await this.messageRepo.saveMessage(msg);
  }
}
