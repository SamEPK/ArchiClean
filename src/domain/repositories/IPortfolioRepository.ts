import { Portfolio } from '../entities/Portfolio';

export interface IPortfolioRepository {
  save(portfolio: Portfolio): Promise<Portfolio>;
  findByUserIdAndStockId(
    userId: string,
    stockId: string,
  ): Promise<Portfolio | null>;
  findByUserId(userId: string): Promise<Portfolio[]>;
  update(portfolio: Portfolio): Promise<Portfolio>;
  delete(userId: string, stockId: string): Promise<void>;
}
