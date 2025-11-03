import { SendPrivateMessageUseCase, IWebSocketNotifier } from '../SendPrivateMessageUseCase';
import { InMemoryPrivateMessageRepository } from '@infrastructure/repositories/in-memory/InMemoryPrivateMessageRepository';
import { InMemoryFriendshipRepository } from '@infrastructure/repositories/in-memory/InMemoryFriendshipRepository';
import { Friendship } from '@domain/entities/Friendship';
import { PrivateMessage } from '@domain/entities/PrivateMessage';

class MockWebSocketNotifier implements IWebSocketNotifier {
  async notifyNewMessage(receiverId: string, message: PrivateMessage): Promise<void> {
    // Mock implementation - does nothing
  }
}

describe('SendPrivateMessageUseCase', () => {
  let useCase: SendPrivateMessageUseCase;
  let messageRepository: InMemoryPrivateMessageRepository;
  let friendshipRepository: InMemoryFriendshipRepository;
  let mockNotifier: IWebSocketNotifier;

  beforeEach(() => {
    messageRepository = new InMemoryPrivateMessageRepository();
    friendshipRepository = new InMemoryFriendshipRepository();
    mockNotifier = new MockWebSocketNotifier();
    useCase = new SendPrivateMessageUseCase(messageRepository, friendshipRepository, mockNotifier);
  });

  describe('execute', () => {
    it('should send a private message between friends', async () => {
      // Arrange
      const senderId = 'user1';
      const receiverId = 'user2';
      const content = 'Hello friend!';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId: senderId,
        addresseeId: receiverId,
        status: 'accepted',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act
      const message = await useCase.execute(senderId, receiverId, content);

      // Assert
      expect(message).toBeDefined();
      expect(message.senderId).toBe(senderId);
      expect(message.receiverId).toBe(receiverId);
      expect(message.content).toBe(content);
      expect(message.isRead).toBe(false);
      expect(message.createdAt).toBeInstanceOf(Date);

      const savedMessage = await messageRepository.findById(message.id);
      expect(savedMessage).toBeDefined();
      expect(savedMessage?.content).toBe(content);
    });

    it('should throw error if content is empty', async () => {
      // Arrange
      const senderId = 'user1';
      const receiverId = 'user2';
      const content = '';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId: senderId,
        addresseeId: receiverId,
        status: 'accepted',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act & Assert
      await expect(useCase.execute(senderId, receiverId, content)).rejects.toThrow('Message content cannot be empty');
    });

    it('should throw error if content is only whitespace', async () => {
      // Arrange
      const senderId = 'user1';
      const receiverId = 'user2';
      const content = '   ';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId: senderId,
        addresseeId: receiverId,
        status: 'accepted',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act & Assert
      await expect(useCase.execute(senderId, receiverId, content)).rejects.toThrow('Message content cannot be empty');
    });

    it('should throw error if friendship does not exist', async () => {
      // Arrange
      const senderId = 'user1';
      const receiverId = 'user2';
      const content = 'Hello!';

      // Act & Assert
      await expect(useCase.execute(senderId, receiverId, content)).rejects.toThrow(
        'You can only send messages to your friends'
      );
    });

    it('should throw error if friendship is not accepted', async () => {
      // Arrange
      const senderId = 'user1';
      const receiverId = 'user2';
      const content = 'Hello!';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId: senderId,
        addresseeId: receiverId,
        status: 'pending',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act & Assert
      await expect(useCase.execute(senderId, receiverId, content)).rejects.toThrow(
        'You can only send messages to your friends'
      );
    });

    it('should trim whitespace from content', async () => {
      // Arrange
      const senderId = 'user1';
      const receiverId = 'user2';
      const content = '  Hello with spaces  ';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId: senderId,
        addresseeId: receiverId,
        status: 'accepted',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act
      const message = await useCase.execute(senderId, receiverId, content);

      // Assert
      expect(message.content).toBe('Hello with spaces');
    });

    it('should work with friendship in either direction', async () => {
      // Arrange
      const senderId = 'user1';
      const receiverId = 'user2';
      const content = 'Hello!';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId: receiverId, // Receiver sent the friend request
        addresseeId: senderId,
        status: 'accepted',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act
      const message = await useCase.execute(senderId, receiverId, content);

      // Assert
      expect(message).toBeDefined();
      expect(message.senderId).toBe(senderId);
      expect(message.receiverId).toBe(receiverId);
    });

    it('should generate unique message IDs', async () => {
      // Arrange
      const senderId = 'user1';
      const receiverId = 'user2';

      const friendship = new Friendship({
        id: 'friendship1',
        requesterId: senderId,
        addresseeId: receiverId,
        status: 'accepted',
        createdAt: new Date(),
      });
      await friendshipRepository.create(friendship);

      // Act
      const message1 = await useCase.execute(senderId, receiverId, 'Message 1');
      const message2 = await useCase.execute(senderId, receiverId, 'Message 2');

      // Assert
      expect(message1.id).not.toBe(message2.id);
    });
  });
});
