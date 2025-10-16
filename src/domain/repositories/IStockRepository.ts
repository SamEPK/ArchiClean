import { Stock } from '../entities/Stock';

export interface IStockRepository {
  save(stock: Stock): Promise<Stock>;
  findById(id: string): Promise<Stock | null>;
  findBySymbol(symbol: string): Promise<Stock | null>;
  findAll(): Promise<Stock[]>;
  findAvailable(): Promise<Stock[]>;
  update(stock: Stock): Promise<Stock>;
  delete(id: string): Promise<void>;
}
