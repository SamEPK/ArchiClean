import { ExecuteOrderUseCase } from '../ExecuteOrderUseCase';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/InMemoryOrderRepository';
import { InMemoryPortfolioRepository } from '@infrastructure/repositories/in-memory/InMemoryPortfolioRepository';
import { Order, OrderType, OrderStatus } from '@domain/entities/Order';

describe('ExecuteOrderUseCase', () => {
  let useCase: ExecuteOrderUseCase;
  let orderRepository: InMemoryOrderRepository;
  let portfolioRepository: InMemoryPortfolioRepository;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    portfolioRepository = new InMemoryPortfolioRepository();
    useCase = new ExecuteOrderUseCase(orderRepository, portfolioRepository);
  });

  afterEach(() => {
    orderRepository.clear();
    portfolioRepository.clear();
  });

  it('should execute a buy order and update portfolio', async () => {
    const order = new Order(
      'ord_1',
      'user_1',
      'stk_1',
      OrderType.BUY,
      10,
      150,
      OrderStatus.PENDING,
    );
    await orderRepository.save(order);

    const result = await useCase.execute({
      orderId: 'ord_1',
      executionPrice: 150,
    });

    expect(result.executed).toBe(true);
    expect(result.orderId).toBe('ord_1');

    const portfolio = await portfolioRepository.findByUserIdAndStockId(
      'user_1',
      'stk_1',
    );
    expect(portfolio).toBeDefined();
    expect(portfolio?.quantity).toBe(10);
  });

  it('should execute a sell order and update portfolio', async () => {
    const order = new Order(
      'ord_1',
      'user_1',
      'stk_1',
      OrderType.SELL,
      5,
      150,
      OrderStatus.PENDING,
    );
    await orderRepository.save(order);

    const result = await useCase.execute({
      orderId: 'ord_1',
      executionPrice: 150,
    });

    expect(result.executed).toBe(true);
  });

  it('should throw error if order not found', async () => {
    await expect(
      useCase.execute({
        orderId: 'ord_999',
        executionPrice: 150,
      }),
    ).rejects.toThrow('Order not found');
  });

  it('should throw error if order is not pending', async () => {
    const order = new Order(
      'ord_1',
      'user_1',
      'stk_1',
      OrderType.BUY,
      10,
      150,
      OrderStatus.EXECUTED,
    );
    await orderRepository.save(order);

    await expect(
      useCase.execute({
        orderId: 'ord_1',
        executionPrice: 150,
      }),
    ).rejects.toThrow('Order is not in pending status');
  });
});
