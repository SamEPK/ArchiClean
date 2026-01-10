import { PrivateMessage } from '@domain/entities/PrivateMessage';
import { IPrivateMessageRepository } from '@domain/repositories/IPrivateMessageRepository';
import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';

export class GetConversationHistoryUseCase {
  constructor(
    private privateMessageRepository: IPrivateMessageRepository,
    private friendshipRepository: IFriendshipRepository
  ) {}

  async execute(userId: string, otherUserId: string, limit: number = 50): Promise<PrivateMessage[]> {
    if (!userId || !otherUserId) {
      throw new Error('User IDs are required');
    }

    if (userId === otherUserId) {
      throw new Error('Cannot retrieve conversation with yourself');
    }

    // Verify friendship
    const friendship = await this.friendshipRepository.findByUsers(userId, otherUserId);
    if (!friendship || !friendship.isAccepted()) {
      throw new Error('You can only view conversations with your friends');
    }

    const messages = await this.privateMessageRepository.findConversation(userId, otherUserId, limit);
    // Oldest to newest for a natural timeline
    return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}
