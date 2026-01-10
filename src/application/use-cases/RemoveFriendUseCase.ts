import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';

export class RemoveFriendUseCase {
  constructor(private friendshipRepository: IFriendshipRepository) {}

  async execute(userId: string, friendId: string): Promise<void> {
    if (!userId || !friendId) {
      throw new Error('User IDs are required');
    }

    const friendship = await this.friendshipRepository.findByUsers(userId, friendId);
    if (!friendship || !friendship.isAccepted()) {
      throw new Error('No friendship found to remove');
    }

    await this.friendshipRepository.delete(friendship.id);
  }
}
