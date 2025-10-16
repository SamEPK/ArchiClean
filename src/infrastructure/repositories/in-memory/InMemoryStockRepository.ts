import { Stock } from '@domain/entities/Stock';
import { IStockRepository } from '@domain/repositories/IStockRepository';

export class InMemoryStockRepository implements IStockRepository {
  private stocks: Map<string, Stock> = new Map();

  async save(stock: Stock): Promise<Stock> {
    this.stocks.set(stock.id, stock);
    return stock;
  }

  async findById(id: string): Promise<Stock | null> {
    return this.stocks.get(id) || null;
  }

  async findBySymbol(symbol: string): Promise<Stock | null> {
    const stocks = Array.from(this.stocks.values());
    return stocks.find((s) => s.symbol === symbol) || null;
  }

  async findAll(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async findAvailable(): Promise<Stock[]> {
    const stocks = Array.from(this.stocks.values());
    return stocks.filter((s) => s.isAvailable);
  }

  async update(stock: Stock): Promise<Stock> {
    if (!this.stocks.has(stock.id)) {
      throw new Error('Stock not found');
    }
    this.stocks.set(stock.id, stock);
    return stock;
  }

  async delete(id: string): Promise<void> {
    this.stocks.delete(id);
  }

  clear(): void {
    this.stocks.clear();
  }
}
