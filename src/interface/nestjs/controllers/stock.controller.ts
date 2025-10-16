import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IStockRepository } from '@domain/repositories/IStockRepository';

@ApiTags('stocks')
@Controller('stocks')
export class StockController {
  constructor(
    @Inject('IStockRepository')
    private readonly stockRepository: IStockRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all stocks' })
  @ApiResponse({ status: 200, description: 'List of all stocks' })
  async getAllStocks() {
    return await this.stockRepository.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available stocks for trading' })
  @ApiResponse({ status: 200, description: 'List of available stocks' })
  async getAvailableStocks() {
    return await this.stockRepository.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock by ID' })
  @ApiResponse({ status: 200, description: 'Stock details' })
  @ApiResponse({ status: 404, description: 'Stock not found' })
  async getStockById(@Param('id') id: string) {
    const stock = await this.stockRepository.findById(id);
    if (!stock) {
      throw new Error('Stock not found');
    }
    return stock;
  }
}
