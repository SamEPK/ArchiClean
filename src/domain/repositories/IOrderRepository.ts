import { Order, OrderStatus, OrderType } from '../entities/Order';

export interface IOrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  findByStockId(stockId: string): Promise<Order[]>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  findPendingOrdersByStock(
    stockId: string,
    type: OrderType,
  ): Promise<Order[]>;
  update(order: Order): Promise<Order>;
  delete(id: string): Promise<void>;
}
