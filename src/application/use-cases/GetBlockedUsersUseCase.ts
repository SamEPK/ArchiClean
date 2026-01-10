import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';

export interface GetBlockedUsersRequest {
  userId: string;
}

export interface BlockedUserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  blockedAt: Date;
}

export interface GetBlockedUsersResponse {
  userId: string;
  blockedUsers: BlockedUserItem[];
  totalBlocked: number;
}

export class GetBlockedUsersUseCase {
  constructor(
    private readonly friendshipRepository: IFriendshipRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: GetBlockedUsersRequest): Promise<GetBlockedUsersResponse> {
    // Get all blocked friendships for this user
    const blockedFriendships = await this.friendshipRepository.findByUserAndStatus(
      request.userId,
      'blocked',
    );

    const blockedUsers: BlockedUserItem[] = [];

    for (const friendship of blockedFriendships) {
      // The blocked user is the one who is NOT the requester
      const blockedUserId =
        friendship.requesterId === request.userId
          ? friendship.addresseeId
          : friendship.requesterId;

      const user = await this.userRepository.findById(blockedUserId);

      if (user) {
        blockedUsers.push({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          blockedAt: friendship.updatedAt || friendship.createdAt,
        });
      }
    }

    // Sort by most recently blocked first
    blockedUsers.sort((a, b) => b.blockedAt.getTime() - a.blockedAt.getTime());

    return {
      userId: request.userId,
      blockedUsers,
      totalBlocked: blockedUsers.length,
    };
  }
}
