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

      const item: PortfolioItem = {
        stockId: portfolio.stockId,
        stockSymbol: stock.symbol,
        stockName: stock.name,
        quantity: portfolio.quantity,
        averagePurchasePrice: portfolio.averagePurchasePrice,
      };

      items.push(item);
    }

    return {
      userId: request.userId,
      items,
      totalValue,
      totalProfit,
    };
  }
}
