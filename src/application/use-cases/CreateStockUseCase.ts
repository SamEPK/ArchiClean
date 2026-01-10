import { Stock } from '../../domain/entities/Stock';
import { IStockRepository } from '../../domain/repositories/IStockRepository';
import { uuidv4 } from '@infrastructure/utils/uuid-helper';

export class CreateStockUseCase {
  constructor(private stockRepository: IStockRepository) {}

  async execute(
    symbol: string,
    name: string,
    companyName: string,
    isAvailable: boolean = true
  ): Promise<Stock> {
    // Validate inputs
    if (!symbol || symbol.trim().length === 0) {
      throw new Error('Stock symbol is required');
    }

    if (!name || name.trim().length === 0) {
      throw new Error('Stock name is required');
    }

    if (!companyName || companyName.trim().length === 0) {
      throw new Error('Company name is required');
    }

    // Check if stock with this symbol already exists
    const existingStock = await this.stockRepository.findBySymbol(symbol.toUpperCase());
    if (existingStock) {
      throw new Error(`Stock with symbol ${symbol.toUpperCase()} already exists`);
    }

    // Create stock
    const stock = new Stock(
      uuidv4(),
      symbol.toUpperCase().trim(),
      name.trim(),
      companyName.trim(),
      isAvailable,
      new Date()
    );

    return await this.stockRepository.save(stock);
  }
}
