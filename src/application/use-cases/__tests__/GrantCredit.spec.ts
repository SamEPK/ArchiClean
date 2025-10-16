import { GrantCredit } from '../GrantCredit';
import { InMemoryCreditRepository } from '@infrastructure/repositories/in-memory/InMemoryCreditRepository';
import { Credit } from '@domain/entities/Credit';

describe('GrantCredit', () => {
  it('calculates monthly payment and saves credit', async () => {
    const repo = new InMemoryCreditRepository();
    const useCase = new GrantCredit(repo);
    const credit = new Credit({ id: 'c1', userId: 'u1', amount: 1200, annualRate: 12, insuranceRate: 1 });
    await useCase.execute(credit, 12);
    const saved = await repo.findById('c1');
    expect(saved).not.toBeNull();
    expect(saved?.monthlyPayment).toBeGreaterThan(0);
  });
});
