export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED',
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly stockId: string,
    public readonly type: OrderType,
    public readonly quantity: number,
    public readonly price: number,
    public status: OrderStatus,
    public readonly createdAt: Date = new Date(),
    public executedAt?: Date,
  ) {
    this.validateQuantity();
    this.validatePrice();
  }

  private validateQuantity(): void {
    if (this.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (!Number.isInteger(this.quantity)) {
      throw new Error('Quantity must be an integer');
    }
  }

  private validatePrice(): void {
    if (this.price <= 0) {
      throw new Error('Price must be greater than 0');
    }
  }

  public execute(executionDate: Date = new Date()): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be executed');
    }
    this.status = OrderStatus.EXECUTED;
    this.executedAt = executionDate;
  }

  public cancel(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be cancelled');
    }
    this.status = OrderStatus.CANCELLED;
  }

  public getTotalCost(): number {
    const transactionFee = 1;
    return this.quantity * this.price + transactionFee;
  }
}
