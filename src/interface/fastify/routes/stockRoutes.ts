import { FastifyPluginAsync } from 'fastify';
import { StockController } from '../controllers/StockController';
import { InMemoryStockRepository } from '@infrastructure/repositories/in-memory/InMemoryStockRepository';

const stockRepo = new InMemoryStockRepository();
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
