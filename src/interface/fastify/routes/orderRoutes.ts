import { FastifyPluginAsync } from 'fastify';
import { OrderController } from '../controllers/OrderController';
import { RepositoryFactory } from '@infrastructure/repositories/RepositoryFactory';
import { PlaceStockOrderUseCase } from '@application/use-cases/PlaceStockOrderUseCase';
import { CalculateStockPriceUseCase } from '@application/use-cases/CalculateStockPriceUseCase';
import { ExecuteOrderUseCase } from '@application/use-cases/ExecuteOrderUseCase';
import { GetMyOrdersUseCase } from '@application/use-cases/GetMyOrdersUseCase';

const factory = RepositoryFactory.getInstance();
const orderRepo = factory.getOrderRepository();
const stockRepo = factory.getStockRepository();
const portfolioRepo = factory.getPortfolioRepository();
const bankAccountRepo = factory.getBankAccountRepository();
const transactionRepo = factory.getTransactionRepository();

const placeStockOrderUseCase = new PlaceStockOrderUseCase(
  orderRepo,
  stockRepo,
  bankAccountRepo,
  transactionRepo,
);
const calculateStockPriceUseCase = new CalculateStockPriceUseCase(orderRepo);
const executeOrderUseCase = new ExecuteOrderUseCase(
  orderRepo,
  portfolioRepo,
  bankAccountRepo,
  transactionRepo,
);
const getMyOrdersUseCase = new GetMyOrdersUseCase(
  orderRepo,
  stockRepo,
);

const controller = new OrderController(
  placeStockOrderUseCase,
  calculateStockPriceUseCase,
  executeOrderUseCase,
  getMyOrdersUseCase,
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

  fastify.get('/my/:userId', async (request, reply) => {
    return controller.getMyOrders(request, reply);
  });
};
