import { Stock } from '../../domain/entities/Stock';
import { IStockRepository } from '../../domain/repositories/IStockRepository';

export class ToggleStockAvailabilityUseCase {
  constructor(private stockRepository: IStockRepository) {}

  async execute(stockId: string, isAvailable: boolean): Promise<Stock> {
    const stock = await this.stockRepository.findById(stockId);
    if (!stock) {
      throw new Error('Stock not found');
    }

    if (isAvailable) {
      stock.makeAvailable();
    } else {
      stock.makeUnavailable();
    }

    return await this.stockRepository.update(stock);
  }
}
