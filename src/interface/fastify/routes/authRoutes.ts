import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';

const authController = new AuthController();

export async function authRoutes(fastify: FastifyInstance) {
  // Login endpoints
  fastify.post('/login', async (request, reply) => {
    return authController.loginUser(request as any, reply, fastify);
  });

  fastify.post('/client/login', async (request, reply) => {
    return authController.loginClient(request as any, reply, fastify);
  });

  fastify.post('/advisor/login', async (request, reply) => {
    return authController.loginAdvisor(request as any, reply, fastify);
  });

  fastify.post('/director/login', async (request, reply) => {
    return authController.loginDirector(request as any, reply, fastify);
  });
}
