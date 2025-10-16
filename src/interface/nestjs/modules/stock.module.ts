import { Module } from '@nestjs/common';
import { StockController } from '../controllers/stock.controller';
import { InMemoryStockRepository } from '@infrastructure/repositories/in-memory/InMemoryStockRepository';

const stockRepo = new InMemoryStockRepository();

@Module({
  controllers: [StockController],
  providers: [
    {
      provide: 'IStockRepository',
      useValue: stockRepo,
    },
  ],
})
export class StockModule {}
