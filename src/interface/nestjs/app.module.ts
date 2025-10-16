import { Module } from '@nestjs/common';
import { SavingsModule } from './modules/savings.module';
import { StockModule } from './modules/stock.module';
import { OrderModule } from './modules/order.module';
import { PortfolioModule } from './modules/portfolio.module';

@Module({
  imports: [SavingsModule, StockModule, OrderModule, PortfolioModule],
})
export class AppModule {}
