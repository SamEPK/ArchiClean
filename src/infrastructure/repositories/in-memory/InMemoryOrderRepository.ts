import { Order, OrderStatus, OrderType } from '@domain/entities/Order';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';

export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, Order> = new Map();

  async save(order: Order): Promise<Order> {
    this.orders.set(order.id, order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const orders = Array.from(this.orders.values());
    return orders.filter((o) => o.userId === userId);
  }

  async findByStockId(stockId: string): Promise<Order[]> {
    const orders = Array.from(this.orders.values());
    return orders.filter((o) => o.stockId === stockId);
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const orders = Array.from(this.orders.values());
    return orders.filter((o) => o.status === status);
  }

  async findPendingOrdersByStock(
    stockId: string,
    type: OrderType,
  ): Promise<Order[]> {
    const orders = Array.from(this.orders.values());
    return orders.filter(
      (o) =>
        o.stockId === stockId &&
        o.type === type &&
        o.status === OrderStatus.PENDING,
    );
  }

  async update(order: Order): Promise<Order> {
    if (!this.orders.has(order.id)) {
      throw new Error('Order not found');
    }
    this.orders.set(order.id, order);
    return order;
  }

  async delete(id: string): Promise<void> {
    this.orders.delete(id);
  }

  clear(): void {
    this.orders.clear();
  }
}
