import { GroupMember } from '@domain/entities/GroupMember';
import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';
import { IGroupRepository } from '@domain/repositories/IGroupRepository';

export class JoinGroupUseCase {
  constructor(
    private groupRepository: IGroupRepository,
    private groupMemberRepository: IGroupMemberRepository
  ) {}

  async execute(groupId: string, userId: string): Promise<GroupMember> {
    if (!groupId || !userId) {
      throw new Error('Group ID and user ID are required');
    }

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const existing = await this.groupMemberRepository.findByGroupAndUser(groupId, userId);
    if (existing) {
      if (existing.isBanned()) {
        throw new Error('You are banned from this group');
      }
      if (existing.isActive()) {
        return existing;
      }
      if (existing.isInvited()) {
        existing.acceptInvitation();
        await this.groupMemberRepository.update(existing);
        return existing;
      }
    }

    if (group.isPrivate()) {
      throw new Error('Invitation required to join this private group');
    }

    const member = new GroupMember({
      id: this.generateId(),
      groupId,
      userId,
      role: 'member',
      status: 'active',
      joinedAt: new Date(),
    });

    await this.groupMemberRepository.create(member);
    return member;
  }

  private generateId(): string {
    return `group_member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
