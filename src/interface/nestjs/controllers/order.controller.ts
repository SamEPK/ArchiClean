import { Controller, Post, Body, Param, Get, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlaceStockOrderUseCase } from '@application/use-cases/PlaceStockOrderUseCase';
import { CalculateStockPriceUseCase } from '@application/use-cases/CalculateStockPriceUseCase';
import { ExecuteOrderUseCase } from '@application/use-cases/ExecuteOrderUseCase';
import { GetMyOrdersUseCase } from '@application/use-cases/GetMyOrdersUseCase';
import { PlaceOrderDto } from '../dto/order/place-order.dto';
import { ExecuteOrderDto } from '../dto/order/execute-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(
    @Inject('PlaceStockOrderUseCase')
    private readonly placeStockOrderUseCase: PlaceStockOrderUseCase,
    @Inject('CalculateStockPriceUseCase')
    private readonly calculateStockPriceUseCase: CalculateStockPriceUseCase,
    @Inject('ExecuteOrderUseCase')
    private readonly executeOrderUseCase: ExecuteOrderUseCase,
    @Inject('GetMyOrdersUseCase')
    private readonly getMyOrdersUseCase: GetMyOrdersUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Passer un ordre d\'achat/vente', description: 'Créer un nouvel ordre d\'achat ou de vente d\'actions' })
  @ApiResponse({ status: 201, description: 'Ordre créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides (stock introuvable, quantité invalide, etc.)' })
  async placeOrder(@Body() body: PlaceOrderDto) {
    try {
      return await this.placeStockOrderUseCase.execute(body);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error instanceof Error ? error.message : 'Invalid order request');
    }
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Exécuter un ordre', description: 'Exécuter un ordre en attente au prix spécifié' })
  @ApiResponse({ status: 200, description: 'Ordre exécuté avec succès' })
  @ApiResponse({ status: 404, description: 'Ordre introuvable' })
  async executeOrder(
    @Param('id') id: string,
    @Body() body: ExecuteOrderDto,
  ) {
    try {
      return await this.executeOrderUseCase.execute({
        orderId: id,
        executionPrice: body.executionPrice,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error instanceof Error ? error.message : 'Invalid execution request');
    }
  }

  @Get('stock/:stockId/price')
  @ApiOperation({ summary: 'Calculer le prix d\'équilibre', description: 'Calculer le prix d\'équilibre d\'une action basé sur l\'offre et la demande' })
  @ApiResponse({ status: 200, description: 'Résultat du calcul de prix' })
  async calculatePrice(@Param('stockId') stockId: string) {
    try {
      return await this.calculateStockPriceUseCase.execute({ stockId });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error instanceof Error ? error.message : 'Invalid price calculation request');
    }
  }

  @Get('my/:userId')
  @ApiOperation({ summary: 'Mes ordres', description: 'Récupérer tous les ordres d\'un utilisateur avec détails des actions' })
  @ApiResponse({ status: 200, description: 'Liste des ordres de l\'utilisateur' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async getMyOrders(@Param('userId') userId: string) {
    try {
      return await this.getMyOrdersUseCase.execute({ userId });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to retrieve orders');
    }
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Ordres d\'un client', description: 'Récupérer tous les ordres d\'un client avec détails des actions' })
  @ApiResponse({ status: 200, description: 'Liste des ordres du client' })
  @ApiResponse({ status: 404, description: 'Client introuvable' })
  async getClientOrders(@Param('clientId') clientId: string) {
    try {
      return await this.getMyOrdersUseCase.execute({ userId: clientId });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to retrieve orders');
    }
  }
}
