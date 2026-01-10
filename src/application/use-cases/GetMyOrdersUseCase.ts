import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { IStockRepository } from '@domain/repositories/IStockRepository';

export interface GetMyOrdersRequest {
  userId: string;
}

export interface OrderListItem {
  id: string;
  stockId: string;
  stockSymbol: string;
  stockName: string;
  orderType: string;
  quantity: number;
  price: number;
  status: string;
  createdAt: Date;
  executedAt?: Date;
}

export interface GetMyOrdersResponse {
  userId: string;
  orders: OrderListItem[];
  totalOrders: number;
  pendingOrders: number;
  executedOrders: number;
}

export class GetMyOrdersUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly stockRepository: IStockRepository,
  ) {}

  async execute(request: GetMyOrdersRequest): Promise<GetMyOrdersResponse> {
    const orders = await this.orderRepository.findByUserId(request.userId);

    const orderItems: OrderListItem[] = [];
    let pendingCount = 0;
    let executedCount = 0;

    for (const order of orders) {
      const stock = await this.stockRepository.findById(order.stockId);

      const item: OrderListItem = {
        id: order.id,
        stockId: order.stockId,
        stockSymbol: stock?.symbol || 'UNKNOWN',
        stockName: stock?.name || 'Unknown Stock',
        orderType: order.type,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        createdAt: order.createdAt,
        executedAt: order.executedAt,
      };

      orderItems.push(item);

      if (order.status === 'PENDING') {
        pendingCount++;
      } else if (order.status === 'EXECUTED') {
        executedCount++;
      }
    }

    // Sort by created date, most recent first
    orderItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      userId: request.userId,
      orders: orderItems,
      totalOrders: orders.length,
      pendingOrders: pendingCount,
      executedOrders: executedCount,
    };
  }
}
