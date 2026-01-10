import { ExecuteOrderUseCase } from '../ExecuteOrderUseCase';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/InMemoryOrderRepository';
import { InMemoryPortfolioRepository } from '@infrastructure/repositories/in-memory/InMemoryPortfolioRepository';
import { InMemoryBankAccountRepository } from '@infrastructure/repositories/in-memory/InMemoryBankAccountRepository';
import { InMemoryTransactionRepository } from '@infrastructure/repositories/in-memory/InMemoryTransactionRepository';
import { Order, OrderType, OrderStatus } from '@domain/entities/Order';
import { BankAccount } from '@domain/entities/BankAccount';

describe('ExecuteOrderUseCase', () => {
  let useCase: ExecuteOrderUseCase;
  let orderRepository: InMemoryOrderRepository;
  let portfolioRepository: InMemoryPortfolioRepository;
  let bankAccountRepository: InMemoryBankAccountRepository;
  let transactionRepository: InMemoryTransactionRepository;
  let settlementAccount: BankAccount;

  beforeEach(async () => {
    orderRepository = new InMemoryOrderRepository();
    portfolioRepository = new InMemoryPortfolioRepository();
    bankAccountRepository = new InMemoryBankAccountRepository();
    transactionRepository = new InMemoryTransactionRepository();

    settlementAccount = new BankAccount({
      id: 'acc_1',
      clientId: 'user_1',
      iban: 'IBAN123',
      accountName: 'Main',
      balance: 10_000,
      currency: 'EUR',
      isActive: true,
      createdAt: new Date(),
    });
    await bankAccountRepository.create(settlementAccount);

    useCase = new ExecuteOrderUseCase(
      orderRepository,
      portfolioRepository,
      bankAccountRepository,
      transactionRepository,
    );
  });

  afterEach(() => {
    orderRepository.clear();
    portfolioRepository.clear();
    bankAccountRepository.clear();
    transactionRepository.clear();
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
      new Date(),
      undefined,
      settlementAccount.id,
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
      new Date(),
      undefined,
      settlementAccount.id,
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
