export class Portfolio {
  constructor(
    public readonly userId: string,
    public readonly stockId: string,
    public quantity: number,
    public averagePurchasePrice: number,
  ) {
    this.validateQuantity();
    this.validatePrice();
  }

  private validateQuantity(): void {
    if (this.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
  }

  private validatePrice(): void {
    if (this.averagePurchasePrice < 0) {
      throw new Error('Average purchase price cannot be negative');
    }
  }

  public addStocks(quantity: number, price: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity to add must be greater than 0');
    }

    const totalValue = this.quantity * this.averagePurchasePrice;
    const newValue = quantity * price;
    const newQuantity = this.quantity + quantity;

    this.averagePurchasePrice = (totalValue + newValue) / newQuantity;
    this.quantity = newQuantity;
  }

  public removeStocks(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity to remove must be greater than 0');
    }
    if (quantity > this.quantity) {
      throw new Error('Cannot remove more stocks than available');
    }
    this.quantity -= quantity;
  }

  public getTotalValue(currentPrice: number): number {
    return this.quantity * currentPrice;
  }

  public getProfit(currentPrice: number): number {
    return (currentPrice - this.averagePurchasePrice) * this.quantity;
  }

  public isEmpty(): boolean {
    return this.quantity === 0;
  }
}
