import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GrantCreditCommand } from '../commands/GrantCreditCommand';
import { GrantCredit } from '@application/use-cases/GrantCredit';
import { Credit } from '@domain/entities/Credit';
import { DomainEvent, EVENT_STORE } from '@domain/events/DomainEvent';
import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';

@CommandHandler(GrantCreditCommand)
export class GrantCreditHandler implements ICommandHandler<GrantCreditCommand> {
  constructor(
    private readonly grantCredit: GrantCredit,
    @Inject(EVENT_STORE) private readonly eventStore: { append(event: DomainEvent): Promise<void>; load(streamId: string): Promise<DomainEvent[]> }
  ) {}

  async execute(command: GrantCreditCommand): Promise<any> {
    const credit = new Credit({
      id: uuidv4(),
      userId: command.clientId,
      amount: command.amount,
      annualRate: command.annualRate,
      insuranceRate: command.insuranceRate,
    });

    await this.grantCredit.execute(credit, command.durationMonths);

    const event: DomainEvent = {
      id: uuidv4(),
      streamId: `credit-${credit.id}`,
      version: (await this.eventStore.load(`credit-${credit.id}`)).length,
      type: 'CreditGranted',
      occurredAt: new Date(),
      data: {
        creditId: credit.id,
        clientId: credit.userId,
        amount: credit.amount,
        annualRate: credit.annualRate,
        insuranceRate: credit.insuranceRate,
        monthlyPayment: credit.monthlyPayment,
        durationMonths: command.durationMonths,
      },
    };
    await this.eventStore.append(event);

    return credit;
  }
}
