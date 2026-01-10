import { PlaceStockOrderUseCase } from '../PlaceStockOrderUseCase';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/InMemoryOrderRepository';
import { InMemoryStockRepository } from '@infrastructure/repositories/in-memory/InMemoryStockRepository';
import { InMemoryBankAccountRepository } from '@infrastructure/repositories/in-memory/InMemoryBankAccountRepository';
import { InMemoryTransactionRepository } from '@infrastructure/repositories/in-memory/InMemoryTransactionRepository';
import { Stock } from '@domain/entities/Stock';
import { OrderType } from '@domain/entities/Order';
import { BankAccount } from '@domain/entities/BankAccount';

describe('PlaceStockOrderUseCase', () => {
  let useCase: PlaceStockOrderUseCase;
  let orderRepository: InMemoryOrderRepository;
  let stockRepository: InMemoryStockRepository;
  let bankAccountRepository: InMemoryBankAccountRepository;
  let transactionRepository: InMemoryTransactionRepository;
  let fundingAccount: BankAccount;

  beforeEach(async () => {
    orderRepository = new InMemoryOrderRepository();
    stockRepository = new InMemoryStockRepository();
    bankAccountRepository = new InMemoryBankAccountRepository();
    transactionRepository = new InMemoryTransactionRepository();

    fundingAccount = new BankAccount({
      id: 'acc_1',
      clientId: 'user_1',
      iban: 'IBAN123',
      accountName: 'Main',
      balance: 10_000,
      currency: 'EUR',
      isActive: true,
      createdAt: new Date(),
    });
    await bankAccountRepository.create(fundingAccount);

    useCase = new PlaceStockOrderUseCase(
      orderRepository,
      stockRepository,
      bankAccountRepository,
      transactionRepository,
    );
  });

  afterEach(() => {
    orderRepository.clear();
    stockRepository.clear();
    bankAccountRepository.clear();
    transactionRepository.clear();
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
      accountId: fundingAccount.id,
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
      accountId: fundingAccount.id,
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
      accountId: fundingAccount.id,
    };

    await expect(useCase.execute(request)).rejects.toThrow(
      'Stock is not available for trading',
    );
  });
});
