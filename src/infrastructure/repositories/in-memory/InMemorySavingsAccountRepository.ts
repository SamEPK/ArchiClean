import { SavingsAccount } from '@domain/entities/SavingsAccount';
import { ISavingsAccountRepository } from '@domain/repositories/ISavingsAccountRepository';

export class InMemorySavingsAccountRepository
  implements ISavingsAccountRepository
{
  private accounts: Map<string, SavingsAccount> = new Map();

  async save(savingsAccount: SavingsAccount): Promise<SavingsAccount> {
    this.accounts.set(savingsAccount.id, savingsAccount);
    return savingsAccount;
  }

  async findById(id: string): Promise<SavingsAccount | null> {
    return this.accounts.get(id) || null;
  }

  async findByAccountId(accountId: string): Promise<SavingsAccount | null> {
    const accounts = Array.from(this.accounts.values());
    return accounts.find((acc) => acc.accountId === accountId) || null;
  }

  async findAll(): Promise<SavingsAccount[]> {
    return Array.from(this.accounts.values());
  }

  async update(savingsAccount: SavingsAccount): Promise<SavingsAccount> {
    if (!this.accounts.has(savingsAccount.id)) {
      throw new Error('Savings account not found');
    }
    this.accounts.set(savingsAccount.id, savingsAccount);
    return savingsAccount;
  }

  async delete(id: string): Promise<void> {
    this.accounts.delete(id);
  }

  async findAccountsNeedingInterest(
    currentDate: Date,
  ): Promise<SavingsAccount[]> {
    const accounts = Array.from(this.accounts.values());
    return accounts.filter((acc) => acc.shouldApplyInterest(currentDate));
  }

  clear(): void {
    this.accounts.clear();
  }
}
