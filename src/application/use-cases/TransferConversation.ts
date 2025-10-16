import { IMessageRepository } from '../../domain/repositories/IMessageRepository';

export class TransferConversation {
  constructor(private messageRepo: IMessageRepository) {}

  async execute(convId: string, fromAdvisorId: string, toAdvisorId: string): Promise<void> {
    await this.messageRepo.transferConversation(convId, fromAdvisorId, toAdvisorId);
  }
}
