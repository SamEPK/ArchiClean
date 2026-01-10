import { TransferFundsUseCase } from '../TransferFundsUseCase';
import { InMemoryBankAccountRepository } from '../../../infrastructure/repositories/in-memory/InMemoryBankAccountRepository';
import { InMemoryTransactionRepository } from '../../../infrastructure/repositories/in-memory/InMemoryTransactionRepository';
import { BankAccount } from '../../../domain/entities/BankAccount';

describe('TransferFundsUseCase', () => {
  let transferFundsUseCase: TransferFundsUseCase;
  let bankAccountRepository: InMemoryBankAccountRepository;
  let transactionRepository: InMemoryTransactionRepository;
  let fromAccount: BankAccount;
  let toAccount: BankAccount;

  beforeEach(async () => {
    bankAccountRepository = new InMemoryBankAccountRepository();
    transactionRepository = new InMemoryTransactionRepository();
    transferFundsUseCase = new TransferFundsUseCase(
      bankAccountRepository,
      transactionRepository
    );

    // Create bank accounts
    fromAccount = new BankAccount({
      id: 'account-1',
      clientId: 'client-1',
      iban: BankAccount.generateIBAN('FR'),
      accountName: 'Source Account',
      balance: 1000,
      currency: 'EUR',
      isActive: true,
      createdAt: new Date(),
    });

    toAccount = new BankAccount({
      id: 'account-2',
      clientId: 'client-1',
      iban: BankAccount.generateIBAN('FR'),
      accountName: 'Destination Account',
      balance: 500,
      currency: 'EUR',
      isActive: true,
      createdAt: new Date(),
    });

    await bankAccountRepository.create(fromAccount);
    await bankAccountRepository.create(toAccount);
  });

  afterEach(() => {
    bankAccountRepository.clear();
    transactionRepository.clear();
  });

  it('should transfer funds successfully between accounts', async () => {
    const transaction = await transferFundsUseCase.execute(
      fromAccount.id,
      toAccount.id,
      200,
      'Test transfer'
    );

    expect(transaction).toBeDefined();
    expect(transaction.type).toBe('transfer');
    expect(transaction.amount).toBe(200);
    expect(transaction.status).toBe('completed');
    expect(transaction.fromAccountId).toBe(fromAccount.id);
    expect(transaction.toAccountId).toBe(toAccount.id);

    // Verify balances
    const updatedFromAccount = await bankAccountRepository.findById(fromAccount.id);
    const updatedToAccount = await bankAccountRepository.findById(toAccount.id);

    expect(updatedFromAccount?.balance).toBe(800);
    expect(updatedToAccount?.balance).toBe(700);
  });

  it('should fail when source account does not exist', async () => {
    await expect(
      transferFundsUseCase.execute('nonexistent', toAccount.id, 100)
    ).rejects.toThrow('Source account not found');
  });

  it('should fail when destination account does not exist', async () => {
    await expect(
      transferFundsUseCase.execute(fromAccount.id, 'nonexistent', 100)
    ).rejects.toThrow('Destination account not found');
  });

  it('should fail when source account has insufficient funds', async () => {
    await expect(
      transferFundsUseCase.execute(fromAccount.id, toAccount.id, 2000)
    ).rejects.toThrow('Insufficient balance');
  });

  it('should fail when amount is zero or negative', async () => {
    await expect(
      transferFundsUseCase.execute(fromAccount.id, toAccount.id, 0)
    ).rejects.toThrow('Transfer amount must be greater than 0');

    await expect(
      transferFundsUseCase.execute(fromAccount.id, toAccount.id, -100)
    ).rejects.toThrow('Transfer amount must be greater than 0');
  });

  it('should fail when source account is inactive', async () => {
    fromAccount.deactivate();
    await bankAccountRepository.update(fromAccount);

    await expect(
      transferFundsUseCase.execute(fromAccount.id, toAccount.id, 100)
    ).rejects.toThrow('Source account is not active');
  });

  it('should fail when destination account is inactive', async () => {
    toAccount.deactivate();
    await bankAccountRepository.update(toAccount);

    await expect(
      transferFundsUseCase.execute(fromAccount.id, toAccount.id, 100)
    ).rejects.toThrow('Destination account is not active');
  });

  it('should create a transaction record', async () => {
    const transaction = await transferFundsUseCase.execute(
      fromAccount.id,
      toAccount.id,
      150
    );

    const savedTransaction = await transactionRepository.findById(transaction.id);
    expect(savedTransaction).toBeDefined();
    expect(savedTransaction?.amount).toBe(150);
    expect(savedTransaction?.status).toBe('completed');
  });

  it('should handle custom descriptions', async () => {
    const description = 'Monthly rent payment';
    const transaction = await transferFundsUseCase.execute(
      fromAccount.id,
      toAccount.id,
      300,
      description
    );

    expect(transaction.description).toBe(description);
  });
});
