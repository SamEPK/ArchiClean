import { Stock } from '../../domain/entities/Stock';
import { IStockRepository } from '../../domain/repositories/IStockRepository';

export class UpdateStockUseCase {
  constructor(private stockRepository: IStockRepository) {}

  async execute(
    stockId: string,
    updates: {
      name?: string;
      companyName?: string;
      isAvailable?: boolean;
    }
  ): Promise<Stock> {
    const stock = await this.stockRepository.findById(stockId);
    if (!stock) {
      throw new Error('Stock not found');
    }

    // Validate updates
    if (updates.name !== undefined && updates.name.trim().length === 0) {
      throw new Error('Stock name cannot be empty');
    }

    if (updates.companyName !== undefined && updates.companyName.trim().length === 0) {
      throw new Error('Company name cannot be empty');
    }

    // Create updated stock
    const updatedStock = new Stock(
      stock.id,
      stock.symbol,
      updates.name !== undefined ? updates.name.trim() : stock.name,
      updates.companyName !== undefined ? updates.companyName.trim() : stock.companyName,
      updates.isAvailable !== undefined ? updates.isAvailable : stock.isAvailable,
      stock.createdAt
    );

    return await this.stockRepository.update(updatedStock);
  }
}
