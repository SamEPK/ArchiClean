import { Portfolio } from '@domain/entities/Portfolio';
import { IPortfolioRepository } from '@domain/repositories/IPortfolioRepository';

export class InMemoryPortfolioRepository implements IPortfolioRepository {
  private portfolios: Map<string, Portfolio> = new Map();

  private getKey(userId: string, stockId: string): string {
    return `${userId}_${stockId}`;
  }

  async save(portfolio: Portfolio): Promise<Portfolio> {
    const key = this.getKey(portfolio.userId, portfolio.stockId);
    this.portfolios.set(key, portfolio);
    return portfolio;
  }

  async findByUserIdAndStockId(
    userId: string,
    stockId: string,
  ): Promise<Portfolio | null> {
    const key = this.getKey(userId, stockId);
    return this.portfolios.get(key) || null;
  }

  async findByUserId(userId: string): Promise<Portfolio[]> {
    const portfolios = Array.from(this.portfolios.values());
    return portfolios.filter((p) => p.userId === userId);
  }

  async update(portfolio: Portfolio): Promise<Portfolio> {
    const key = this.getKey(portfolio.userId, portfolio.stockId);
    if (!this.portfolios.has(key)) {
      throw new Error('Portfolio not found');
    }
    this.portfolios.set(key, portfolio);
    return portfolio;
  }

  async delete(userId: string, stockId: string): Promise<void> {
    const key = this.getKey(userId, stockId);
    this.portfolios.delete(key);
  }

  clear(): void {
    this.portfolios.clear();
  }
}
