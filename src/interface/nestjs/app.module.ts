import { Module } from '@nestjs/common';
import { SavingsModule } from './modules/savings.module';
import { StockModule } from './modules/stock.module';
import { OrderModule } from './modules/order.module';
import { PortfolioModule } from './modules/portfolio.module';
import { ClientModule } from './modules/client.module';
import { MessagingRealtimeModule } from './modules/messaging-realtime.module';

@Module({
  imports: [SavingsModule, StockModule, OrderModule, PortfolioModule, ClientModule, MessagingRealtimeModule],
})
export class AppModule {}
