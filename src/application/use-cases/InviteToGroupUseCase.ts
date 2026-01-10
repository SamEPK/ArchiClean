import { GroupMember } from '@domain/entities/GroupMember';
import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';
import { IGroupRepository } from '@domain/repositories/IGroupRepository';

export class InviteToGroupUseCase {
  constructor(
    private groupRepository: IGroupRepository,
    private groupMemberRepository: IGroupMemberRepository
  ) {}

  async execute(groupId: string, inviterId: string, inviteeId: string): Promise<GroupMember> {
    if (!groupId || !inviterId || !inviteeId) {
      throw new Error('Group ID, inviter ID and invitee ID are required');
    }

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const inviterMembership = await this.groupMemberRepository.findByGroupAndUser(groupId, inviterId);
    if (!inviterMembership || !inviterMembership.isAdmin()) {
      throw new Error('Only admins can invite members');
    }

    const existing = await this.groupMemberRepository.findByGroupAndUser(groupId, inviteeId);
    if (existing) {
      if (existing.isBanned()) {
        throw new Error('User is banned from this group');
      }
      if (existing.isActive() || existing.isInvited()) {
        return existing;
      }
    }

    const invite = new GroupMember({
      id: this.generateId(),
      groupId,
      userId: inviteeId,
      role: 'member',
      status: 'invited',
      joinedAt: new Date(),
    });

    await this.groupMemberRepository.create(invite);
    return invite;
  }

  private generateId(): string {
    return `group_member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
