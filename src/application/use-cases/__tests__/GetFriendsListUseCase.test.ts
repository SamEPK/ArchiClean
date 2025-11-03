import { GetFriendsListUseCase } from '../GetFriendsListUseCase';
import { InMemoryFriendshipRepository } from '@infrastructure/repositories/in-memory/InMemoryFriendshipRepository';
import { Friendship } from '@domain/entities/Friendship';

describe('GetFriendsListUseCase', () => {
  let useCase: GetFriendsListUseCase;
  let friendshipRepository: InMemoryFriendshipRepository;

  beforeEach(() => {
    friendshipRepository = new InMemoryFriendshipRepository();
    useCase = new GetFriendsListUseCase(friendshipRepository);
  });

  describe('execute', () => {
    it('should return list of accepted friends', async () => {
      // Arrange
      const userId = 'user1';

      const friendship1 = new Friendship({
        id: 'friendship1',
        requesterId: userId,
        addresseeId: 'user2',
        status: 'accepted',
        createdAt: new Date(),
      });

      const friendship2 = new Friendship({
        id: 'friendship2',
        requesterId: 'user3',
        addresseeId: userId,
        status: 'accepted',
        createdAt: new Date(),
      });

      await friendshipRepository.create(friendship1);
      await friendshipRepository.create(friendship2);

      // Act
      const friends = await useCase.execute(userId);

      // Assert
      expect(friends).toHaveLength(2);
      expect(friends).toContainEqual(expect.objectContaining({ addresseeId: 'user2' }));
      expect(friends).toContainEqual(expect.objectContaining({ requesterId: 'user3' }));
    });

    it('should not return pending friend requests', async () => {
      // Arrange
      const userId = 'user1';

      const acceptedFriendship = new Friendship({
        id: 'friendship1',
        requesterId: userId,
        addresseeId: 'user2',
        status: 'accepted',
        createdAt: new Date(),
      });

      const pendingFriendship = new Friendship({
        id: 'friendship2',
        requesterId: userId,
        addresseeId: 'user3',
        status: 'pending',
        createdAt: new Date(),
      });

      await friendshipRepository.create(acceptedFriendship);
      await friendshipRepository.create(pendingFriendship);

      // Act
      const friends = await useCase.execute(userId);

      // Assert
      expect(friends).toHaveLength(1);
      expect(friends[0].addresseeId).toBe('user2');
    });

    it('should not return rejected friend requests', async () => {
      // Arrange
      const userId = 'user1';

      const acceptedFriendship = new Friendship({
        id: 'friendship1',
        requesterId: userId,
        addresseeId: 'user2',
        status: 'accepted',
        createdAt: new Date(),
      });

      const rejectedFriendship = new Friendship({
        id: 'friendship2',
        requesterId: userId,
        addresseeId: 'user3',
        status: 'rejected',
        createdAt: new Date(),
      });

      await friendshipRepository.create(acceptedFriendship);
      await friendshipRepository.create(rejectedFriendship);

      // Act
      const friends = await useCase.execute(userId);

      // Assert
      expect(friends).toHaveLength(1);
      expect(friends[0].addresseeId).toBe('user2');
    });

    it('should not return blocked friendships', async () => {
      // Arrange
      const userId = 'user1';

      const acceptedFriendship = new Friendship({
        id: 'friendship1',
        requesterId: userId,
        addresseeId: 'user2',
        status: 'accepted',
        createdAt: new Date(),
      });

      const blockedFriendship = new Friendship({
        id: 'friendship2',
        requesterId: userId,
        addresseeId: 'user3',
        status: 'blocked',
        createdAt: new Date(),
      });

      await friendshipRepository.create(acceptedFriendship);
      await friendshipRepository.create(blockedFriendship);

      // Act
      const friends = await useCase.execute(userId);

      // Assert
      expect(friends).toHaveLength(1);
      expect(friends[0].addresseeId).toBe('user2');
    });

    it('should return empty array if user has no friends', async () => {
      // Arrange
      const userId = 'user1';

      // Act
      const friends = await useCase.execute(userId);

      // Assert
      expect(friends).toHaveLength(0);
      expect(friends).toEqual([]);
    });

    it('should return friends regardless of who initiated the request', async () => {
      // Arrange
      const userId = 'user1';

      const friendship1 = new Friendship({
        id: 'friendship1',
        requesterId: userId,
        addresseeId: 'user2',
        status: 'accepted',
        createdAt: new Date(),
      });

      const friendship2 = new Friendship({
        id: 'friendship2',
        requesterId: 'user3',
        addresseeId: userId,
        status: 'accepted',
        createdAt: new Date(),
      });

      await friendshipRepository.create(friendship1);
      await friendshipRepository.create(friendship2);

      // Act
      const friends = await useCase.execute(userId);

      // Assert
      expect(friends).toHaveLength(2);
    });

    it('should not return friendships where user is not involved', async () => {
      // Arrange
      const userId = 'user1';

      const friendship1 = new Friendship({
        id: 'friendship1',
        requesterId: userId,
        addresseeId: 'user2',
        status: 'accepted',
        createdAt: new Date(),
      });

      const friendship2 = new Friendship({
        id: 'friendship2',
        requesterId: 'user3',
        addresseeId: 'user4',
        status: 'accepted',
        createdAt: new Date(),
      });

      await friendshipRepository.create(friendship1);
      await friendshipRepository.create(friendship2);

      // Act
      const friends = await useCase.execute(userId);

      // Assert
      expect(friends).toHaveLength(1);
      expect(friends[0].addresseeId).toBe('user2');
    });
  });
});
