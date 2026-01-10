import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterAdvisorUseCase } from '@application/use-cases/RegisterAdvisorUseCase';
import { AuthenticateAdvisorUseCase } from '@application/use-cases/AuthenticateAdvisorUseCase';
import { GetCreditScheduleUseCase } from '@application/use-cases/GetCreditScheduleUseCase';
import { GrantCredit } from '@application/use-cases/GrantCredit';
import { Credit } from '@domain/entities/Credit';
import { RepositoryFactory } from '@infrastructure/repositories/RepositoryFactory';
import { v4 as uuidv4 } from 'uuid';

const factory = RepositoryFactory.getInstance();

// Initialize repositories
const advisorRepo = factory.getAdvisorRepository();
const creditRepo = factory.getCreditRepository();

// Initialize use cases
const registerAdvisorUseCase = new RegisterAdvisorUseCase(advisorRepo);
const authenticateAdvisorUseCase = new AuthenticateAdvisorUseCase(advisorRepo);
const getCreditScheduleUseCase = new GetCreditScheduleUseCase(creditRepo);
const grantCreditUseCase = new GrantCredit(creditRepo);

interface RegisterAdvisorBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginAdvisorBody {
  email: string;
  password: string;
}

interface GrantCreditBody {
  clientId: string;
  amount: number;
  annualRate: number;
  insuranceRate: number;
  durationMonths: number;
}

export class AdvisorController {
  async register(request: FastifyRequest<{ Body: RegisterAdvisorBody }>, reply: FastifyReply) {
    try {
      const { email, password, firstName, lastName } = request.body;
      const advisor = await registerAdvisorUseCase.execute(email, password, firstName, lastName);

      return reply.status(201).send({
        success: true,
        message: 'Advisor registered successfully',
        advisor: {
          id: advisor.id,
          email: advisor.email,
          firstName: advisor.firstName,
          lastName: advisor.lastName,
          createdAt: advisor.createdAt,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  async login(
    request: FastifyRequest<{ Body: LoginAdvisorBody }>,
    reply: FastifyReply,
    fastify: any
  ) {
    try {
      const { email, password } = request.body;
      const result = await authenticateAdvisorUseCase.execute(email, password);

      if (result.success && result.advisor) {
        const token = fastify.jwt.sign({
          id: result.advisor.id,
          email: result.advisor.email,
          role: 'advisor',
        });

        return reply.send({
          success: true,
          message: result.message,
          token,
          advisor: {
            id: result.advisor.id,
            email: result.advisor.email,
            firstName: result.advisor.firstName,
            lastName: result.advisor.lastName,
          },
        });
      }

      return reply.status(401).send({
        success: false,
        message: result.message,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  }

  async grantCredit(request: FastifyRequest<{ Body: GrantCreditBody }>, reply: FastifyReply) {
    try {
      const { clientId, amount, annualRate, insuranceRate, durationMonths } = request.body;

      const credit = new Credit({
        id: uuidv4(),
        userId: clientId,
        amount,
        annualRate,
        insuranceRate,
      });

      await grantCreditUseCase.execute(credit, durationMonths);

      return reply.status(201).send({
        success: true,
        message: 'Crédit accordé avec succès',
        credit: {
          id: credit.id,
          userId: credit.userId,
          amount: credit.amount,
          annualRate: credit.annualRate,
          insuranceRate: credit.insuranceRate,
          monthlyPayment: credit.monthlyPayment,
          durationMonths,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to grant credit',
      });
    }
  }

  async getCreditSchedule(
    request: FastifyRequest<{ Params: { creditId: string }; Querystring: { durationMonths?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { creditId } = request.params;
      const durationMonths = request.query.durationMonths ? parseInt(request.query.durationMonths) : 60;

      const schedule = await getCreditScheduleUseCase.execute(creditId, durationMonths);

      return reply.send({
        success: true,
        schedule,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get credit schedule',
      });
    }
  }

  async listClientCredits(
    request: FastifyRequest<{ Params: { clientId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { clientId } = request.params;
      const credits = await creditRepo.findByUserId(clientId);

      return reply.send({
        success: true,
        credits: credits.map(credit => ({
          id: credit.id,
          userId: credit.userId,
          amount: credit.amount,
          annualRate: credit.annualRate,
          insuranceRate: credit.insuranceRate,
          monthlyPayment: credit.monthlyPayment,
          remainingBalance: credit.remainingBalance,
        })),
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list credits',
      });
    }
  }
}
