import { OrderType } from '@domain/entities/Order';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';

export interface CalculateStockPriceRequest {
  stockId: string;
}

export interface CalculateStockPriceResponse {
  equilibriumPrice: number | null;
  matchableVolume: number;
  buyOrders: number;
  sellOrders: number;
}

export class CalculateStockPriceUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(
    request: CalculateStockPriceRequest,
  ): Promise<CalculateStockPriceResponse> {
    const buyOrders = await this.orderRepository.findPendingOrdersByStock(
      request.stockId,
      OrderType.BUY,
    );
    const sellOrders = await this.orderRepository.findPendingOrdersByStock(
      request.stockId,
      OrderType.SELL,
    );

    buyOrders.sort((a, b) => b.price - a.price);
    sellOrders.sort((a, b) => a.price - b.price);

    const equilibrium = this.findEquilibriumPrice(buyOrders, sellOrders);

    return {
      equilibriumPrice: equilibrium.price,
      matchableVolume: equilibrium.volume,
      buyOrders: buyOrders.length,
      sellOrders: sellOrders.length,
    };
  }

  private findEquilibriumPrice(
    buyOrders: Array<{ price: number; quantity: number }>,
    sellOrders: Array<{ price: number; quantity: number }>,
  ): { price: number | null; volume: number } {
    if (buyOrders.length === 0 || sellOrders.length === 0) {
      return { price: null, volume: 0 };
    }

    const highestBuy = buyOrders[0].price;
    const lowestSell = sellOrders[0].price;

    if (highestBuy < lowestSell) {
      return { price: null, volume: 0 };
    }

    const equilibriumPrice = (highestBuy + lowestSell) / 2;
    const volume = this.calculateMatchableVolume(
      buyOrders,
      sellOrders,
      equilibriumPrice,
    );

    return { price: equilibriumPrice, volume };
  }

  private calculateMatchableVolume(
    buyOrders: Array<{ price: number; quantity: number }>,
    sellOrders: Array<{ price: number; quantity: number }>,
    price: number,
  ): number {
    const buyVolume = buyOrders
      .filter((o) => o.price >= price)
      .reduce((sum, o) => sum + o.quantity, 0);

    const sellVolume = sellOrders
      .filter((o) => o.price <= price)
      .reduce((sum, o) => sum + o.quantity, 0);

    return Math.min(buyVolume, sellVolume);
  }
}
