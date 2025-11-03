import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';

export class DeleteBankAccountUseCase {
  constructor(private bankAccountRepository: IBankAccountRepository) {}

  async execute(accountId: string, clientId: string): Promise<{ success: boolean; message: string }> {
    const account = await this.bankAccountRepository.findById(accountId);

    if (!account) {
      return { success: false, message: 'Bank account not found' };
    }

    if (account.clientId !== clientId) {
      return { success: false, message: 'Unauthorized: This account does not belong to you' };
    }

    if (account.balance > 0) {
      return { success: false, message: 'Cannot delete account with positive balance. Please withdraw all funds first' };
    }

    if (!account.isActive) {
      return { success: false, message: 'Account is already deactivated' };
    }

    account.deactivate();
    await this.bankAccountRepository.update(account);

    return { success: true, message: 'Bank account deactivated successfully' };
  }
}
