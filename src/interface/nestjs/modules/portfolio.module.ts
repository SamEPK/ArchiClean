import { Module } from '@nestjs/common';
import { PortfolioController } from '../controllers/portfolio.controller';
import { GetPortfolioUseCase } from '@application/use-cases/GetPortfolioUseCase';
import { InMemoryPortfolioRepository } from '@infrastructure/repositories/in-memory/InMemoryPortfolioRepository';
import { InMemoryStockRepository } from '@infrastructure/repositories/in-memory/InMemoryStockRepository';

const portfolioRepo = new InMemoryPortfolioRepository();
const stockRepo = new InMemoryStockRepository();

const getPortfolioUseCase = new GetPortfolioUseCase(portfolioRepo, stockRepo);

@Module({
  controllers: [PortfolioController],
  providers: [
    {
      provide: 'GetPortfolioUseCase',
      useValue: getPortfolioUseCase,
    },
  ],
})
export class PortfolioModule {}
