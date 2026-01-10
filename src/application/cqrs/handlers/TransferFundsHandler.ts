import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferFundsCommand } from '../commands/TransferFundsCommand';
import { TransferFundsUseCase } from '@application/use-cases/TransferFundsUseCase';
import { DomainEvent, EVENT_STORE } from '@domain/events/DomainEvent';
import { uuidv4 } from '@infrastructure/utils/uuid-helper';
import { Inject } from '@nestjs/common';

@CommandHandler(TransferFundsCommand)
export class TransferFundsHandler implements ICommandHandler<TransferFundsCommand> {
  constructor(
    private readonly transferFundsUseCase: TransferFundsUseCase,
    @Inject(EVENT_STORE) private readonly eventStore: { append(event: DomainEvent): Promise<void>; load(streamId: string): Promise<DomainEvent[]> }
  ) {}

  async execute(command: TransferFundsCommand): Promise<any> {
    const transaction = await this.transferFundsUseCase.execute(
      command.fromAccountId,
      command.toAccountId,
      command.amount,
      command.description || 'Virement'
    );

    const event: DomainEvent = {
      id: uuidv4(),
      streamId: `transfer-${transaction.id}`,
      version: 1,
      type: 'FundsTransferred',
      occurredAt: new Date(),
      data: {
        transactionId: transaction.id,
        fromAccountId: command.fromAccountId,
        toAccountId: command.toAccountId,
        amount: command.amount,
        description: command.description,
        status: transaction.status,
      },
    };
    await this.eventStore.append(event);

    return transaction;
  }
}
