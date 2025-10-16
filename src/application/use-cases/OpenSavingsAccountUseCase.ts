import { SavingsAccount } from '@domain/entities/SavingsAccount';
import { ISavingsAccountRepository } from '@domain/repositories/ISavingsAccountRepository';

export interface OpenSavingsAccountRequest {
  accountId: string;
  interestRate: number;
}

export class OpenSavingsAccountUseCase {
  constructor(
    private readonly savingsAccountRepository: ISavingsAccountRepository,
  ) {}

  async execute(
    request: OpenSavingsAccountRequest,
  ): Promise<SavingsAccount> {
    const existingAccount =
      await this.savingsAccountRepository.findByAccountId(request.accountId);

    if (existingAccount) {
      throw new Error('Savings account already exists for this account');
    }

    const savingsAccount = new SavingsAccount(
      this.generateId(),
      request.accountId,
      request.interestRate,
      new Date(),
    );

    return await this.savingsAccountRepository.save(savingsAccount);
  }

  private generateId(): string {
    return `sa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
