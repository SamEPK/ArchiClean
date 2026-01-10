import { IPrivateMessageRepository } from '@domain/repositories/IPrivateMessageRepository';

export class MarkMessageAsReadUseCase {
  constructor(private privateMessageRepository: IPrivateMessageRepository) {}

  async execute(messageId: string, readerId: string): Promise<void> {
    if (!messageId || !readerId) {
      throw new Error('Message ID and reader ID are required');
    }

    const message = await this.privateMessageRepository.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.receiverId !== readerId) {
      throw new Error('Only the receiver can mark this message as read');
    }

    await this.privateMessageRepository.markAsRead(messageId);
  }
}
