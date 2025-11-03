import { Friendship } from '@domain/entities/Friendship';
import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';

export class GetFriendsListUseCase {
  constructor(private friendshipRepository: IFriendshipRepository) {}

  async execute(userId: string): Promise<Friendship[]> {
    const friendships = await this.friendshipRepository.findFriendsList(userId);
    return friendships;
  }
}
