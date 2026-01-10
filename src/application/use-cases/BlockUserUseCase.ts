import { Friendship } from '@domain/entities/Friendship';
import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';
import { IClientRepository } from '@domain/repositories/IClientRepository';

export class BlockUserUseCase {
  constructor(
    private friendshipRepository: IFriendshipRepository,
    private clientRepository: IClientRepository
  ) {}

  async execute(blockerId: string, targetId: string): Promise<Friendship> {
    if (!blockerId || !targetId) {
      throw new Error('User IDs are required');
    }

    if (blockerId === targetId) {
      throw new Error('Cannot block yourself');
    }

    const target = await this.clientRepository.findById(targetId);
    if (!target) {
      throw new Error('User not found');
    }

    const existing = await this.friendshipRepository.findByUsers(blockerId, targetId);
    if (existing) {
      existing.block();
      await this.friendshipRepository.update(existing);
      return existing;
    }

    const friendship = new Friendship({
      id: this.generateId(),
      requesterId: blockerId,
      addresseeId: targetId,
      status: 'blocked',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.friendshipRepository.create(friendship);
    return friendship;
  }

  private generateId(): string {
    return `friendship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
