import { ApplyDailyInterestUseCase } from '../ApplyDailyInterestUseCase';
import { InMemorySavingsAccountRepository } from '@infrastructure/repositories/in-memory/InMemorySavingsAccountRepository';
import { SavingsAccount } from '@domain/entities/SavingsAccount';

describe('ApplyDailyInterestUseCase', () => {
  let useCase: ApplyDailyInterestUseCase;
  let repository: InMemorySavingsAccountRepository;

  beforeEach(() => {
    repository = new InMemorySavingsAccountRepository();
    useCase = new ApplyDailyInterestUseCase(repository);
  });

  afterEach(() => {
    repository.clear();
  });

  it('should apply interest to eligible accounts', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);

    const savingsAccount = new SavingsAccount(
      'sa_1',
      'acc_123',
      0.05,
      yesterday,
    );
    await repository.save(savingsAccount);

    const result = await useCase.execute({});

    expect(result.accountsUpdated).toBe(1);
    expect(result.totalInterestApplied).toBeGreaterThan(0);
  });

  it('should not apply interest if last interest date is today', async () => {
    const today = new Date();

    const savingsAccount = new SavingsAccount('sa_1', 'acc_123', 0.05, today);
    await repository.save(savingsAccount);

    const result = await useCase.execute({ currentDate: today });

    expect(result.accountsUpdated).toBe(0);
    expect(result.totalInterestApplied).toBe(0);
  });

  it('should handle multiple accounts', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);

    const account1 = new SavingsAccount('sa_1', 'acc_1', 0.05, yesterday);
    const account2 = new SavingsAccount('sa_2', 'acc_2', 0.03, yesterday);

    await repository.save(account1);
    await repository.save(account2);

    const result = await useCase.execute({});

    expect(result.accountsUpdated).toBe(2);
  });
});
