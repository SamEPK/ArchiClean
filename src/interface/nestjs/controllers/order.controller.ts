import { Controller, Post, Body, Param, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlaceStockOrderUseCase } from '@application/use-cases/PlaceStockOrderUseCase';
import { CalculateStockPriceUseCase } from '@application/use-cases/CalculateStockPriceUseCase';
import { ExecuteOrderUseCase } from '@application/use-cases/ExecuteOrderUseCase';
import { OrderType } from '@domain/entities/Order';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(
    @Inject('PlaceStockOrderUseCase')
    private readonly placeStockOrderUseCase: PlaceStockOrderUseCase,
    @Inject('CalculateStockPriceUseCase')
    private readonly calculateStockPriceUseCase: CalculateStockPriceUseCase,
    @Inject('ExecuteOrderUseCase')
    private readonly executeOrderUseCase: ExecuteOrderUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Place a new stock order' })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  async placeOrder(
    @Body()
    body: {
      userId: string;
      stockId: string;
      type: OrderType;
      quantity: number;
      price: number;
    },
  ) {
    return await this.placeStockOrderUseCase.execute(body);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute a pending order' })
  @ApiResponse({ status: 200, description: 'Order executed' })
  async executeOrder(
    @Param('id') id: string,
    @Body() body: { executionPrice: number },
  ) {
    return await this.executeOrderUseCase.execute({
      orderId: id,
      executionPrice: body.executionPrice,
    });
  }

  @Get('stock/:stockId/price')
  @ApiOperation({ summary: 'Calculate equilibrium price for a stock' })
  @ApiResponse({ status: 200, description: 'Price calculation result' })
  async calculatePrice(@Param('stockId') stockId: string) {
    return await this.calculateStockPriceUseCase.execute({ stockId });
  }
}
