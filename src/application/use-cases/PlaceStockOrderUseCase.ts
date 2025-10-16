import { Order, OrderType, OrderStatus } from '@domain/entities/Order';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { IStockRepository } from '@domain/repositories/IStockRepository';

export interface PlaceStockOrderRequest {
  userId: string;
  stockId: string;
  type: OrderType;
  quantity: number;
  price: number;
}

export class PlaceStockOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly stockRepository: IStockRepository,
  ) {}

  async execute(request: PlaceStockOrderRequest): Promise<Order> {
    const stock = await this.stockRepository.findById(request.stockId);

    if (!stock) {
      throw new Error('Stock not found');
    }

    if (!stock.isAvailable) {
      throw new Error('Stock is not available for trading');
    }

    const order = new Order(
      this.generateId(),
      request.userId,
      request.stockId,
      request.type,
      request.quantity,
      request.price,
      OrderStatus.PENDING,
    );

    return await this.orderRepository.save(order);
  }

  private generateId(): string {
    return `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
