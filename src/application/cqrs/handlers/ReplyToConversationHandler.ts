import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReplyToConversationCommand } from '../commands/ReplyToConversationCommand';
import { SendMessage } from '@application/use-cases/SendMessage';
import { DomainEvent, EVENT_STORE } from '@domain/events/DomainEvent';
import { uuidv4 } from '@infrastructure/utils/uuid-helper';
import { Inject } from '@nestjs/common';

@CommandHandler(ReplyToConversationCommand)
export class ReplyToConversationHandler implements ICommandHandler<ReplyToConversationCommand> {
  constructor(
    private readonly sendMessage: SendMessage,
    @Inject(EVENT_STORE) private readonly eventStore: { append(event: DomainEvent): Promise<void>; load(streamId: string): Promise<DomainEvent[]> }
  ) {}

  async execute(command: ReplyToConversationCommand): Promise<void> {
    await this.sendMessage.execute({
      conversationId: command.conversationId,
      senderId: command.advisorId,
      content: command.content,
      senderRole: 'advisor',
    });

    const streamId = `conversation-${command.conversationId}`;
    const version = (await this.eventStore.load(streamId)).length;
    const event: DomainEvent = {
      id: uuidv4(),
      streamId,
      version,
      type: 'AdvisorReplied',
      occurredAt: new Date(),
      data: {
        conversationId: command.conversationId,
        advisorId: command.advisorId,
        content: command.content,
      },
    };
    await this.eventStore.append(event);
  }
}
