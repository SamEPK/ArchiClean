import { PlaceStockOrderUseCase } from '../PlaceStockOrderUseCase';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/InMemoryOrderRepository';
import { InMemoryStockRepository } from '@infrastructure/repositories/in-memory/InMemoryStockRepository';
import { Stock } from '@domain/entities/Stock';
import { OrderType } from '@domain/entities/Order';

describe('PlaceStockOrderUseCase', () => {
  let useCase: PlaceStockOrderUseCase;
  let orderRepository: InMemoryOrderRepository;
  let stockRepository: InMemoryStockRepository;

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository();
    stockRepository = new InMemoryStockRepository();
    useCase = new PlaceStockOrderUseCase(orderRepository, stockRepository);
  });

  afterEach(() => {
    orderRepository.clear();
    stockRepository.clear();
  });

  it('should place a buy order successfully', async () => {
    const stock = new Stock('stk_1', 'AAPL', 'Apple', 'Apple Inc.', true);
    await stockRepository.save(stock);

    const request = {
      userId: 'user_1',
      stockId: 'stk_1',
      type: OrderType.BUY,
      quantity: 10,
      price: 150,
    };

    const result = await useCase.execute(request);

    expect(result).toBeDefined();
    expect(result.userId).toBe('user_1');
    expect(result.stockId).toBe('stk_1');
    expect(result.type).toBe(OrderType.BUY);
    expect(result.quantity).toBe(10);
  });

  it('should throw error if stock not found', async () => {
    const request = {
      userId: 'user_1',
      stockId: 'stk_999',
      type: OrderType.BUY,
      quantity: 10,
      price: 150,
    };

    await expect(useCase.execute(request)).rejects.toThrow('Stock not found');
  });

  it('should throw error if stock is not available', async () => {
    const stock = new Stock('stk_1', 'AAPL', 'Apple', 'Apple Inc.', false);
    await stockRepository.save(stock);

    const request = {
      userId: 'user_1',
      stockId: 'stk_1',
      type: OrderType.BUY,
      quantity: 10,
      price: 150,
    };

    await expect(useCase.execute(request)).rejects.toThrow(
      'Stock is not available for trading',
    );
  });
});
