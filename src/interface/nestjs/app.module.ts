import { Module } from '@nestjs/common';
import { SavingsModule } from './modules/savings.module';
import { StockModule } from './modules/stock.module';
import { OrderModule } from './modules/order.module';
import { PortfolioModule } from './modules/portfolio.module';
import { ClientModule } from './modules/client.module';

@Module({
  imports: [SavingsModule, StockModule, OrderModule, PortfolioModule, ClientModule],
})
export class AppModule {}
