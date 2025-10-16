import { CalculateStockPriceUseCase } from '../CalculateStockPriceUseCase';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/InMemoryOrderRepository';
import { Order, OrderType, OrderStatus } from '@domain/entities/Order';

describe('CalculateStockPriceUseCase', () => {
  let useCase: CalculateStockPriceUseCase;
  let repository: InMemoryOrderRepository;

  beforeEach(() => {
    repository = new InMemoryOrderRepository();
    useCase = new CalculateStockPriceUseCase(repository);
  });

  afterEach(() => {
    repository.clear();
  });

  it('should calculate equilibrium price with matching orders', async () => {
    const buyOrder = new Order(
      'ord_1',
      'user_1',
      'stk_1',
      OrderType.BUY,
      10,
      150,
      OrderStatus.PENDING,
    );
    const sellOrder = new Order(
      'ord_2',
      'user_2',
      'stk_1',
      OrderType.SELL,
      10,
      145,
      OrderStatus.PENDING,
    );

    await repository.save(buyOrder);
    await repository.save(sellOrder);

    const result = await useCase.execute({ stockId: 'stk_1' });

    expect(result.equilibriumPrice).toBe(147.5);
    expect(result.matchableVolume).toBe(10);
    expect(result.buyOrders).toBe(1);
    expect(result.sellOrders).toBe(1);
  });

  it('should return null price when no matching orders', async () => {
    const buyOrder = new Order(
      'ord_1',
      'user_1',
      'stk_1',
      OrderType.BUY,
      10,
      100,
      OrderStatus.PENDING,
    );
    const sellOrder = new Order(
      'ord_2',
      'user_2',
      'stk_1',
      OrderType.SELL,
      10,
      150,
      OrderStatus.PENDING,
    );

    await repository.save(buyOrder);
    await repository.save(sellOrder);

    const result = await useCase.execute({ stockId: 'stk_1' });

    expect(result.equilibriumPrice).toBeNull();
    expect(result.matchableVolume).toBe(0);
  });

  it('should return null when no orders exist', async () => {
    const result = await useCase.execute({ stockId: 'stk_1' });

    expect(result.equilibriumPrice).toBeNull();
    expect(result.matchableVolume).toBe(0);
    expect(result.buyOrders).toBe(0);
    expect(result.sellOrders).toBe(0);
  });
});
