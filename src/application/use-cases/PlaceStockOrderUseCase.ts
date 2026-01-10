import { Order, OrderType, OrderStatus } from '@domain/entities/Order';
import { Transaction } from '@domain/entities/Transaction';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { IStockRepository } from '@domain/repositories/IStockRepository';
import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';
import { ITransactionRepository } from '@domain/repositories/ITransactionRepository';
import { v4 as uuidv4 } from 'uuid';

export interface PlaceStockOrderRequest {
  userId: string;
  stockId: string;
  type: OrderType;
  quantity: number;
  price: number;
  accountId: string;
}

export class PlaceStockOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly stockRepository: IStockRepository,
    private readonly bankAccountRepository: IBankAccountRepository,
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(request: PlaceStockOrderRequest): Promise<Order> {
    const stock = await this.stockRepository.findById(request.stockId);

    if (!stock) {
      throw new Error('Stock not found');
    }

    if (!stock.isAvailable) {
      throw new Error('Stock is not available for trading');
    }

    // Vérification des fonds et débit immédiat pour un ordre d'achat (frais de 1€)
    if (request.type === OrderType.BUY) {
      const account = await this.bankAccountRepository.findById(
        request.accountId,
      );
      if (!account) {
        throw new Error('Funding account not found');
      }
      if (!account.isActive) {
        throw new Error('Funding account is not active');
      }

      const totalCost = request.quantity * request.price + 1; // 1€ de frais à l'achat
      if (account.balance < totalCost) {
        throw new Error('Insufficient funds for this order');
      }

      account.withdraw(totalCost);
      await this.bankAccountRepository.update(account);

      const reservationTx = Transaction.createWithdrawal(
        uuidv4(),
        account.id,
        totalCost,
        `Order BUY reservation for stock ${request.stockId}`,
      ).markAsCompleted();
      await this.transactionRepository.save(reservationTx);
    }

    const order = new Order(
      this.generateId(),
      request.userId,
      request.stockId,
      request.type,
      request.quantity,
      request.price,
      OrderStatus.PENDING,
      new Date(),
      undefined,
      request.accountId,
    );

    return await this.orderRepository.save(order);
  }

  private generateId(): string {
    return `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
