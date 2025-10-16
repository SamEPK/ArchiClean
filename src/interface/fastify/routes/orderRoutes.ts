import { FastifyPluginAsync } from 'fastify';
import { OrderController } from '../controllers/OrderController';
import { InMemoryOrderRepository } from '@infrastructure/repositories/in-memory/InMemoryOrderRepository';
import { InMemoryStockRepository } from '@infrastructure/repositories/in-memory/InMemoryStockRepository';
import { InMemoryPortfolioRepository } from '@infrastructure/repositories/in-memory/InMemoryPortfolioRepository';
import { PlaceStockOrderUseCase } from '@application/use-cases/PlaceStockOrderUseCase';
import { CalculateStockPriceUseCase } from '@application/use-cases/CalculateStockPriceUseCase';
import { ExecuteOrderUseCase } from '@application/use-cases/ExecuteOrderUseCase';

const orderRepo = new InMemoryOrderRepository();
const stockRepo = new InMemoryStockRepository();
const portfolioRepo = new InMemoryPortfolioRepository();

const placeStockOrderUseCase = new PlaceStockOrderUseCase(
  orderRepo,
  stockRepo,
);
const calculateStockPriceUseCase = new CalculateStockPriceUseCase(orderRepo);
const executeOrderUseCase = new ExecuteOrderUseCase(orderRepo, portfolioRepo);

const controller = new OrderController(
  placeStockOrderUseCase,
  calculateStockPriceUseCase,
  executeOrderUseCase,
);

export const orderRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    return controller.placeOrder(request, reply);
  });

  fastify.post('/:id/execute', async (request, reply) => {
    return controller.executeOrder(request, reply);
  });

  fastify.get('/stock/:stockId/price', async (request, reply) => {
    return controller.calculatePrice(request, reply);
  });
};
