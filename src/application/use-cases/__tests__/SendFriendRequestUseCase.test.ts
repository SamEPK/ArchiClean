import { SendFriendRequestUseCase } from '../SendFriendRequestUseCase';
import { InMemoryFriendshipRepository } from '@infrastructure/repositories/in-memory/InMemoryFriendshipRepository';
import { InMemoryClientRepository } from '@infrastructure/repositories/in-memory/InMemoryClientRepository';
import { Friendship } from '@domain/entities/Friendship';
import { Client } from '@domain/entities/Client';

describe('SendFriendRequestUseCase', () => {
  let useCase: SendFriendRequestUseCase;
  let friendshipRepository: InMemoryFriendshipRepository;
  let clientRepository: InMemoryClientRepository;

  beforeEach(() => {
    friendshipRepository = new InMemoryFriendshipRepository();
    clientRepository = new InMemoryClientRepository();
    useCase = new SendFriendRequestUseCase(friendshipRepository, clientRepository);
  });

  describe('execute', () => {
    it('should create a friend request', async () => {
      // Arrange
      const requesterId = 'user1';
      const addresseeId = 'user2';

      // Create addressee client
      const addressee = new Client({
        id: addresseeId,
        email: 'user2@example.com',
        password: 'hashedPassword',
        firstName: 'User',
        lastName: 'Two',
        isEmailConfirmed: true,
        createdAt: new Date(),
      });
      await clientRepository.create(addressee);

      // Act
      const friendship = await useCase.execute(requesterId, addresseeId);

      // Assert
      expect(friendship).toBeDefined();
      expect(friendship.requesterId).toBe(requesterId);
      expect(friendship.addresseeId).toBe(addresseeId);
      expect(friendship.status).toBe('pending');
      expect(friendship.createdAt).toBeInstanceOf(Date);

      const savedFriendship = await friendshipRepository.findById(friendship.id);
      expect(savedFriendship).toBeDefined();
    });

    it('should throw error if requesting yourself as friend', async () => {
      // Arrange
      const userId = 'user1';

      // Act & Assert
      await expect(useCase.execute(userId, userId)).rejects.toThrow('Cannot send friend request to yourself');
    });

    it('should throw error if friendship already exists', async () => {
      // Arrange
      const requesterId = 'user1';
      const addresseeId = 'user2';

      // Create addressee client
      const addressee = new Client({
        id: addresseeId,
        email: 'user2@example.com',
        password: 'hashedPassword',
        firstName: 'User',
        lastName: 'Two',
        isEmailConfirmed: true,
        createdAt: new Date(),
      });
      await clientRepository.create(addressee);

      const existingFriendship = new Friendship({
        id: 'friendship1',
        requesterId,
        addresseeId,
        status: 'pending',
        createdAt: new Date(),
      });
      await friendshipRepository.create(existingFriendship);

      // Act & Assert
      await expect(useCase.execute(requesterId, addresseeId)).rejects.toThrow('Friend request already sent');
    });

    it('should throw error if reversed friendship already exists', async () => {
      // Arrange
      const requesterId = 'user1';
      const addresseeId = 'user2';

      // Create addressee client
      const addressee = new Client({
        id: addresseeId,
        email: 'user2@example.com',
        password: 'hashedPassword',
        firstName: 'User',
        lastName: 'Two',
        isEmailConfirmed: true,
        createdAt: new Date(),
      });
      await clientRepository.create(addressee);

      const existingFriendship = new Friendship({
        id: 'friendship1',
        requesterId: addresseeId, // Reversed
        addresseeId: requesterId,
        status: 'accepted',
        createdAt: new Date(),
      });
      await friendshipRepository.create(existingFriendship);

      // Act & Assert
      await expect(useCase.execute(requesterId, addresseeId)).rejects.toThrow('You are already friends');
    });

    it('should generate unique friendship IDs', async () => {
      // Arrange - Create clients
      const user2 = new Client({ id: 'user2', email: 'user2@example.com', password: 'hashedPassword', firstName: 'User', lastName: 'Two', isEmailConfirmed: true, createdAt: new Date() });
      const user4 = new Client({ id: 'user4', email: 'user4@example.com', password: 'hashedPassword', firstName: 'User', lastName: 'Four', isEmailConfirmed: true, createdAt: new Date() });
      await clientRepository.create(user2);
      await clientRepository.create(user4);

      // Act
      const friendship1 = await useCase.execute('user1', 'user2');
      const friendship2 = await useCase.execute('user3', 'user4');

      // Assert
      expect(friendship1.id).not.toBe(friendship2.id);
    });

    it('should set initial status to pending', async () => {
      // Arrange
      const requesterId = 'user1';
      const addresseeId = 'user2';

      // Create addressee client
      const addressee = new Client({
        id: addresseeId,
        email: 'user2@example.com',
        password: 'hashedPassword',
        firstName: 'User',
        lastName: 'Two',
        isEmailConfirmed: true,
        createdAt: new Date(),
      });
      await clientRepository.create(addressee);

      // Act
      const friendship = await useCase.execute(requesterId, addresseeId);

      // Assert
      expect(friendship.status).toBe('pending');
      expect(friendship.isPending()).toBe(true);
      expect(friendship.isAccepted()).toBe(false);
    });
  });
});
