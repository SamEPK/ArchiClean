import { Friendship } from '@domain/entities/Friendship';
import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';

export class GetPendingRequestsUseCase {
  constructor(private friendshipRepository: IFriendshipRepository) {}

  async execute(userId: string): Promise<Friendship[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.friendshipRepository.findPendingRequests(userId);
  }
}
