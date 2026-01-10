import { IPrivateMessageRepository } from '@domain/repositories/IPrivateMessageRepository';

export class GetUnreadMessagesCountUseCase {
  constructor(private privateMessageRepository: IPrivateMessageRepository) {}

  async execute(userId: string): Promise<number> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.privateMessageRepository.countUnreadMessages(userId);
  }
}
