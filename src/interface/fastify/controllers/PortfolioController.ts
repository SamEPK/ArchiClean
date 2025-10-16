import { FastifyRequest, FastifyReply } from 'fastify';
import { GetPortfolioUseCase } from '@application/use-cases/GetPortfolioUseCase';

export class PortfolioController {
  constructor(private readonly getPortfolioUseCase: GetPortfolioUseCase) {}

  async getPortfolio(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const params = request.params as { userId: string };
      const result = await this.getPortfolioUseCase.execute({
        userId: params.userId,
      });
      reply.code(200).send(result);
    } catch (error) {
      reply.code(500).send({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
