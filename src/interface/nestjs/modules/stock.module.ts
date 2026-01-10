import { Module } from '@nestjs/common';
import { StockController } from '../controllers/stock.controller';
import { RepositoriesModule, STOCK_REPOSITORY } from './repositories.module';

console.log('[StockModule] Using SINGLETON stock repository from RepositoriesModule');

@Module({
  imports: [RepositoriesModule],
  controllers: [StockController],
  providers: [
    {
      provide: 'IStockRepository',
      useFactory: (stockRepository) => stockRepository,
      inject: [STOCK_REPOSITORY],
    },
  ],
  exports: ['IStockRepository'],
})
export class StockModule {}
