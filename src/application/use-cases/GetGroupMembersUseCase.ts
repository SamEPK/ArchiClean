import { GroupMember } from '@domain/entities/GroupMember';
import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';
import { IGroupRepository } from '@domain/repositories/IGroupRepository';

export class GetGroupMembersUseCase {
  constructor(
    private groupMemberRepository: IGroupMemberRepository,
    private groupRepository: IGroupRepository
  ) {}

  async execute(groupId: string, requesterId: string): Promise<GroupMember[]> {
    if (!groupId || !requesterId) {
      throw new Error('Group ID and requester ID are required');
    }

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const membership = await this.groupMemberRepository.findByGroupAndUser(groupId, requesterId);
    if (group.isPrivate() && (!membership || !membership.isActive())) {
      throw new Error('You must be a member to view members of this private group');
    }

    return this.groupMemberRepository.findGroupMembers(groupId);
  }
}
