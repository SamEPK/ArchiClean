import { FastifyInstance } from 'fastify';
import { ClientController } from '../controllers/ClientController';
import { authenticateJWT } from '../middleware/auth';

const clientController = new ClientController();

export async function clientRoutes(fastify: FastifyInstance) {
  // Client registration and authentication
  fastify.post('/register', async (request, reply) => {
    return clientController.register(request as any, reply);
  });

  fastify.get('/confirm-email', async (request, reply) => {
    return clientController.confirmEmail(request as any, reply);
  });

  fastify.post('/login', async (request, reply) => {
    return clientController.login(request as any, reply, fastify);
  });

  // Get all clients (for director/advisor dashboard)
  fastify.get('/', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return clientController.getAllClients(request, reply);
  });

  // Get client profile
  fastify.get('/:id', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return clientController.getProfile(request as any, reply);
  });

  // Bank account management
  fastify.post('/:clientId/accounts', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return clientController.createBankAccount(request as any, reply);
  });

  fastify.get('/:clientId/accounts', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return clientController.listBankAccounts(request as any, reply);
  });

  fastify.put('/:clientId/accounts/:accountId', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return clientController.updateBankAccountName(request as any, reply);
  });

  fastify.delete('/:clientId/accounts/:accountId', {
    preHandler: [authenticateJWT],
  }, async (request, reply) => {
    return clientController.deleteBankAccount(request as any, reply);
  });
}
