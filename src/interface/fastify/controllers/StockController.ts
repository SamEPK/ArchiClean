import { FastifyRequest, FastifyReply } from 'fastify';
import { IStockRepository } from '@domain/repositories/IStockRepository';

export class StockController {
  constructor(private readonly stockRepository: IStockRepository) {}

  async getAllStocks(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const stocks = await this.stockRepository.findAll();
      reply.code(200).send(stocks);
    } catch (error) {
      reply.code(500).send({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getAvailableStocks(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const stocks = await this.stockRepository.findAvailable();
      reply.code(200).send(stocks);
    } catch (error) {
      reply.code(500).send({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getStockById(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const params = request.params as { id: string };
      const stock = await this.stockRepository.findById(params.id);
      if (!stock) {
        reply.code(404).send({ error: 'Stock not found' });
        return;
      }
      reply.code(200).send(stock);
    } catch (error) {
      reply.code(500).send({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
