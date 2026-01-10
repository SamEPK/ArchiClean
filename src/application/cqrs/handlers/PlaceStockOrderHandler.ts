import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlaceStockOrderCommand } from '../commands/PlaceStockOrderCommand';
import { PlaceStockOrderUseCase } from '@application/use-cases/PlaceStockOrderUseCase';
import { DomainEvent, EVENT_STORE } from '@domain/events/DomainEvent';
import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';

@CommandHandler(PlaceStockOrderCommand)
export class PlaceStockOrderHandler implements ICommandHandler<PlaceStockOrderCommand> {
  constructor(
    private readonly placeStockOrderUseCase: PlaceStockOrderUseCase,
    @Inject(EVENT_STORE) private readonly eventStore: { append(event: DomainEvent): Promise<void>; load(streamId: string): Promise<DomainEvent[]> }
  ) {}

  async execute(command: PlaceStockOrderCommand): Promise<any> {
    const order = await this.placeStockOrderUseCase.execute({
      userId: command.userId,
      stockId: command.stockId,
      type: command.type,
      quantity: command.quantity,
      price: command.price,
      accountId: command.accountId,
    });

    const event: DomainEvent = {
      id: uuidv4(),
      streamId: `order-${order.id}`,
      version: 1,
      type: 'OrderPlaced',
      occurredAt: new Date(),
      data: {
        orderId: order.id,
        userId: order.userId,
        stockId: order.stockId,
        type: order.type,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        accountId: order.accountId,
      },
    };
    await this.eventStore.append(event);

    return order;
  }
}
