import { Module } from '@nestjs/common';
import { OrderController } from '../controllers/order.controller';
import { PlaceStockOrderUseCase } from '@application/use-cases/PlaceStockOrderUseCase';
import { CalculateStockPriceUseCase } from '@application/use-cases/CalculateStockPriceUseCase';
import { ExecuteOrderUseCase } from '@application/use-cases/ExecuteOrderUseCase';
import { GetMyOrdersUseCase } from '@application/use-cases/GetMyOrdersUseCase';
import {
  RepositoriesModule,
  ORDER_REPOSITORY,
  STOCK_REPOSITORY,
  PORTFOLIO_REPOSITORY,
  BANK_ACCOUNT_REPOSITORY,
  TRANSACTION_REPOSITORY,
} from './repositories.module';

console.log('[OrderModule] Using SINGLETON repositories from RepositoriesModule');

@Module({
  imports: [RepositoriesModule],
  controllers: [OrderController],
  providers: [
    {
      provide: 'PlaceStockOrderUseCase',
      useFactory: (orderRepository, stockRepository, bankAccountRepository, transactionRepository) =>
        new PlaceStockOrderUseCase(orderRepository, stockRepository, bankAccountRepository, transactionRepository),
      inject: [ORDER_REPOSITORY, STOCK_REPOSITORY, BANK_ACCOUNT_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: 'CalculateStockPriceUseCase',
      useFactory: (orderRepository) => new CalculateStockPriceUseCase(orderRepository),
      inject: [ORDER_REPOSITORY],
    },
    {
      provide: 'ExecuteOrderUseCase',
      useFactory: (orderRepository, portfolioRepository, bankAccountRepository, transactionRepository) =>
        new ExecuteOrderUseCase(orderRepository, portfolioRepository, bankAccountRepository, transactionRepository),
      inject: [ORDER_REPOSITORY, PORTFOLIO_REPOSITORY, BANK_ACCOUNT_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: 'GetMyOrdersUseCase',
      useFactory: (orderRepository, stockRepository) =>
        new GetMyOrdersUseCase(orderRepository, stockRepository),
      inject: [ORDER_REPOSITORY, STOCK_REPOSITORY],
    },
  ],
})
export class OrderModule {}
