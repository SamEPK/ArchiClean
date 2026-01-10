import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DashboardController } from '../controllers/dashboard.controller';
import { SystemController } from '../controllers/system.controller';
import { DashboardService } from '@application/services/DashboardService';
import { ClientModule } from './client.module';
import { OrderModule } from './order.module';
import { AdvisorModule } from './advisor.module';
import { TransactionModule } from './transaction.module';
import { PortfolioModule } from './portfolio.module';
import { InMemoryEventStore } from '@infrastructure/event-store/InMemoryEventStore';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/InMemoryOrderRepository';
import { InMemoryBankAccountRepository } from '@infrastructure/repositories/in-memory/InMemoryBankAccountRepository';
import { InMemoryCreditRepository } from '@infrastructure/repositories/in-memory/InMemoryCreditRepository';
import { EVENT_STORE } from '@domain/events/DomainEvent';

const orderRepository = new InMemoryOrderRepository();
const bankAccountRepository = new InMemoryBankAccountRepository();
const creditRepository = new InMemoryCreditRepository();

@Module({
  imports: [
    CqrsModule,
    ClientModule,
    OrderModule,
    AdvisorModule,
    TransactionModule,
    PortfolioModule,
  ],
  controllers: [DashboardController, SystemController],
  providers: [
    DashboardService,
    {
      provide: EVENT_STORE,
      useClass: InMemoryEventStore,
    },
    {
      provide: 'IOrderRepository',
      useValue: orderRepository,
    },
    {
      provide: 'IBankAccountRepository',
      useValue: bankAccountRepository,
    },
    {
      provide: 'ICreditRepository',
      useValue: creditRepository,
    },
  ],
  exports: [DashboardService],
})
export class DashboardModule {}
