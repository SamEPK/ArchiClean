import { AcceptFriendRequestUseCase } from '../AcceptFriendRequestUseCase';
import { InMemoryFriendshipRepository } from '@infrastructure/repositories/in-memory/InMemoryFriendshipRepository';
import { Friendship } from '@domain/entities/Friendship';

describe('AcceptFriendRequestUseCase', () => {
  let useCase: AcceptFriendRequestUseCase;
  let friendshipRepository: InMemoryFriendshipRepository;

  beforeEach(() => {
    friendshipRepository = new InMemoryFriendshipRepository();
    useCase = new AcceptFriendRequestUseCase(friendshipRepository);
  });

  describe('execute', () => {
    it('should accept a pending friend request by addressee', async () => {
      // Arrange
      const requesterId = 'user1';
      const addresseeId = 'user2';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId,
        addresseeId,
        status: 'pending',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act
      const acceptedFriendship = await useCase.execute(friendship.id, addresseeId);

      // Assert
      expect(acceptedFriendship.status).toBe('accepted');
      expect(acceptedFriendship.isAccepted()).toBe(true);
      expect(acceptedFriendship.isPending()).toBe(false);

      const savedFriendship = await friendshipRepository.findById(friendship.id);
      expect(savedFriendship?.status).toBe('accepted');
    });

    it('should throw error if friendship not found', async () => {
      // Arrange
      const friendshipId = 'nonexistent';
      const userId = 'user1';

      // Act & Assert
      await expect(useCase.execute(friendshipId, userId)).rejects.toThrow('Friend request not found');
    });

    it('should throw error if user is not the addressee', async () => {
      // Arrange
      const requesterId = 'user1';
      const addresseeId = 'user2';
      const randomUser = 'user3';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId,
        addresseeId,
        status: 'pending',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act & Assert
      await expect(useCase.execute(friendship.id, randomUser)).rejects.toThrow(
        'You can only accept friend requests sent to you'
      );
    });

    it('should throw error if requester tries to accept their own request', async () => {
      // Arrange
      const requesterId = 'user1';
      const addresseeId = 'user2';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId,
        addresseeId,
        status: 'pending',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act & Assert
      await expect(useCase.execute(friendship.id, requesterId)).rejects.toThrow(
        'You can only accept friend requests sent to you'
      );
    });

    it('should throw error if friendship is already accepted', async () => {
      // Arrange
      const requesterId = 'user1';
      const addresseeId = 'user2';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId,
        addresseeId,
        status: 'accepted',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act & Assert
      await expect(useCase.execute(friendship.id, addresseeId)).rejects.toThrow('This friend request is no longer pending');
    });

    it('should throw error if friendship is rejected', async () => {
      // Arrange
      const requesterId = 'user1';
      const addresseeId = 'user2';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId,
        addresseeId,
        status: 'rejected',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act & Assert
      await expect(useCase.execute(friendship.id, addresseeId)).rejects.toThrow('This friend request is no longer pending');
    });

    it('should throw error if friendship is blocked', async () => {
      // Arrange
      const requesterId = 'user1';
      const addresseeId = 'user2';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId,
        addresseeId,
        status: 'blocked',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act & Assert
      await expect(useCase.execute(friendship.id, addresseeId)).rejects.toThrow('This friend request is no longer pending');
    });

    it('should update the friendship in repository', async () => {
      // Arrange
      const requesterId = 'user1';
      const addresseeId = 'user2';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId,
        addresseeId,
        status: 'pending',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act
      await useCase.execute(friendship.id, addresseeId);

      // Assert
      const updatedFriendship = await friendshipRepository.findById(friendship.id);
      expect(updatedFriendship).toBeDefined();
      expect(updatedFriendship?.status).toBe('accepted');
    });
  });
});
