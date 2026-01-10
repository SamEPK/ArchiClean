import { FastifyPluginAsync } from 'fastify';
import { PortfolioController } from '../controllers/PortfolioController';
import { RepositoryFactory } from '@infrastructure/repositories/RepositoryFactory';
import { GetPortfolioUseCase } from '@application/use-cases/GetPortfolioUseCase';

const factory = RepositoryFactory.getInstance();
const portfolioRepo = factory.getPortfolioRepository();
const stockRepo = factory.getStockRepository();

const getPortfolioUseCase = new GetPortfolioUseCase(portfolioRepo, stockRepo);

const controller = new PortfolioController(getPortfolioUseCase);

export const portfolioRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/:userId', async (request, reply) => {
    return controller.getPortfolio(request, reply);
  });
};
