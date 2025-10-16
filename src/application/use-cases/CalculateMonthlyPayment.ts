export class CalculateMonthlyPayment {
  // montant: principal, annualRate en percent, durationMonths
  execute(amount: number, annualRate: number, durationMonths: number): number {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return amount / durationMonths;
    const r = monthlyRate;
    const n = durationMonths;
    const payment = (amount * r) / (1 - Math.pow(1 + r, -n));
    return Math.round(payment * 100) / 100;
  }
}
