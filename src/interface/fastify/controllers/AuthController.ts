import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LoginUserUseCase } from '../../../application/use-cases/LoginUserUseCase';
import { AuthenticateClientUseCase } from '../../../application/use-cases/AuthenticateClientUseCase';
import { AuthenticateAdvisorUseCase } from '../../../application/use-cases/AuthenticateAdvisorUseCase';
import { AuthenticateDirector } from '../../../application/use-cases/AuthenticateDirector';
import { RepositoryFactory } from '../../../infrastructure/repositories/RepositoryFactory';
import { HashService } from '../../../infrastructure/services/HashService';

const factory = RepositoryFactory.getInstance();
const userRepo = factory.getUserRepository();
const clientRepo = factory.getClientRepository();
const advisorRepo = factory.getAdvisorRepository();
const adminRepo = factory.getAdminRepository();
const hashService = new HashService();

const loginUserUseCase = new LoginUserUseCase(userRepo, hashService);
const authenticateClientUseCase = new AuthenticateClientUseCase(clientRepo);
const authenticateAdvisorUseCase = new AuthenticateAdvisorUseCase(advisorRepo);
const authenticateDirectorUseCase = new AuthenticateDirector(adminRepo);

interface LoginBody {
  email: string;
  password: string;
}

interface ClientRegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export class AuthController {
  async loginUser(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply, fastify: FastifyInstance) {
    try {
      const { email, password } = request.body;
      const result = await loginUserUseCase.execute({ email, password });

      const token = fastify.jwt.sign({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      });

      return reply.code(200).send({
        accessToken: token,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
        },
      });
    } catch (error) {
      return reply.code(401).send({
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Invalid credentials',
      });
    }
  }

  async loginClient(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply, fastify: FastifyInstance) {
    try {
      const { email, password } = request.body;
      const result = await authenticateClientUseCase.execute(email, password);

      if (!result.success || !result.client) {
        return reply.code(401).send({
          error: 'Authentication failed',
          message: result.message,
        });
      }

      const token = fastify.jwt.sign({
        id: result.client.id,
        email: result.client.email,
        role: 'client',
      });

      return reply.code(200).send({
        accessToken: token,
        client: {
          id: result.client.id,
          email: result.client.email,
          firstName: result.client.firstName,
          lastName: result.client.lastName,
        },
      });
    } catch (error) {
      return reply.code(401).send({
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Invalid credentials',
      });
    }
  }

  async loginAdvisor(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply, fastify: FastifyInstance) {
    try {
      const { email, password } = request.body;
      const result = await authenticateAdvisorUseCase.execute(email, password);

      if (!result.success || !result.advisor) {
        return reply.code(401).send({
          error: 'Authentication failed',
          message: result.message,
        });
      }

      const token = fastify.jwt.sign({
        id: result.advisor.id,
        email: result.advisor.email,
        role: 'advisor',
      });

      return reply.code(200).send({
        accessToken: token,
        advisor: {
          id: result.advisor.id,
          email: result.advisor.email,
          firstName: result.advisor.firstName,
          lastName: result.advisor.lastName,
        },
      });
    } catch (error) {
      return reply.code(401).send({
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Invalid credentials',
      });
    }
  }

  async loginDirector(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply, fastify: FastifyInstance) {
    try {
      const { email, password } = request.body;
      const director = await authenticateDirectorUseCase.execute(email, password);

      if (!director) {
        return reply.code(401).send({
          error: 'Authentication failed',
          message: 'Invalid credentials',
        });
      }

      const token = fastify.jwt.sign({
        id: director.id,
        email: director.email,
        role: 'director',
      });

      return reply.code(200).send({
        accessToken: token,
        director: {
          id: director.id,
          email: director.email,
          firstName: director.firstName,
          lastName: director.lastName,
        },
      });
    } catch (error) {
      return reply.code(401).send({
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Invalid credentials',
      });
    }
  }
}
