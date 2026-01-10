import { Controller, Get, Param, Inject, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IStockRepository } from '@domain/repositories/IStockRepository';

@ApiTags('Stocks')
@Controller('stocks')
export class StockController {
  constructor(
    @Inject('IStockRepository')
    private readonly stockRepository: IStockRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les actions', description: 'Récupérer la liste complète des actions disponibles dans le système' })
  @ApiResponse({ status: 200, description: 'Liste de toutes les actions' })
  async getAllStocks() {
    return await this.stockRepository.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Actions disponibles', description: 'Récupérer uniquement les actions disponibles pour l\'achat/vente' })
  @ApiResponse({ status: 200, description: 'Liste des actions disponibles' })
  async getAvailableStocks() {
    return await this.stockRepository.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'une action', description: 'Récupérer les informations détaillées d\'une action par son ID' })
  @ApiResponse({ status: 200, description: 'Détails de l\'action' })
  @ApiResponse({ status: 404, description: 'Action introuvable' })
  async getStockById(@Param('id') id: string) {
    const stock = await this.stockRepository.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    return stock;
  }
}
