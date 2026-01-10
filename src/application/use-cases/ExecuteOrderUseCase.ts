import { OrderType, OrderStatus } from '@domain/entities/Order';
import { Transaction } from '@domain/entities/Transaction';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { IPortfolioRepository } from '@domain/repositories/IPortfolioRepository';
import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';
import { ITransactionRepository } from '@domain/repositories/ITransactionRepository';
import { Portfolio } from '@domain/entities/Portfolio';
import { v4 as uuidv4 } from 'uuid';

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
    private readonly bankAccountRepository: IBankAccountRepository,
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(request: ExecuteOrderRequest): Promise<ExecuteOrderResponse> {
    const order = await this.orderRepository.findById(request.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Order is not in pending status');
    }

    if (!order.accountId) {
      throw new Error('Order has no settlement account');
    }

    order.execute();
    await this.orderRepository.update(order);

    if (order.type === OrderType.SELL) {
      await this.creditSellProceeds(
        order.accountId,
        order.stockId,
        order.quantity,
        request.executionPrice,
      );
    }

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

  private async creditSellProceeds(
    accountId: string,
    stockId: string,
    quantity: number,
    executionPrice: number,
  ): Promise<void> {
    const account = await this.bankAccountRepository.findById(accountId);
    if (!account) {
      throw new Error('Settlement account not found');
    }
    if (!account.isActive) {
      throw new Error('Settlement account is not active');
    }

    const gross = quantity * executionPrice;
    const fee = 1;
    const net = gross - fee;
    if (net <= 0) {
      throw new Error('Net proceeds must be positive');
    }

    account.deposit(net);
    await this.bankAccountRepository.update(account);

    const tx = Transaction.createDeposit(
      uuidv4(),
      account.id,
      net,
      `Order SELL proceeds for stock ${stockId}`,
    ).markAsCompleted();
    await this.transactionRepository.save(tx);
  }
}
