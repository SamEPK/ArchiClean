import { Transaction } from '../entities/Transaction';

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByAccountId(accountId: string, limit?: number): Promise<Transaction[]>;
  findAll(): Promise<Transaction[]>;
}
