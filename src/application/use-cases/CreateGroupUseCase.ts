import { Group, GroupVisibility } from '@domain/entities/Group';
import { GroupMember } from '@domain/entities/GroupMember';
import { IGroupRepository } from '@domain/repositories/IGroupRepository';
import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';

export class CreateGroupUseCase {
  constructor(
    private groupRepository: IGroupRepository,
    private groupMemberRepository: IGroupMemberRepository
  ) {}

  async execute(
    creatorId: string,
    name: string,
    description: string,
    visibility: GroupVisibility
  ): Promise<Group> {
    if (!name || name.trim().length === 0) {
      throw new Error('Group name is required');
    }

    const existingGroup = await this.groupRepository.findByName(name);
    if (existingGroup) {
      throw new Error('A group with this name already exists');
    }

    const group = new Group({
      id: this.generateId(),
      name: name.trim(),
      description: description?.trim(),
      creatorId,
      visibility,
      createdAt: new Date(),
    });

    await this.groupRepository.create(group);

    // Add creator as owner
    const creatorMember = new GroupMember({
      id: this.generateId(),
      groupId: group.id,
      userId: creatorId,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
    });
    await this.groupMemberRepository.create(creatorMember);
    return group;
  }
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
