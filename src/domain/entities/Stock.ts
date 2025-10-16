export class Stock {
  constructor(
    public readonly id: string,
    public readonly symbol: string,
    public readonly name: string,
    public readonly companyName: string,
    public isAvailable: boolean,
    public readonly createdAt: Date = new Date(),
  ) {
    this.validateSymbol();
  }

  private validateSymbol(): void {
    if (!this.symbol || this.symbol.trim().length === 0) {
      throw new Error('Stock symbol cannot be empty');
    }
    if (this.symbol.length > 10) {
      throw new Error('Stock symbol cannot exceed 10 characters');
    }
  }

  public makeAvailable(): void {
    this.isAvailable = true;
  }

  public makeUnavailable(): void {
    this.isAvailable = false;
  }
}
