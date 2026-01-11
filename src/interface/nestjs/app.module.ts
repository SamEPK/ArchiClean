import { Module } from '@nestjs/common';
import { RepositoriesModule } from './modules/repositories.module';
import { SavingsModule } from './modules/savings.module';
import { StockModule } from './modules/stock.module';
import { OrderModule } from './modules/order.module';
import { PortfolioModule } from './modules/portfolio.module';
import { ClientModule } from './modules/client.module';
import { MessagingRealtimeModule } from './modules/messaging-realtime.module';
import { AuthModule } from './modules/auth.module';
import { TransactionModule } from './modules/transaction.module';
import { AdvisorModule } from './modules/advisor.module';
import { DirectorModule } from './modules/director.module';
import { DashboardModule } from './modules/dashboard.module';
import { SSEModule } from './modules/sse.module';

@Module({
  imports: [
    RepositoriesModule, // IMPORTANT: En premier pour assurer les singletons
    AuthModule,
    SavingsModule,
    StockModule,
    OrderModule,
    PortfolioModule,
    ClientModule,
    MessagingRealtimeModule,
    TransactionModule,
    AdvisorModule,
    DirectorModule,
    DashboardModule, // Pedagogical dashboard for NestJS demonstration
    SSEModule, // Feed actualités + Notifications en SSE (Server-Sent Events)
  ],
})
export class AppModule {}
