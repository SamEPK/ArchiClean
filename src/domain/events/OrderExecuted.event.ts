import { DomainEvent } from './DomainEvent';

export interface OrderExecutedData {
  orderId: string;
  userId: string;
  stockId: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  executedPrice: number;
  totalAmount: number;
  status: string;
  accountId: string;
  executedAt: Date;
}

export type OrderExecutedEvent = DomainEvent<OrderExecutedData>;

export function createOrderExecutedEvent(
  orderId: string,
  data: OrderExecutedData
): OrderExecutedEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    streamId: `order-${orderId}`,
    version: 2,
    type: 'OrderExecuted',
    occurredAt: new Date(),
    data,
  };
}
