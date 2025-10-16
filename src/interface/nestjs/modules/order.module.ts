import { Module } from '@nestjs/common';
import { OrderController } from '../controllers/order.controller';
import { PlaceStockOrderUseCase } from '@application/use-cases/PlaceStockOrderUseCase';
import { CalculateStockPriceUseCase } from '@application/use-cases/CalculateStockPriceUseCase';
import { ExecuteOrderUseCase } from '@application/use-cases/ExecuteOrderUseCase';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/InMemoryOrderRepository';
import { InMemoryStockRepository } from '@infrastructure/repositories/in-memory/InMemoryStockRepository';
import { InMemoryPortfolioRepository } from '@infrastructure/repositories/in-memory/InMemoryPortfolioRepository';

const orderRepo = new InMemoryOrderRepository();
const stockRepo = new InMemoryStockRepository();
const portfolioRepo = new InMemoryPortfolioRepository();

const placeStockOrderUseCase = new PlaceStockOrderUseCase(
  orderRepo,
  stockRepo,
);

const calculateStockPriceUseCase = new CalculateStockPriceUseCase(orderRepo);

const executeOrderUseCase = new ExecuteOrderUseCase(orderRepo, portfolioRepo);

@Module({
  controllers: [OrderController],
  providers: [
    {
      provide: 'PlaceStockOrderUseCase',
      useValue: placeStockOrderUseCase,
    },
    {
      provide: 'CalculateStockPriceUseCase',
      useValue: calculateStockPriceUseCase,
    },
    {
      provide: 'ExecuteOrderUseCase',
      useValue: executeOrderUseCase,
    },
  ],
})
export class OrderModule {}
