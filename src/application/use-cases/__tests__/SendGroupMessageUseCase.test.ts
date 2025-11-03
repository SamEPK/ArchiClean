import { SendGroupMessageUseCase } from '../SendGroupMessageUseCase';
import { InMemoryGroupMessageRepository } from '@infrastructure/repositories/in-memory/InMemoryGroupMessageRepository';
import { InMemoryGroupMemberRepository } from '@infrastructure/repositories/in-memory/InMemoryGroupMemberRepository';
import { GroupMember } from '@domain/entities/GroupMember';

describe('SendGroupMessageUseCase', () => {
  let useCase: SendGroupMessageUseCase;
  let messageRepository: InMemoryGroupMessageRepository;
  let memberRepository: InMemoryGroupMemberRepository;

  beforeEach(() => {
    messageRepository = new InMemoryGroupMessageRepository();
    memberRepository = new InMemoryGroupMemberRepository();
    useCase = new SendGroupMessageUseCase(messageRepository, memberRepository);
  });

  describe('execute', () => {
    it('should send a group message by active member', async () => {
      // Arrange
      const groupId = 'group1';
      const senderId = 'user1';
      const content = 'Hello group!';

      const membership = new GroupMember({
        id: 'member1',
        groupId,
        userId: senderId,
        role: 'member',
        status: 'active',
        joinedAt: new Date(),
      });
      await memberRepository.create(membership);

      // Act
      const message = await useCase.execute(groupId, senderId, content);

      // Assert
      expect(message).toBeDefined();
      expect(message.groupId).toBe(groupId);
      expect(message.senderId).toBe(senderId);
      expect(message.content).toBe(content);
      expect(message.createdAt).toBeInstanceOf(Date);

      const savedMessage = await messageRepository.findById(message.id);
      expect(savedMessage).toBeDefined();
      expect(savedMessage?.content).toBe(content);
    });

    it('should throw error if content is empty', async () => {
      // Arrange
      const groupId = 'group1';
      const senderId = 'user1';
      const content = '';

      const membership = new GroupMember({
        id: 'member1',
        groupId,
        userId: senderId,
        role: 'member',
        status: 'active',
        joinedAt: new Date(),
      });
      await memberRepository.create(membership);

      // Act & Assert
      await expect(useCase.execute(groupId, senderId, content)).rejects.toThrow('Message content cannot be empty');
    });

    it('should throw error if content is only whitespace', async () => {
      // Arrange
      const groupId = 'group1';
      const senderId = 'user1';
      const content = '   ';

      const membership = new GroupMember({
        id: 'member1',
        groupId,
        userId: senderId,
        role: 'member',
        status: 'active',
        joinedAt: new Date(),
      });
      await memberRepository.create(membership);

      // Act & Assert
      await expect(useCase.execute(groupId, senderId, content)).rejects.toThrow('Message content cannot be empty');
    });

    it('should throw error if user is not a member', async () => {
      // Arrange
      const groupId = 'group1';
      const senderId = 'user1';
      const content = 'Hello!';

      // Act & Assert
      await expect(useCase.execute(groupId, senderId, content)).rejects.toThrow('You are not a member of this group');
    });

    it('should throw error if user is banned', async () => {
      // Arrange
      const groupId = 'group1';
      const senderId = 'user1';
      const content = 'Hello!';

      const membership = new GroupMember({
        id: 'member1',
        groupId,
        userId: senderId,
        role: 'member',
        status: 'banned',
        joinedAt: new Date(),
      });
      await memberRepository.create(membership);

      // Act & Assert
      await expect(useCase.execute(groupId, senderId, content)).rejects.toThrow('You cannot send messages to this group');
    });

    it('should throw error if user is only invited (not active)', async () => {
      // Arrange
      const groupId = 'group1';
      const senderId = 'user1';
      const content = 'Hello!';

      const membership = new GroupMember({
        id: 'member1',
        groupId,
        userId: senderId,
        role: 'member',
        status: 'invited',
        joinedAt: new Date(),
      });
      await memberRepository.create(membership);

      // Act & Assert
      await expect(useCase.execute(groupId, senderId, content)).rejects.toThrow('You cannot send messages to this group');
    });

    it('should trim whitespace from content', async () => {
      // Arrange
      const groupId = 'group1';
      const senderId = 'user1';
      const content = '  Hello with spaces  ';

      const membership = new GroupMember({
        id: 'member1',
        groupId,
        userId: senderId,
        role: 'member',
        status: 'active',
        joinedAt: new Date(),
      });
      await memberRepository.create(membership);

      // Act
      const message = await useCase.execute(groupId, senderId, content);

      // Assert
      expect(message.content).toBe('Hello with spaces');
    });

    it('should allow owner to send messages', async () => {
      // Arrange
      const groupId = 'group1';
      const senderId = 'user1';
      const content = 'Hello from owner!';

      const membership = new GroupMember({
        id: 'member1',
        groupId,
        userId: senderId,
        role: 'owner',
        status: 'active',
        joinedAt: new Date(),
      });
      await memberRepository.create(membership);

      // Act
      const message = await useCase.execute(groupId, senderId, content);

      // Assert
      expect(message).toBeDefined();
      expect(message.senderId).toBe(senderId);
    });

    it('should allow admin to send messages', async () => {
      // Arrange
      const groupId = 'group1';
      const senderId = 'user1';
      const content = 'Hello from admin!';

      const membership = new GroupMember({
        id: 'member1',
        groupId,
        userId: senderId,
        role: 'admin',
        status: 'active',
        joinedAt: new Date(),
      });
      await memberRepository.create(membership);

      // Act
      const message = await useCase.execute(groupId, senderId, content);

      // Assert
      expect(message).toBeDefined();
      expect(message.senderId).toBe(senderId);
    });

    it('should generate unique message IDs', async () => {
      // Arrange
      const groupId = 'group1';
      const senderId = 'user1';

      const membership = new GroupMember({
        id: 'member1',
        groupId,
        userId: senderId,
        role: 'member',
        status: 'active',
        joinedAt: new Date(),
      });
      await memberRepository.create(membership);

      // Act
      const message1 = await useCase.execute(groupId, senderId, 'Message 1');
      const message2 = await useCase.execute(groupId, senderId, 'Message 2');

      // Assert
      expect(message1.id).not.toBe(message2.id);
    });
  });
});
