import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';
import { Friendship, FriendshipStatus } from '@domain/entities/Friendship';

export class InMemoryFriendshipRepository implements IFriendshipRepository {
  private friendships: Map<string, Friendship> = new Map();

  async create(friendship: Friendship): Promise<void> {
    this.friendships.set(friendship.id, friendship);
  }

  async findById(id: string): Promise<Friendship | null> {
    return this.friendships.get(id) || null;
  }

  async findByUsers(userId1: string, userId2: string): Promise<Friendship | null> {
    for (const friendship of this.friendships.values()) {
      if (
        (friendship.requesterId === userId1 && friendship.addresseeId === userId2) ||
        (friendship.requesterId === userId2 && friendship.addresseeId === userId1)
      ) {
        return friendship;
      }
    }
    return null;
  }

  async findByUserAndStatus(userId: string, status: FriendshipStatus): Promise<Friendship[]> {
    return Array.from(this.friendships.values()).filter(
      f => (f.requesterId === userId || f.addresseeId === userId) && f.status === status
    );
  }

  async findFriendsList(userId: string): Promise<Friendship[]> {
    return Array.from(this.friendships.values()).filter(
      f => (f.requesterId === userId || f.addresseeId === userId) && f.status === 'accepted'
    );
  }

  async findPendingRequests(userId: string): Promise<Friendship[]> {
    return Array.from(this.friendships.values()).filter(f => f.addresseeId === userId && f.status === 'pending');
  }

  async update(friendship: Friendship): Promise<void> {
    if (!this.friendships.has(friendship.id)) {
      throw new Error('Friendship not found');
    }
    this.friendships.set(friendship.id, friendship);
  }

  async delete(id: string): Promise<void> {
    this.friendships.delete(id);
  }

  async findAll(): Promise<Friendship[]> {
    return Array.from(this.friendships.values());
  }

  clear(): void {
    this.friendships.clear();
  }
}
