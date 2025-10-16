import { FastifyPluginAsync } from 'fastify';
import { PortfolioController } from '../controllers/PortfolioController';
import { InMemoryPortfolioRepository } from '@infrastructure/repositories/in-memory/InMemoryPortfolioRepository';
import { InMemoryStockRepository } from '@infrastructure/repositories/in-memory/InMemoryStockRepository';
import { GetPortfolioUseCase } from '@application/use-cases/GetPortfolioUseCase';

const portfolioRepo = new InMemoryPortfolioRepository();
const stockRepo = new InMemoryStockRepository();

const getPortfolioUseCase = new GetPortfolioUseCase(portfolioRepo, stockRepo);

const controller = new PortfolioController(getPortfolioUseCase);

export const portfolioRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/:userId', async (request, reply) => {
    return controller.getPortfolio(request, reply);
  });
};
