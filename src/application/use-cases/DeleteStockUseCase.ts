import { IStockRepository } from '../../domain/repositories/IStockRepository';

export class DeleteStockUseCase {
  constructor(private stockRepository: IStockRepository) {}

  async execute(stockId: string): Promise<void> {
    const stock = await this.stockRepository.findById(stockId);
    if (!stock) {
      throw new Error('Stock not found');
    }

    await this.stockRepository.delete(stockId);
  }
}
