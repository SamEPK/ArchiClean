import { FastifyPluginAsync } from 'fastify';
import { SavingsController } from '../controllers/SavingsController';
import { InMemorySavingsAccountRepository } from '@infrastructure/repositories/in-memory/InMemorySavingsAccountRepository';
import { OpenSavingsAccountUseCase } from '@application/use-cases/OpenSavingsAccountUseCase';
import { ApplyDailyInterestUseCase } from '@application/use-cases/ApplyDailyInterestUseCase';

const savingsAccountRepo = new InMemorySavingsAccountRepository();
const openSavingsAccountUseCase = new OpenSavingsAccountUseCase(
  savingsAccountRepo,
);
const applyDailyInterestUseCase = new ApplyDailyInterestUseCase(
  savingsAccountRepo,
);

const controller = new SavingsController(
  openSavingsAccountUseCase,
  applyDailyInterestUseCase,
);

export const savingsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    return controller.openSavingsAccount(request, reply);
  });

  fastify.post('/apply-interest', async (request, reply) => {
    return controller.applyDailyInterest(request, reply);
  });
};
