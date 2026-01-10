import { IBankAccountRepository } from '../../domain/repositories/IBankAccountRepository';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';

export class TransferFundsUseCase {
  constructor(
    private bankAccountRepository: IBankAccountRepository,
    private transactionRepository: ITransactionRepository
  ) {}

  async execute(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string = 'Virement'
  ): Promise<Transaction> {
    // Validate accounts exist
    const fromAccount = await this.bankAccountRepository.findById(fromAccountId);
    if (!fromAccount) {
      throw new Error('Source account not found');
    }

    const toAccount = await this.bankAccountRepository.findById(toAccountId);
    if (!toAccount) {
      throw new Error('Destination account not found');
    }

    // Validate accounts are active
    if (!fromAccount.isActive) {
      throw new Error('Source account is not active');
    }

    if (!toAccount.isActive) {
      throw new Error('Destination account is not active');
    }

    // Validate amount
    if (amount <= 0) {
      throw new Error('Transfer amount must be greater than 0');
    }

    // Validate sufficient balance
    if (fromAccount.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Create transaction
    const transaction = Transaction.createTransfer(
      this.generateId(),
      fromAccountId,
      toAccountId,
      amount,
      description
    );

    try {
      // Debit source account
      fromAccount.withdraw(amount);
      await this.bankAccountRepository.update(fromAccount);

      // Credit destination account
      toAccount.deposit(amount);
      await this.bankAccountRepository.update(toAccount);

      // Mark transaction as completed
      const completedTransaction = transaction.markAsCompleted();
      return await this.transactionRepository.save(completedTransaction);
    } catch (error) {
      // Rollback if possible and mark transaction as failed
      const failedTransaction = transaction.markAsFailed(
        error instanceof Error ? error.message : 'Transfer failed'
      );
      await this.transactionRepository.save(failedTransaction);
      throw error;
    }
  }

  /**
   * Generates a predictable unique identifier (avoids ESM uuid import issues in Jest)
   */
  private generateId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
