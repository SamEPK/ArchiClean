import { ICreditRepository } from '../../domain/repositories/ICreditRepository';
import { Credit } from '../../domain/entities/Credit';
import { CalculateMonthlyPayment } from './CalculateMonthlyPayment';

export class GrantCredit {
  constructor(private creditRepo: ICreditRepository) {}

  async execute(credit: Credit, durationMonths: number): Promise<void> {
    const calc = new CalculateMonthlyPayment();
    const monthly = calc.execute(credit.amount, credit.annualRate, durationMonths);
    credit.monthlyPayment = monthly + Math.round((credit.amount * (credit.insuranceRate / 100)) / durationMonths * 100) / 100;
    credit.remainingBalance = credit.amount;
    await this.creditRepo.save(credit);
  }
}
