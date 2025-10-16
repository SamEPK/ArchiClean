import { OpenSavingsAccountUseCase } from '../OpenSavingsAccountUseCase';
import { InMemorySavingsAccountRepository } from '@infrastructure/repositories/in-memory/InMemorySavingsAccountRepository';

describe('OpenSavingsAccountUseCase', () => {
  let useCase: OpenSavingsAccountUseCase;
  let repository: InMemorySavingsAccountRepository;

  beforeEach(() => {
    repository = new InMemorySavingsAccountRepository();
    useCase = new OpenSavingsAccountUseCase(repository);
  });

  afterEach(() => {
    repository.clear();
  });

  it('should create a new savings account', async () => {
    const request = {
      accountId: 'acc_123',
      interestRate: 0.02,
    };

    const result = await useCase.execute(request);

    expect(result).toBeDefined();
    expect(result.accountId).toBe('acc_123');
    expect(result.interestRate).toBe(0.02);
  });

  it('should throw error if savings account already exists', async () => {
    const request = {
      accountId: 'acc_123',
      interestRate: 0.02,
    };

    await useCase.execute(request);

    await expect(useCase.execute(request)).rejects.toThrow(
      'Savings account already exists for this account',
    );
  });

  it('should validate interest rate', async () => {
    const request = {
      accountId: 'acc_123',
      interestRate: 1.5,
    };

    await expect(useCase.execute(request)).rejects.toThrow(
      'Interest rate must be between 0 and 1',
    );
  });
});
