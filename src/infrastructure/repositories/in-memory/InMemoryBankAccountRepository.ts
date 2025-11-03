import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';
import { BankAccount } from '@domain/entities/BankAccount';

export class InMemoryBankAccountRepository implements IBankAccountRepository {
  private accounts: Map<string, BankAccount> = new Map();

  async create(account: BankAccount): Promise<void> {
    this.accounts.set(account.id, account);
  }

  async findById(id: string): Promise<BankAccount | null> {
    return this.accounts.get(id) || null;
  }

  async findByIban(iban: string): Promise<BankAccount | null> {
    for (const account of this.accounts.values()) {
      if (account.iban === iban) {
        return account;
      }
    }
    return null;
  }

  async findByClientId(clientId: string): Promise<BankAccount[]> {
    const clientAccounts: BankAccount[] = [];
    for (const account of this.accounts.values()) {
      if (account.clientId === clientId) {
        clientAccounts.push(account);
      }
    }
    return clientAccounts;
  }

  async update(account: BankAccount): Promise<void> {
    if (!this.accounts.has(account.id)) {
      throw new Error('Account not found');
    }
    this.accounts.set(account.id, account);
  }

  async delete(id: string): Promise<void> {
    this.accounts.delete(id);
  }

  async findAll(): Promise<BankAccount[]> {
    return Array.from(this.accounts.values());
  }

  clear(): void {
    this.accounts.clear();
  }
}
