import { FastifyInstance } from 'fastify';
import { TransactionController } from '../controllers/TransactionController';
import { authenticateJWT } from '../middleware/auth';

const transactionController = new TransactionController();

export async function transactionRoutes(fastify: FastifyInstance) {
  // Transfer funds
  fastify.post('/transfer', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return transactionController.transfer(request as any, reply);
  });

  // Deposit funds
  fastify.post('/deposit', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return transactionController.deposit(request as any, reply);
  });

  // Withdraw funds
  fastify.post('/withdraw', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return transactionController.withdraw(request as any, reply);
  });

  // Get account transactions
  fastify.get('/account/:accountId', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return transactionController.getTransactions(request as any, reply);
  });

  // Get client transaction history
  fastify.get('/history/:clientId', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return transactionController.getClientHistory(request as any, reply);
  });
}
