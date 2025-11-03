import { Friendship } from '@domain/entities/Friendship';
import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';
import { IClientRepository } from '@domain/repositories/IClientRepository';

export class SendFriendRequestUseCase {
  constructor(
    private friendshipRepository: IFriendshipRepository,
    private clientRepository: IClientRepository
  ) {}

  async execute(requesterId: string, addresseeId: string): Promise<Friendship> {
    if (!requesterId || !addresseeId) {
      throw new Error('Requester and addressee IDs are required');
    }

    if (requesterId === addresseeId) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if addressee exists
    const addressee = await this.clientRepository.findById(addresseeId);
    if (!addressee) {
      throw new Error('User not found');
    }

    // Check if friendship already exists
    const existing = await this.friendshipRepository.findByUsers(requesterId, addresseeId);
    if (existing) {
      if (existing.isAccepted()) {
        throw new Error('You are already friends');
      }
      if (existing.isPending()) {
        throw new Error('Friend request already sent');
      }
      if (existing.status === 'rejected') {
        throw new Error('Your previous friend request was rejected');
      }
      if (existing.status === 'blocked') {
        throw new Error('Cannot send friend request to this user');
      }
    }

    const friendship = new Friendship({
      id: this.generateId(),
      requesterId,
      addresseeId,
      status: 'pending',
      createdAt: new Date(),
    });

    await this.friendshipRepository.create(friendship);

    return friendship;
  }

  private generateId(): string {
    return `friendship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
