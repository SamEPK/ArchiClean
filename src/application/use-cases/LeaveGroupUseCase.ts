import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';

export class LeaveGroupUseCase {
  constructor(private groupMemberRepository: IGroupMemberRepository) {}

  async execute(groupId: string, userId: string): Promise<void> {
    if (!groupId || !userId) {
      throw new Error('Group ID and user ID are required');
    }

    const membership = await this.groupMemberRepository.findByGroupAndUser(groupId, userId);
    if (!membership) {
      throw new Error('You are not a member of this group');
    }

    if (membership.isOwner()) {
      throw new Error('Group owner cannot leave the group');
    }

    await this.groupMemberRepository.delete(membership.id);
  }
}
