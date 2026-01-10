import { GroupMember } from '@domain/entities/GroupMember';
import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';

export class PromoteMemberUseCase {
  constructor(private groupMemberRepository: IGroupMemberRepository) {}

  async execute(groupId: string, requesterId: string, memberId: string): Promise<GroupMember> {
    if (!groupId || !requesterId || !memberId) {
      throw new Error('Group ID, requester ID and member ID are required');
    }

    const requester = await this.groupMemberRepository.findByGroupAndUser(groupId, requesterId);
    if (!requester || !requester.isOwner()) {
      throw new Error('Only the group owner can promote members');
    }

    const member = await this.groupMemberRepository.findByGroupAndUser(groupId, memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    if (member.isOwner()) {
      throw new Error('Owner cannot be promoted');
    }

    member.promoteToAdmin();
    await this.groupMemberRepository.update(member);
    return member;
  }
}
