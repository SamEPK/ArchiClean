import { GroupMessage } from '@domain/entities/GroupMessage';
import { IGroupMessageRepository } from '@domain/repositories/IGroupMessageRepository';
import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';

export class SendGroupMessageUseCase {
  constructor(
    private groupMessageRepository: IGroupMessageRepository,
    private groupMemberRepository: IGroupMemberRepository
  ) {}

  async execute(groupId: string, senderId: string, content: string): Promise<GroupMessage> {
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    // Verify sender is an active member
    const membership = await this.groupMemberRepository.findByGroupAndUser(groupId, senderId);
    if (!membership) {
      throw new Error('You are not a member of this group');
    }

    if (!membership.isActive()) {
      throw new Error('You cannot send messages to this group');
    }

    const message = new GroupMessage({
      id: this.generateId(),
      groupId,
      senderId,
      content: content.trim(),
      createdAt: new Date(),
    });

    await this.groupMessageRepository.create(message);

    return message;
  }

  private generateId(): string {
    return `group_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
