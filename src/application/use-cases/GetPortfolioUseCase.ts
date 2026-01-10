import { Portfolio } from '@domain/entities/Portfolio';
import { IPortfolioRepository } from '@domain/repositories/IPortfolioRepository';
import { IStockRepository } from '@domain/repositories/IStockRepository';

export interface GetPortfolioRequest {
  userId: string;
}

export interface PortfolioItem {
  stockId: string;
  stockSymbol: string;
  stockName: string;
  quantity: number;
  averagePurchasePrice: number;
  currentPrice?: number;
  totalValue?: number;
  profit?: number;
}

export interface GetPortfolioResponse {
  userId: string;
  items: PortfolioItem[];
  totalValue: number;
  totalProfit: number;
}

export class GetPortfolioUseCase {
  constructor(
    private readonly portfolioRepository: IPortfolioRepository,
    private readonly stockRepository: IStockRepository,
  ) {}

  async execute(request: GetPortfolioRequest): Promise<GetPortfolioResponse> {
    const portfolios = await this.portfolioRepository.findByUserId(
      request.userId,
    );

    const items: PortfolioItem[] = [];
    let totalValue = 0;
    let totalProfit = 0;

    for (const portfolio of portfolios) {
      const stock = await this.stockRepository.findById(portfolio.stockId);

      if (!stock) {
        continue;
      }

      // TODO Phase 2: Add getCurrentPrice() to stock repository for real-time prices
      // For now, using average purchase price as current price placeholder
      const currentPrice = portfolio.averagePurchasePrice;

      const totalStockValue = currentPrice * portfolio.quantity;
      const totalCost = portfolio.averagePurchasePrice * portfolio.quantity;
      const stockProfit = totalStockValue - totalCost;

      const item: PortfolioItem = {
        stockId: portfolio.stockId,
        stockSymbol: stock.symbol,
        stockName: stock.name,
        quantity: portfolio.quantity,
        averagePurchasePrice: portfolio.averagePurchasePrice,
        currentPrice,
        totalValue: totalStockValue,
        profit: stockProfit,
      };

      items.push(item);
      totalValue += totalStockValue;
      totalProfit += stockProfit;
    }

    return {
      userId: request.userId,
      items,
      totalValue,
      totalProfit,
    };
  }
}
