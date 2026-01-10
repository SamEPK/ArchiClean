import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';

export class UnblockUserUseCase {
  constructor(private friendshipRepository: IFriendshipRepository) {}

  async execute(requesterId: string, targetId: string): Promise<void> {
    if (!requesterId || !targetId) {
      throw new Error('User IDs are required');
    }

    const friendship = await this.friendshipRepository.findByUsers(requesterId, targetId);
    if (!friendship) {
      throw new Error('No existing block found');
    }

    if (friendship.status !== 'blocked') {
      throw new Error('User is not blocked');
    }

    if (friendship.requesterId !== requesterId && friendship.addresseeId !== requesterId) {
      throw new Error('You are not authorized to unblock this user');
    }

    await this.friendshipRepository.delete(friendship.id);
  }
}
