import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignConversationCommand } from '../commands/AssignConversationCommand';
import { AssignConversation } from '@application/use-cases/AssignConversation';
import { DomainEvent, EVENT_STORE } from '@domain/events/DomainEvent';
import { uuidv4 } from '@infrastructure/utils/uuid-helper';
import { Inject } from '@nestjs/common';

@CommandHandler(AssignConversationCommand)
export class AssignConversationHandler implements ICommandHandler<AssignConversationCommand> {
  constructor(
    private readonly assignConversation: AssignConversation,
    @Inject(EVENT_STORE) private readonly eventStore: { append(event: DomainEvent): Promise<void>; load(streamId: string): Promise<DomainEvent[]> }
  ) {}

  async execute(command: AssignConversationCommand): Promise<void> {
    await this.assignConversation.execute(command.conversationId, command.advisorId);

    const streamId = `conversation-${command.conversationId}`;
    const version = (await this.eventStore.load(streamId)).length;
    const event: DomainEvent = {
      id: uuidv4(),
      streamId,
      version,
      type: 'ConversationAssigned',
      occurredAt: new Date(),
      data: {
        conversationId: command.conversationId,
        advisorId: command.advisorId,
      },
    };
    await this.eventStore.append(event);
  }
}
