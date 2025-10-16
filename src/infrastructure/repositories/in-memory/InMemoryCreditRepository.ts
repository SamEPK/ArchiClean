import { ICreditRepository } from '../../../domain/repositories/ICreditRepository';
import { Credit } from '../../../domain/entities/Credit';

export class InMemoryCreditRepository implements ICreditRepository {
  private credits: Map<string, Credit> = new Map();

  async save(credit: Credit): Promise<void> {
    this.credits.set(credit.id, credit);
  }
  async findById(id: string): Promise<Credit | null> {
    return this.credits.get(id) ?? null;
  }
  async findByUserId(userId: string): Promise<Credit[]> {
    const out: Credit[] = [];
    for (const c of this.credits.values()) {
      if (c.userId === userId) out.push(c);
    }
    return out;
  }
}
