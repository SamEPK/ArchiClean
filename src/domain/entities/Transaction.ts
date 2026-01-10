export type TransactionType = 'transfer' | 'deposit' | 'withdrawal';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly type: TransactionType,
    public readonly fromAccountId: string | null, // null for deposits
    public readonly toAccountId: string | null, // null for withdrawals
    public readonly amount: number,
    public readonly description: string,
    public readonly status: TransactionStatus,
    public readonly createdAt: Date,
    public readonly completedAt?: Date,
    public readonly failureReason?: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0');
    }

    if (this.type === 'transfer') {
      if (!this.fromAccountId || !this.toAccountId) {
        throw new Error('Transfer requires both fromAccountId and toAccountId');
      }
      if (this.fromAccountId === this.toAccountId) {
        throw new Error('Cannot transfer to the same account');
      }
    }

    if (this.type === 'deposit' && !this.toAccountId) {
      throw new Error('Deposit requires toAccountId');
    }

    if (this.type === 'withdrawal' && !this.fromAccountId) {
      throw new Error('Withdrawal requires fromAccountId');
    }
  }

  static createTransfer(
    id: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string
  ): Transaction {
    return new Transaction(
      id,
      'transfer',
      fromAccountId,
      toAccountId,
      amount,
      description,
      'pending',
      new Date()
    );
  }

  static createDeposit(
    id: string,
    toAccountId: string,
    amount: number,
    description: string
  ): Transaction {
    return new Transaction(
      id,
      'deposit',
      null,
      toAccountId,
      amount,
      description,
      'pending',
      new Date()
    );
  }

  static createWithdrawal(
    id: string,
    fromAccountId: string,
    amount: number,
    description: string
  ): Transaction {
    return new Transaction(
      id,
      'withdrawal',
      fromAccountId,
      null,
      amount,
      description,
      'pending',
      new Date()
    );
  }

  markAsCompleted(): Transaction {
    return new Transaction(
      this.id,
      this.type,
      this.fromAccountId,
      this.toAccountId,
      this.amount,
      this.description,
      'completed',
      this.createdAt,
      new Date()
    );
  }

  markAsFailed(reason: string): Transaction {
    return new Transaction(
      this.id,
      this.type,
      this.fromAccountId,
      this.toAccountId,
      this.amount,
      this.description,
      'failed',
      this.createdAt,
      undefined,
      reason
    );
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isFailed(): boolean {
    return this.status === 'failed';
  }

  isPending(): boolean {
    return this.status === 'pending';
  }
}
