import { FastifyPluginAsync } from 'fastify';
import { StockController } from '../controllers/StockController';
import { RepositoryFactory } from '@infrastructure/repositories/RepositoryFactory';

const factory = RepositoryFactory.getInstance();
const stockRepo = factory.getStockRepository();
const controller = new StockController(stockRepo);

export const stockRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    return controller.getAllStocks(request, reply);
  });

  fastify.get('/available', async (request, reply) => {
    return controller.getAvailableStocks(request, reply);
  });

  fastify.get('/:id', async (request, reply) => {
    return controller.getStockById(request, reply);
  });
};
