import { Module } from '@nestjs/common';
import { PortfolioController } from '../controllers/portfolio.controller';
import { GetPortfolioUseCase } from '@application/use-cases/GetPortfolioUseCase';
import {
  RepositoriesModule,
  PORTFOLIO_REPOSITORY,
  STOCK_REPOSITORY,
} from './repositories.module';

console.log('[PortfolioModule] Using SINGLETON repositories from RepositoriesModule');

@Module({
  imports: [RepositoriesModule],
  controllers: [PortfolioController],
  providers: [
    {
      provide: 'GetPortfolioUseCase',
      useFactory: (portfolioRepository, stockRepository) =>
        new GetPortfolioUseCase(portfolioRepository, stockRepository),
      inject: [PORTFOLIO_REPOSITORY, STOCK_REPOSITORY],
    },
  ],
})
export class PortfolioModule {}
