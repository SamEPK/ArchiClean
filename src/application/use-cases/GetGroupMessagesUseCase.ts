import { GroupMessage } from '@domain/entities/GroupMessage';
import { IGroupMessageRepository } from '@domain/repositories/IGroupMessageRepository';
import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';

export class GetGroupMessagesUseCase {
  constructor(
    private groupMessageRepository: IGroupMessageRepository,
    private groupMemberRepository: IGroupMemberRepository
  ) {}

  async execute(groupId: string, userId: string, limit: number = 100): Promise<GroupMessage[]> {
    if (!groupId || !userId) {
      throw new Error('Group ID and user ID are required');
    }

    const membership = await this.groupMemberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || !membership.isActive()) {
      throw new Error('You must be an active member to view group messages');
    }

    const messages = await this.groupMessageRepository.findByGroupId(groupId, limit);
    return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}
