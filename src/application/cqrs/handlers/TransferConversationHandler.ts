import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferConversationCommand } from '../commands/TransferConversationCommand';
import { TransferConversation } from '@application/use-cases/TransferConversation';
import { DomainEvent, EVENT_STORE } from '@domain/events/DomainEvent';
import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';

@CommandHandler(TransferConversationCommand)
export class TransferConversationHandler implements ICommandHandler<TransferConversationCommand> {
  constructor(
    private readonly transferConversation: TransferConversation,
    @Inject(EVENT_STORE) private readonly eventStore: { append(event: DomainEvent): Promise<void>; load(streamId: string): Promise<DomainEvent[]> }
  ) {}

  async execute(command: TransferConversationCommand): Promise<void> {
    await this.transferConversation.execute(command.conversationId, command.fromAdvisorId, command.toAdvisorId);

    const streamId = `conversation-${command.conversationId}`;
    const version = (await this.eventStore.load(streamId)).length;
    const event: DomainEvent = {
      id: uuidv4(),
      streamId,
      version,
      type: 'ConversationTransferred',
      occurredAt: new Date(),
      data: {
        conversationId: command.conversationId,
        fromAdvisorId: command.fromAdvisorId,
        toAdvisorId: command.toAdvisorId,
      },
    };
    await this.eventStore.append(event);
  }
}
