import { IMessageRepository } from '../../domain/repositories/IMessageRepository';

export class AssignConversation {
  constructor(private messageRepo: IMessageRepository) {}

  async execute(convId: string, advisorId: string): Promise<void> {
    await this.messageRepo.assignConversation(convId, advisorId);
  }
}
