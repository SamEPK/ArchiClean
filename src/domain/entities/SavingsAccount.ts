export class SavingsAccount {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly interestRate: number,
    public balance: number,
    public lastInterestDate: Date,
    public readonly createdAt: Date = new Date(),
  ) {
    this.validateInterestRate();
    this.validateBalance();
  }

  private validateInterestRate(): void {
    if (this.interestRate < 0 || this.interestRate > 1) {
      throw new Error('Interest rate must be between 0 and 1');
    }
  }

  private validateBalance(): void {
    if (this.balance < 0) {
      throw new Error('Balance cannot be negative');
    }
  }

  public deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }
    this.balance += amount;
  }

  public withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }
    if (amount > this.balance) {
      throw new Error('Insufficient savings balance');
    }
    this.balance -= amount;
  }

  public updateLastInterestDate(date: Date): void {
    this.lastInterestDate = date;
  }

  public shouldApplyInterest(currentDate: Date): boolean {
    const daysDifference = this.calculateDaysDifference(
      this.lastInterestDate,
      currentDate,
    );
    return daysDifference >= 1;
  }

  public applyInterest(amount: number, currentDate: Date): void {
    if (amount <= 0) return;
    this.deposit(amount);
    this.updateLastInterestDate(currentDate);
  }

  private calculateDaysDifference(from: Date, to: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((to.getTime() - from.getTime()) / millisecondsPerDay);
  }
}
