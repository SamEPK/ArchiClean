import { PrivateMessage } from '@domain/entities/PrivateMessage';
import { IPrivateMessageRepository } from '@domain/repositories/IPrivateMessageRepository';
import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';

export interface IWebSocketNotifier {
  notifyNewMessage(receiverId: string, message: PrivateMessage): Promise<void>;
}

export class SendPrivateMessageUseCase {
  constructor(
    private privateMessageRepository: IPrivateMessageRepository,
    private friendshipRepository: IFriendshipRepository,
    private webSocketNotifier: IWebSocketNotifier
  ) {}

  async execute(senderId: string, receiverId: string, content: string): Promise<PrivateMessage> {
    if (!senderId || !receiverId) {
      throw new Error('Sender and receiver IDs are required');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    if (senderId === receiverId) {
      throw new Error('Cannot send message to yourself');
    }

    // Verify that users are friends
    const friendship = await this.friendshipRepository.findByUsers(senderId, receiverId);
    if (!friendship || !friendship.isAccepted()) {
      throw new Error('You can only send messages to your friends');
    }

    const message = new PrivateMessage({
      id: this.generateId(),
      senderId,
      receiverId,
      content: content.trim(),
      isRead: false,
      createdAt: new Date(),
    });

    await this.privateMessageRepository.create(message);

    // Notify receiver via WebSocket
    try {
      await this.webSocketNotifier.notifyNewMessage(receiverId, message);
    } catch (error) {
      console.error('Failed to send WebSocket notification:', error);
      // Don't fail the operation if notification fails
    }

    return message;
  }

  private generateId(): string {
    return `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
