import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';
import { BankAccount } from '@domain/entities/BankAccount';

export class UpdateBankAccountNameUseCase {
  constructor(private bankAccountRepository: IBankAccountRepository) {}

  async execute(accountId: string, clientId: string, newAccountName: string): Promise<BankAccount> {
    const account = await this.bankAccountRepository.findById(accountId);

    if (!account) {
      throw new Error('Bank account not found');
    }

    if (account.clientId !== clientId) {
      throw new Error('Unauthorized: This account does not belong to you');
    }

    if (!account.isActive) {
      throw new Error('Cannot update inactive account');
    }

    account.updateAccountName(newAccountName);
    await this.bankAccountRepository.update(account);

    return account;
  }
}
