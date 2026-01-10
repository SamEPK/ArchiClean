import { IBankAccountRepository } from '../../domain/repositories/IBankAccountRepository';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';
import { uuidv4 } from '@infrastructure/utils/uuid-helper';

export class DepositFundsUseCase {
  constructor(
    private bankAccountRepository: IBankAccountRepository,
    private transactionRepository: ITransactionRepository
  ) {}

  async execute(
    accountId: string,
    amount: number,
    description: string = 'Dépôt'
  ): Promise<Transaction> {
    // Validate account exists
    const account = await this.bankAccountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Validate account is active
    if (!account.isActive) {
      throw new Error('Account is not active');
    }

    // Validate amount
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }

    // Create transaction
    const transaction = Transaction.createDeposit(
      uuidv4(),
      accountId,
      amount,
      description
    );

    try {
      // Credit account
      account.deposit(amount);
      await this.bankAccountRepository.update(account);

      // Mark transaction as completed
      const completedTransaction = transaction.markAsCompleted();
      return await this.transactionRepository.save(completedTransaction);
    } catch (error) {
      // Mark transaction as failed
      const failedTransaction = transaction.markAsFailed(
        error instanceof Error ? error.message : 'Deposit failed'
      );
      await this.transactionRepository.save(failedTransaction);
      throw error;
    }
  }
}
