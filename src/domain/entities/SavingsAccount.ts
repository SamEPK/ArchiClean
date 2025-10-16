export class SavingsAccount {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly interestRate: number,
    public lastInterestDate: Date,
    public readonly createdAt: Date = new Date(),
  ) {
    this.validateInterestRate();
  }

  private validateInterestRate(): void {
    if (this.interestRate < 0 || this.interestRate > 1) {
      throw new Error('Interest rate must be between 0 and 1');
    }
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

  private calculateDaysDifference(from: Date, to: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((to.getTime() - from.getTime()) / millisecondsPerDay);
  }
}
