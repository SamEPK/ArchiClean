import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DashboardService } from '@application/services/DashboardService';

@ApiTags('Dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private dashboardService: DashboardService,
  ) {}

  @Get('clients')
  @ApiOperation({ summary: 'Lister tous les clients avec leurs soldes' })
  @ApiResponse({ status: 200, description: 'Liste des clients' })
  async listClients() {
    return this.dashboardService.getAllClients();
  }

  @Get('clients/:clientId/profile')
  @ApiOperation({ summary: 'Obtenir le profil complet d\'un client (agrégé)' })
  @ApiResponse({ status: 200, description: 'Profil complet du client' })
  @ApiParam({ name: 'clientId', description: 'ID du client' })
  async getClientProfile(@Param('clientId') clientId: string) {
    return this.dashboardService.getAggregatedClientProfile(clientId);
  }

  @Get('events')
  @ApiOperation({ summary: 'Obtenir la timeline des événements' })
  @ApiResponse({ status: 200, description: 'Timeline des événements' })
  @ApiQuery({ name: 'streamId', required: false, description: 'ID du stream (optionnel)' })
  async getEventTimeline(@Query('streamId') streamId?: string) {
    return this.dashboardService.getEventTimeline(streamId);
  }

  @Post('rebuild-state/:streamId')
  @ApiOperation({ summary: 'Reconstruire l\'état depuis les événements' })
  @ApiResponse({ status: 200, description: 'État reconstruit avec succès' })
  @ApiParam({ name: 'streamId', description: 'ID du stream à reconstruire' })
  async rebuildState(@Param('streamId') streamId: string) {
    return this.dashboardService.rebuildStateFromEvents(streamId);
  }

  @Get('queries/portfolio/:clientId')
  @ApiOperation({ summary: '[QUERY] Obtenir le portfolio d\'un client' })
  @ApiResponse({ status: 200, description: 'Portfolio du client' })
  @ApiParam({ name: 'clientId', description: 'ID du client' })
  async getPortfolio(@Param('clientId') clientId: string) {
    return this.dashboardService.getAggregatedClientProfile(clientId);
  }

  @Post('commands/grant-credit')
  @ApiOperation({ summary: '[COMMAND] Octroyer un crédit' })
  @ApiResponse({ status: 201, description: 'Crédit accordé avec succès' })
  @ApiBody({
    description: 'Informations du crédit',
    schema: {
      type: 'object',
      required: ['clientId', 'amount', 'annualRate', 'insuranceRate', 'durationMonths'],
      properties: {
        clientId: { type: 'string', example: 'client1@test.com' },
        amount: { type: 'number', example: 20000 },
        annualRate: { type: 'number', example: 3.2 },
        insuranceRate: { type: 'number', example: 0.3 },
        durationMonths: { type: 'number', example: 60 },
      },
    },
  })
  async grantCredit(@Body() dto: {
    clientId: string;
    amount: number;
    annualRate: number;
    insuranceRate: number;
    durationMonths: number;
  }) {
    try {
      const GrantCreditCommand = (await import('@application/cqrs/commands/GrantCreditCommand')).GrantCreditCommand;
      const command = new GrantCreditCommand(
        dto.clientId,
        dto.amount,
        dto.annualRate,
        dto.insuranceRate,
        dto.durationMonths
      );
      const result = await this.commandBus.execute(command);

      return {
        success: true,
        message: 'Credit granted successfully',
        credit: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to grant credit',
      };
    }
  }

  @Post('commands/place-order')
  @ApiOperation({ summary: '[COMMAND] Placer un ordre d\'achat/vente' })
  @ApiResponse({ status: 201, description: 'Ordre placé avec succès' })
  @ApiBody({
    description: 'Informations de l\'ordre',
    schema: {
      type: 'object',
      required: ['clientId', 'stockSymbol', 'quantity', 'orderType'],
      properties: {
        clientId: { type: 'string', example: 'client1@test.com' },
        stockSymbol: { type: 'string', example: 'AAPL' },
        quantity: { type: 'number', example: 10 },
        orderType: { type: 'string', enum: ['BUY', 'SELL'], example: 'BUY' },
        limitPrice: { type: 'number', example: 150.50 },
      },
    },
  })
  async placeOrder(@Body() dto: {
    clientId: string;
    stockSymbol: string;
    quantity: number;
    orderType: 'BUY' | 'SELL';
    limitPrice?: number;
  }) {
    try {
      return {
        success: true,
        message: 'Order placed successfully (implementation pending)',
        order: {
          clientId: dto.clientId,
          stockSymbol: dto.stockSymbol,
          quantity: dto.quantity,
          orderType: dto.orderType,
          status: 'PENDING',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to place order',
      };
    }
  }

  @Post('commands/transfer-funds')
  @ApiOperation({ summary: '[COMMAND] Transférer des fonds' })
  @ApiResponse({ status: 201, description: 'Fonds transférés avec succès' })
  @ApiBody({
    description: 'Informations du transfert',
    schema: {
      type: 'object',
      required: ['fromAccountId', 'toAccountId', 'amount'],
      properties: {
        fromAccountId: { type: 'string', example: 'account-123' },
        toAccountId: { type: 'string', example: 'account-456' },
        amount: { type: 'number', example: 500 },
        description: { type: 'string', example: 'Virement mensuel' },
      },
    },
  })
  async transferFunds(@Body() dto: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
  }) {
    try {
      return {
        success: true,
        message: 'Funds transferred successfully (implementation pending)',
        transfer: {
          fromAccountId: dto.fromAccountId,
          toAccountId: dto.toAccountId,
          amount: dto.amount,
          status: 'COMPLETED',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to transfer funds',
      };
    }
  }
}
