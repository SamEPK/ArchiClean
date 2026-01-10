import { OrderType } from '@domain/entities/Order';

export class PlaceStockOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly stockId: string,
    public readonly type: OrderType,
    public readonly quantity: number,
    public readonly price: number,
    public readonly accountId: string,
  ) {}
}
