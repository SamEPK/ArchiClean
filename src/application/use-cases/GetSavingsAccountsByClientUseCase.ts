import { SavingsAccount } from '@domain/entities/SavingsAccount';
import { ISavingsAccountRepository } from '@domain/repositories/ISavingsAccountRepository';
import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';

export class GetSavingsAccountsByClientUseCase {
  constructor(
    private readonly savingsAccountRepository: ISavingsAccountRepository,
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(clientId: string): Promise<SavingsAccount[]> {
    // Get all bank accounts for the client
    const bankAccounts = await this.bankAccountRepository.findByClientId(clientId);

    if (bankAccounts.length === 0) {
      return [];
    }

    // Extract account IDs
    const accountIds = bankAccounts.map(acc => acc.id);

    // Find all savings accounts linked to these bank accounts
    const savingsAccounts = await this.savingsAccountRepository.findByAccountIds(accountIds);

    return savingsAccounts;
  }
}
