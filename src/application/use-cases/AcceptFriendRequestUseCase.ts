import { Friendship } from '@domain/entities/Friendship';
import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';

export class AcceptFriendRequestUseCase {
  constructor(private friendshipRepository: IFriendshipRepository) {}

  async execute(friendshipId: string, userId: string): Promise<Friendship> {
    const friendship = await this.friendshipRepository.findById(friendshipId);

    if (!friendship) {
      throw new Error('Friend request not found');
    }

    // Only the addressee can accept the request
    if (friendship.addresseeId !== userId) {
      throw new Error('You can only accept friend requests sent to you');
    }

    if (!friendship.isPending()) {
      throw new Error('This friend request is no longer pending');
    }

    friendship.accept();
    await this.friendshipRepository.update(friendship);

    return friendship;
  }
}
