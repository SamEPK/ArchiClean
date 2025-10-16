import { FastifyRequest, FastifyReply } from 'fastify';
import { OpenSavingsAccountUseCase } from '@application/use-cases/OpenSavingsAccountUseCase';
import { ApplyDailyInterestUseCase } from '@application/use-cases/ApplyDailyInterestUseCase';

export class SavingsController {
  constructor(
    private readonly openSavingsAccountUseCase: OpenSavingsAccountUseCase,
    private readonly applyDailyInterestUseCase: ApplyDailyInterestUseCase,
  ) {}

  async openSavingsAccount(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const body = request.body as {
        accountId: string;
        interestRate: number;
      };
      const result = await this.openSavingsAccountUseCase.execute(body);
      reply.code(201).send(result);
    } catch (error) {
      reply.code(400).send({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async applyDailyInterest(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const body = request.body as { currentDate?: string };
      const result = await this.applyDailyInterestUseCase.execute({
        currentDate: body.currentDate ? new Date(body.currentDate) : undefined,
      });
      reply.code(200).send(result);
    } catch (error) {
      reply.code(400).send({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
