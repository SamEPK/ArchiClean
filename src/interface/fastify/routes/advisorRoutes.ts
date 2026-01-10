import { FastifyInstance } from 'fastify';
import { AdvisorController } from '../controllers/AdvisorController';
import { authenticateJWT } from '../middleware/auth';

const advisorController = new AdvisorController();

export async function advisorRoutes(fastify: FastifyInstance) {
  // Authentication
  fastify.post('/register', async (request, reply) => {
    return advisorController.register(request as any, reply);
  });

  fastify.post('/login', async (request, reply) => {
    return advisorController.login(request as any, reply, fastify);
  });

  // Credit Management
  fastify.post('/credits', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return advisorController.grantCredit(request as any, reply);
  });

  fastify.get('/credits/:creditId/schedule', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return advisorController.getCreditSchedule(request as any, reply);
  });

  fastify.get('/clients/:clientId/credits', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return advisorController.listClientCredits(request as any, reply);
  });
}
