import { FastifyRequest, FastifyReply } from 'fastify';
import { PlaceStockOrderUseCase } from '@application/use-cases/PlaceStockOrderUseCase';
import { CalculateStockPriceUseCase } from '@application/use-cases/CalculateStockPriceUseCase';
import { ExecuteOrderUseCase } from '@application/use-cases/ExecuteOrderUseCase';
import { GetMyOrdersUseCase } from '@application/use-cases/GetMyOrdersUseCase';
import { OrderType } from '@domain/entities/Order';

export class OrderController {
  constructor(
    private readonly placeStockOrderUseCase: PlaceStockOrderUseCase,
    private readonly calculateStockPriceUseCase: CalculateStockPriceUseCase,
    private readonly executeOrderUseCase: ExecuteOrderUseCase,
    private readonly getMyOrdersUseCase: GetMyOrdersUseCase,
  ) {}

  async placeOrder(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const body = request.body as {
        userId: string;
        accountId: string;
        stockId: string;
        type: OrderType;
        quantity: number;
        price: number;
      };
      const result = await this.placeStockOrderUseCase.execute(body);
      reply.code(201).send(result);
    } catch (error) {
      reply.code(400).send({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async executeOrder(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const params = request.params as { id: string };
      const body = request.body as { executionPrice: number };
      const result = await this.executeOrderUseCase.execute({
        orderId: params.id,
        executionPrice: body.executionPrice,
      });
      reply.code(200).send(result);
    } catch (error) {
      reply.code(400).send({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async calculatePrice(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const params = request.params as { stockId: string };
      const result = await this.calculateStockPriceUseCase.execute({
        stockId: params.stockId,
      });
      reply.code(200).send(result);
    } catch (error) {
      reply.code(400).send({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMyOrders(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const params = request.params as { userId: string };
      const result = await this.getMyOrdersUseCase.execute({
        userId: params.userId,
      });
      reply.code(200).send(result);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
      reply.code(statusCode).send({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
