import { Order, OrderType, OrderStatus } from '../Order';

describe('Order entity', () => {
  it('executes a pending order', () => {
    const o = new Order('o1', 'u1', 's1', OrderType.BUY, 1, 100, OrderStatus.PENDING);
    o.execute(new Date('2020-01-01'));
    expect(o.status).toBe(OrderStatus.EXECUTED);
    expect(o.executedAt).toBeDefined();
  });

  it('cancels a pending order', () => {
    const o = new Order('o2', 'u1', 's1', OrderType.BUY, 1, 100, OrderStatus.PENDING);
    o.cancel();
    expect(o.status).toBe(OrderStatus.CANCELLED);
  });

  it('calculates total cost with fee', () => {
    const o = new Order('o3', 'u1', 's1', OrderType.BUY, 2, 50, OrderStatus.PENDING);
    expect(o.getTotalCost()).toBe(2 * 50 + 1);
  });
});
