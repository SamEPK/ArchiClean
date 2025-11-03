import { Friendship, FriendshipStatus } from '../entities/Friendship';

export interface IFriendshipRepository {
  create(friendship: Friendship): Promise<void>;
  findById(id: string): Promise<Friendship | null>;
  findByUsers(userId1: string, userId2: string): Promise<Friendship | null>;
  findByUserAndStatus(userId: string, status: FriendshipStatus): Promise<Friendship[]>;
  findFriendsList(userId: string): Promise<Friendship[]>;
  findPendingRequests(userId: string): Promise<Friendship[]>;
  update(friendship: Friendship): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Friendship[]>;
}
