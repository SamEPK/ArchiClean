import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { Transaction } from '../../../domain/entities/Transaction';

export class InMemoryTransactionRepository implements ITransactionRepository {
  private transactions: Map<string, Transaction> = new Map();

  async save(transaction: Transaction): Promise<Transaction> {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.get(id) || null;
  }

  async findByAccountId(accountId: string, limit?: number): Promise<Transaction[]> {
    const transactions = Array.from(this.transactions.values())
      .filter(
        (t) => t.fromAccountId === accountId || t.toAccountId === accountId
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return limit ? transactions.slice(0, limit) : transactions;
  }

  async findAll(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // For testing
  clear(): void {
    this.transactions.clear();
  }
}
