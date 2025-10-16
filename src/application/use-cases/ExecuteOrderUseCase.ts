import { OrderType, OrderStatus } from '@domain/entities/Order';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { IPortfolioRepository } from '@domain/repositories/IPortfolioRepository';
import { Portfolio } from '@domain/entities/Portfolio';

export interface ExecuteOrderRequest {
  orderId: string;
  executionPrice: number;
}

export interface ExecuteOrderResponse {
  orderId: string;
  executed: boolean;
  message: string;
}

export class ExecuteOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly portfolioRepository: IPortfolioRepository,
  ) {}

  async execute(request: ExecuteOrderRequest): Promise<ExecuteOrderResponse> {
    const order = await this.orderRepository.findById(request.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Order is not in pending status');
    }

    order.execute();
    await this.orderRepository.update(order);

    await this.updatePortfolio(
      order.userId,
      order.stockId,
      order.type,
      order.quantity,
      request.executionPrice,
    );

    return {
      orderId: order.id,
      executed: true,
      message: `Order executed successfully at price ${request.executionPrice}`,
    };
  }

  private async updatePortfolio(
    userId: string,
    stockId: string,
    type: OrderType,
    quantity: number,
    price: number,
  ): Promise<void> {
    let portfolio = await this.portfolioRepository.findByUserIdAndStockId(
      userId,
      stockId,
    );

    const existed = !!portfolio;

    if (!portfolio) {
      portfolio = new Portfolio(userId, stockId, 0, 0);
    }

    if (type === OrderType.BUY) {
      portfolio.addStocks(quantity, price);
    } else {
      // If portfolio did not exist, there's nothing to remove -> ignore
      if (!existed) {
        return;
      }
      portfolio.removeStocks(quantity);
    }

    if (portfolio.isEmpty()) {
      await this.portfolioRepository.delete(userId, stockId);
    } else {
      await this.portfolioRepository.save(portfolio);
    }
  }
}
