import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { IBankAccountRepository } from '../../domain/repositories/IBankAccountRepository';
import { Transaction } from '../../domain/entities/Transaction';

export class GetTransactionHistoryUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private bankAccountRepository: IBankAccountRepository
  ) {}

  async execute(accountOrClientId: string, limit: number = 50): Promise<Transaction[]> {
    // Try to find as account first
    const account = await this.bankAccountRepository.findById(accountOrClientId);

    if (account) {
      // It's an account ID - return transactions for this account
      return await this.transactionRepository.findByAccountId(accountOrClientId, limit);
    }

    // Try to find as client ID
    const clientAccounts = await this.bankAccountRepository.findByClientId(accountOrClientId);

    if (clientAccounts.length === 0) {
      throw new Error('Account or Client not found');
    }

    // Get transactions for all client accounts
    const allTransactions: Transaction[] = [];
    for (const clientAccount of clientAccounts) {
      const accountTransactions = await this.transactionRepository.findByAccountId(clientAccount.id);
      allTransactions.push(...accountTransactions);
    }

    // Sort by date (newest first) and apply limit
    const sortedTransactions = allTransactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return limit ? sortedTransactions.slice(0, limit) : sortedTransactions;
  }
}
