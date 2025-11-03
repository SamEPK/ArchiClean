import { CreateGroupUseCase } from '../CreateGroupUseCase';
import { InMemoryGroupRepository } from '@infrastructure/repositories/in-memory/InMemoryGroupRepository';
import { InMemoryGroupMemberRepository } from '@infrastructure/repositories/in-memory/InMemoryGroupMemberRepository';
import { GroupVisibility } from '@domain/entities/Group';

describe('CreateGroupUseCase', () => {
  let useCase: CreateGroupUseCase;
  let groupRepository: InMemoryGroupRepository;
  let memberRepository: InMemoryGroupMemberRepository;

  beforeEach(() => {
    groupRepository = new InMemoryGroupRepository();
    memberRepository = new InMemoryGroupMemberRepository();
    useCase = new CreateGroupUseCase(groupRepository, memberRepository);
  });

  describe('execute', () => {
    it('should create a public group', async () => {
      // Arrange
      const creatorId = 'user1';
      const name = 'Public Group';
      const description = 'This is a public group';
      const visibility: GroupVisibility = 'public';

      // Act
      const group = await useCase.execute(creatorId, name, description, visibility);

      // Assert
      expect(group).toBeDefined();
      expect(group.name).toBe(name);
      expect(group.description).toBe(description);
      expect(group.visibility).toBe(visibility);
      expect(group.creatorId).toBe(creatorId);
      expect(group.createdAt).toBeInstanceOf(Date);

      const savedGroup = await groupRepository.findById(group.id);
      expect(savedGroup).toBeDefined();
    });

    it('should create a private group', async () => {
      // Arrange
      const creatorId = 'user1';
      const name = 'Private Group';
      const description = 'This is a private group';
      const visibility: GroupVisibility = 'private';

      // Act
      const group = await useCase.execute(creatorId, name, description, visibility);

      // Assert
      expect(group.visibility).toBe('private');
      expect(group.isPrivate()).toBe(true);
      expect(group.isPublic()).toBe(false);
    });

    it('should add creator as owner in the group', async () => {
      // Arrange
      const creatorId = 'user1';
      const name = 'Test Group';
      const description = 'Test description';
      const visibility: GroupVisibility = 'public';

      // Act
      const group = await useCase.execute(creatorId, name, description, visibility);

      // Assert
      const membership = await memberRepository.findByGroupAndUser(group.id, creatorId);
      expect(membership).toBeDefined();
      expect(membership?.userId).toBe(creatorId);
      expect(membership?.role).toBe('owner');
      expect(membership?.status).toBe('active');
      expect(membership?.isOwner()).toBe(true);
    });

    it('should throw error if group name is empty', async () => {
      // Arrange
      const creatorId = 'user1';
      const name = '';
      const description = 'Test description';
      const visibility: GroupVisibility = 'public';

      // Act & Assert
      await expect(useCase.execute(creatorId, name, description, visibility)).rejects.toThrow('Group name is required');
    });

    it('should throw error if group name is only whitespace', async () => {
      // Arrange
      const creatorId = 'user1';
      const name = '   ';
      const description = 'Test description';
      const visibility: GroupVisibility = 'public';

      // Act & Assert
      await expect(useCase.execute(creatorId, name, description, visibility)).rejects.toThrow('Group name is required');
    });

    it('should trim whitespace from name and description', async () => {
      // Arrange
      const creatorId = 'user1';
      const name = '  Test Group  ';
      const description = '  Test description  ';
      const visibility: GroupVisibility = 'public';

      // Act
      const group = await useCase.execute(creatorId, name, description, visibility);

      // Assert
      expect(group.name).toBe('Test Group');
      expect(group.description).toBe('Test description');
    });

    it('should generate unique group IDs', async () => {
      // Arrange
      const creatorId = 'user1';
      const visibility: GroupVisibility = 'public';

      // Act
      const group1 = await useCase.execute(creatorId, 'Group 1', 'Description 1', visibility);
      const group2 = await useCase.execute(creatorId, 'Group 2', 'Description 2', visibility);

      // Assert
      expect(group1.id).not.toBe(group2.id);
    });

    it('should allow empty description', async () => {
      // Arrange
      const creatorId = 'user1';
      const name = 'Test Group';
      const description = '';
      const visibility: GroupVisibility = 'public';

      // Act
      const group = await useCase.execute(creatorId, name, description, visibility);

      // Assert
      expect(group).toBeDefined();
      expect(group.description).toBe('');
    });

    it('should create membership with unique ID', async () => {
      // Arrange
      const creatorId = 'user1';
      const name = 'Test Group';
      const description = 'Test description';
      const visibility: GroupVisibility = 'public';

      // Act
      const group = await useCase.execute(creatorId, name, description, visibility);

      // Assert
      const membership = await memberRepository.findByGroupAndUser(group.id, creatorId);
      expect(membership?.id).toBeDefined();
      expect(membership?.id).toBeTruthy();
    });

    it('should allow same user to create multiple groups', async () => {
      // Arrange
      const creatorId = 'user1';
      const visibility: GroupVisibility = 'public';

      // Act
      const group1 = await useCase.execute(creatorId, 'Group 1', 'Description 1', visibility);
      const group2 = await useCase.execute(creatorId, 'Group 2', 'Description 2', visibility);

      // Assert
      expect(group1.id).not.toBe(group2.id);
      expect(group1.creatorId).toBe(creatorId);
      expect(group2.creatorId).toBe(creatorId);

      const membership1 = await memberRepository.findByGroupAndUser(group1.id, creatorId);
      const membership2 = await memberRepository.findByGroupAndUser(group2.id, creatorId);
      expect(membership1).toBeDefined();
      expect(membership2).toBeDefined();
    });
  });
});
