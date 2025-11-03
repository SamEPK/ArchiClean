import { GetConversationHistoryUseCase } from '../GetConversationHistoryUseCase';
import { InMemoryPrivateMessageRepository } from '@infrastructure/repositories/in-memory/InMemoryPrivateMessageRepository';
import { InMemoryFriendshipRepository } from '@infrastructure/repositories/in-memory/InMemoryFriendshipRepository';
import { PrivateMessage } from '@domain/entities/PrivateMessage';
import { Friendship } from '@domain/entities/Friendship';

describe('GetConversationHistoryUseCase', () => {
  let useCase: GetConversationHistoryUseCase;
  let messageRepository: InMemoryPrivateMessageRepository;
  let friendshipRepository: InMemoryFriendshipRepository;

  const createFriendship = async (user1: string, user2: string) => {
    const friendship = new Friendship({
      id: `friendship_${user1}_${user2}`,
      requesterId: user1,
      addresseeId: user2,
      status: 'accepted',
      createdAt: new Date(),
    });
    await friendshipRepository.create(friendship);
  };

  beforeEach(() => {
    messageRepository = new InMemoryPrivateMessageRepository();
    friendshipRepository = new InMemoryFriendshipRepository();
    useCase = new GetConversationHistoryUseCase(messageRepository, friendshipRepository);
  });

  describe('execute', () => {
    it('should return conversation history between two users', async () => {
      // Arrange
      const user1 = 'user1';
      const user2 = 'user2';

      // Create friendship
      await createFriendship(user1, user2);

      const message1 = new PrivateMessage({
        id: 'msg1',
        senderId: user1,
        receiverId: user2,
        content: 'Hello from user1',
        isRead: false,
        createdAt: new Date('2024-01-01T10:00:00Z'),
      });

      const message2 = new PrivateMessage({
        id: 'msg2',
        senderId: user2,
        receiverId: user1,
        content: 'Hello from user2',
        isRead: true,
        createdAt: new Date('2024-01-01T10:01:00Z'),
      });

      const message3 = new PrivateMessage({
        id: 'msg3',
        senderId: user1,
        receiverId: user2,
        content: 'How are you?',
        isRead: false,
        createdAt: new Date('2024-01-01T10:02:00Z'),
      });

      await messageRepository.create(message1);
      await messageRepository.create(message2);
      await messageRepository.create(message3);

      // Act
      const messages = await useCase.execute(user1, user2);

      // Assert
      expect(messages).toHaveLength(3);
      expect(messages[0].id).toBe('msg3'); // Most recent first
      expect(messages[1].id).toBe('msg2');
      expect(messages[2].id).toBe('msg1');
    });

    it('should not return messages from other conversations', async () => {
      // Arrange
      const user1 = 'user1';
      const user2 = 'user2';
      const user3 = 'user3';

      // Create friendships
      await createFriendship(user1, user2);
      await createFriendship(user1, user3);

      const relevantMessage = new PrivateMessage({
        id: 'msg1',
        senderId: user1,
        receiverId: user2,
        content: 'Message 1',
        isRead: false,
        createdAt: new Date('2024-01-01T10:00:00Z'),
      });

      const irrelevantMessage = new PrivateMessage({
        id: 'msg2',
        senderId: user1,
        receiverId: user3,
        content: 'Message 2',
        isRead: false,
        createdAt: new Date('2024-01-01T10:01:00Z'),
      });

      await messageRepository.create(relevantMessage);
      await messageRepository.create(irrelevantMessage);

      // Act
      const messages = await useCase.execute(user1, user2);

      // Assert
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe('msg1');
    });

    it('should respect the limit parameter', async () => {
      // Arrange
      const user1 = 'user1';
      const user2 = 'user2';

      // Create friendship
      await createFriendship(user1, user2);

      for (let i = 0; i < 10; i++) {
        const message = new PrivateMessage({
          id: `msg${i}`,
          senderId: user1,
          receiverId: user2,
          content: `Message ${i}`,
          isRead: false,
          createdAt: new Date(`2024-01-01T10:${String(i).padStart(2, '0')}:00Z`),
        });
        await messageRepository.create(message);
      }

      // Act
      const messages = await useCase.execute(user1, user2, 5);

      // Assert
      expect(messages).toHaveLength(5);
    });

    it('should return messages sorted by most recent first', async () => {
      // Arrange
      const user1 = 'user1';
      const user2 = 'user2';

      // Create friendship
      await createFriendship(user1, user2);

      const oldMessage = new PrivateMessage({
        id: 'msg1',
        senderId: user1,
        receiverId: user2,
        content: 'Old message',
        isRead: false,
        createdAt: new Date('2024-01-01T10:00:00Z'),
      });

      const newMessage = new PrivateMessage({
        id: 'msg2',
        senderId: user2,
        receiverId: user1,
        content: 'New message',
        isRead: false,
        createdAt: new Date('2024-01-02T10:00:00Z'),
      });

      await messageRepository.create(oldMessage);
      await messageRepository.create(newMessage);

      // Act
      const messages = await useCase.execute(user1, user2);

      // Assert
      expect(messages[0].id).toBe('msg2'); // Newest first
      expect(messages[1].id).toBe('msg1');
    });

    it('should return empty array if no messages exist', async () => {
      // Arrange
      const user1 = 'user1';
      const user2 = 'user2';

      // Create friendship
      await createFriendship(user1, user2);

      // Act
      const messages = await useCase.execute(user1, user2);

      // Assert
      expect(messages).toHaveLength(0);
      expect(messages).toEqual([]);
    });

    it('should work with default limit of 50', async () => {
      // Arrange
      const user1 = 'user1';
      const user2 = 'user2';

      // Create friendship
      await createFriendship(user1, user2);

      for (let i = 0; i < 60; i++) {
        const message = new PrivateMessage({
          id: `msg${i}`,
          senderId: user1,
          receiverId: user2,
          content: `Message ${i}`,
          isRead: false,
          createdAt: new Date(`2024-01-01T${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00Z`),
        });
        await messageRepository.create(message);
      }

      // Act
      const messages = await useCase.execute(user1, user2);

      // Assert
      expect(messages).toHaveLength(50); // Default limit
    });

    it('should return messages bidirectionally', async () => {
      // Arrange
      const user1 = 'user1';
      const user2 = 'user2';

      // Create friendship
      await createFriendship(user1, user2);

      const messageFromUser1 = new PrivateMessage({
        id: 'msg1',
        senderId: user1,
        receiverId: user2,
        content: 'From user1',
        isRead: false,
        createdAt: new Date('2024-01-01T10:00:00Z'),
      });

      const messageFromUser2 = new PrivateMessage({
        id: 'msg2',
        senderId: user2,
        receiverId: user1,
        content: 'From user2',
        isRead: false,
        createdAt: new Date('2024-01-01T10:01:00Z'),
      });

      await messageRepository.create(messageFromUser1);
      await messageRepository.create(messageFromUser2);

      // Act
      const messagesForUser1 = await useCase.execute(user1, user2);
      const messagesForUser2 = await useCase.execute(user2, user1);

      // Assert
      expect(messagesForUser1).toHaveLength(2);
      expect(messagesForUser2).toHaveLength(2);
      expect(messagesForUser1).toEqual(messagesForUser2);
    });
  });
});
