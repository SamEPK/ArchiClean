import { GetPortfolioUseCase } from '../GetPortfolioUseCase';
import { InMemoryPortfolioRepository } from '@infrastructure/repositories/in-memory/InMemoryPortfolioRepository';
import { InMemoryStockRepository } from '@infrastructure/repositories/in-memory/InMemoryStockRepository';
import { Portfolio } from '@domain/entities/Portfolio';
import { Stock } from '@domain/entities/Stock';

describe('GetPortfolioUseCase', () => {
  let useCase: GetPortfolioUseCase;
  let portfolioRepository: InMemoryPortfolioRepository;
  let stockRepository: InMemoryStockRepository;

  beforeEach(() => {
    portfolioRepository = new InMemoryPortfolioRepository();
    stockRepository = new InMemoryStockRepository();
    useCase = new GetPortfolioUseCase(portfolioRepository, stockRepository);
  });

  afterEach(() => {
    portfolioRepository.clear();
    stockRepository.clear();
  });

  it('should return user portfolio with stocks', async () => {
    const stock1 = new Stock('stk_1', 'AAPL', 'Apple', 'Apple Inc.', true);
    const stock2 = new Stock('stk_2', 'GOOGL', 'Google', 'Alphabet Inc.', true);

    await stockRepository.save(stock1);
    await stockRepository.save(stock2);

    const portfolio1 = new Portfolio('user_1', 'stk_1', 10, 150);
    const portfolio2 = new Portfolio('user_1', 'stk_2', 5, 2800);

    await portfolioRepository.save(portfolio1);
    await portfolioRepository.save(portfolio2);

    const result = await useCase.execute({ userId: 'user_1' });

    expect(result.userId).toBe('user_1');
    expect(result.items).toHaveLength(2);
    expect(result.items[0].stockSymbol).toBe('AAPL');
    expect(result.items[0].quantity).toBe(10);
    expect(result.items[1].stockSymbol).toBe('GOOGL');
  });

  it('should return empty portfolio for user with no stocks', async () => {
    const result = await useCase.execute({ userId: 'user_999' });

    expect(result.userId).toBe('user_999');
    expect(result.items).toHaveLength(0);
    expect(result.totalValue).toBe(0);
    expect(result.totalProfit).toBe(0);
  });

  it('should skip portfolio items with missing stocks', async () => {
    const portfolio = new Portfolio('user_1', 'stk_999', 10, 150);
    await portfolioRepository.save(portfolio);

    const result = await useCase.execute({ userId: 'user_1' });

    expect(result.items).toHaveLength(0);
  });
});
