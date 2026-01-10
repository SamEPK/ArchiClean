import { FastifyInstance } from 'fastify';
import { DirectorController } from '../controllers/DirectorController';
import { authenticateJWT } from '../middleware/auth';

const directorController = new DirectorController();

export async function directorRoutes(fastify: FastifyInstance) {
  // Stock Management
  fastify.post('/stocks', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return directorController.createStock(request as any, reply);
  });

  fastify.put('/stocks/:stockId', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return directorController.updateStock(request as any, reply);
  });

  fastify.delete('/stocks/:stockId', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return directorController.deleteStock(request as any, reply);
  });

  fastify.put('/stocks/:stockId/availability', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return directorController.toggleStockAvailability(request as any, reply);
  });

  // Savings Interest Rate
  fastify.put('/savings/interest-rate', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return directorController.updateInterestRate(request as any, reply);
  });

  // Client Management
  fastify.post('/clients', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return directorController.createClient(request as any, reply);
  });

  fastify.put('/clients/:clientId', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return directorController.updateClient(request as any, reply);
  });

  fastify.delete('/clients/:clientId', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return directorController.deleteClient(request as any, reply);
  });

  fastify.post('/clients/:clientId/ban', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return directorController.banClient(request as any, reply);
  });
}
