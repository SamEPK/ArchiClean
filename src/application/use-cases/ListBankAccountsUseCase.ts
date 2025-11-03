import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';
import { BankAccount } from '@domain/entities/BankAccount';

export class ListBankAccountsUseCase {
  constructor(private bankAccountRepository: IBankAccountRepository) {}

  async execute(clientId: string, includeInactive: boolean = false): Promise<BankAccount[]> {
    const accounts = await this.bankAccountRepository.findByClientId(clientId);

    if (includeInactive) {
      return accounts;
    }

    return accounts.filter(account => account.isActive);
  }
}
