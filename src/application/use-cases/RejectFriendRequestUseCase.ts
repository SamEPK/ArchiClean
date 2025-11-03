import { Friendship } from '@domain/entities/Friendship';
import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';

export class RejectFriendRequestUseCase {
  constructor(private friendshipRepository: IFriendshipRepository) {}

  async execute(friendshipId: string, userId: string): Promise<Friendship> {
    const friendship = await this.friendshipRepository.findById(friendshipId);

    if (!friendship) {
      throw new Error('Friend request not found');
    }

    if (friendship.addresseeId !== userId) {
      throw new Error('You can only reject friend requests sent to you');
    }

    if (!friendship.isPending()) {
      throw new Error('This friend request is no longer pending');
    }

    friendship.reject();
    await this.friendshipRepository.update(friendship);

    return friendship;
  }
}
