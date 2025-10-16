import { ISavingsAccountRepository } from '@domain/repositories/ISavingsAccountRepository';

export interface ApplyDailyInterestRequest {
  currentDate?: Date;
}

export interface ApplyDailyInterestResponse {
  accountsUpdated: number;
  totalInterestApplied: number;
}

export class ApplyDailyInterestUseCase {
  constructor(
    private readonly savingsAccountRepository: ISavingsAccountRepository,
  ) {}

  async execute(
    request: ApplyDailyInterestRequest = {},
  ): Promise<ApplyDailyInterestResponse> {
    const currentDate = request.currentDate || new Date();
    const accounts =
      await this.savingsAccountRepository.findAccountsNeedingInterest(
        currentDate,
      );

    let accountsUpdated = 0;
    let totalInterestApplied = 0;

    for (const account of accounts) {
      if (account.shouldApplyInterest(currentDate)) {
        const interest = this.calculateDailyInterest(
          account.interestRate,
          currentDate,
          account.lastInterestDate,
        );

        account.updateLastInterestDate(currentDate);
        await this.savingsAccountRepository.update(account);

        accountsUpdated++;
        totalInterestApplied += interest;
      }
    }

    return {
      accountsUpdated,
      totalInterestApplied,
    };
  }

  private calculateDailyInterest(
    annualRate: number,
    currentDate: Date,
    lastDate: Date,
  ): number {
    const days = this.getDaysDifference(lastDate, currentDate);
    const dailyRate = annualRate / 365;
    return dailyRate * days;
  }

  private getDaysDifference(from: Date, to: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((to.getTime() - from.getTime()) / millisecondsPerDay);
  }
}
