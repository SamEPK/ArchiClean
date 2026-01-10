import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateStockUseCase } from '@application/use-cases/CreateStockUseCase';
import { UpdateStockUseCase } from '@application/use-cases/UpdateStockUseCase';
import { DeleteStockUseCase } from '@application/use-cases/DeleteStockUseCase';
import { ToggleStockAvailabilityUseCase } from '@application/use-cases/ToggleStockAvailabilityUseCase';
import { UpdateSavingsInterestRateUseCase } from '@application/use-cases/UpdateSavingsInterestRateUseCase';
import { CreateClientByDirectorUseCase } from '@application/use-cases/CreateClientByDirectorUseCase';
import { UpdateClientByDirectorUseCase } from '@application/use-cases/UpdateClientByDirectorUseCase';
import { DeleteClientByDirectorUseCase } from '@application/use-cases/DeleteClientByDirectorUseCase';
import { BanClientUseCase } from '@application/use-cases/BanClientUseCase';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@domain/entities/User';
import { CreateStockDto } from '../dto/director/create-stock.dto';
import { UpdateStockDto } from '../dto/director/update-stock.dto';
import { ToggleStockAvailabilityDto } from '../dto/director/toggle-stock-availability.dto';
import { UpdateSavingsRateDto } from '../dto/director/update-savings-rate.dto';
import { CreateClientByDirectorDto } from '../dto/director/create-client-by-director.dto';
import { UpdateClientByDirectorDto } from '../dto/director/update-client-by-director.dto';
import { BanClientDto } from '../dto/director/ban-client.dto';
import { IAdvisorRepository } from '@domain/repositories/IAdvisorRepository';

@ApiTags('Director')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DIRECTOR)
@Controller('director')
export class DirectorController {
  constructor(
    private createStockUseCase: CreateStockUseCase,
    private updateStockUseCase: UpdateStockUseCase,
    private deleteStockUseCase: DeleteStockUseCase,
    private toggleStockAvailabilityUseCase: ToggleStockAvailabilityUseCase,
    private updateSavingsInterestRateUseCase: UpdateSavingsInterestRateUseCase,
    private createClientByDirectorUseCase: CreateClientByDirectorUseCase,
    private updateClientByDirectorUseCase: UpdateClientByDirectorUseCase,
    private deleteClientByDirectorUseCase: DeleteClientByDirectorUseCase,
    private banClientUseCase: BanClientUseCase,
    @Inject('IAdvisorRepository')
    private advisorRepository: IAdvisorRepository
  ) {}

  @Post('stocks') 
  @ApiOperation({
    summary: 'Créer une action',
    description: 'Le directeur peut créer une nouvelle action disponible à la bourse',
  })
  @ApiResponse({ status: 201, description: 'Action créée avec succès' })
  @ApiResponse({ status: 400, description: 'Symbole déjà existant ou données invalides' })
  @ApiBody({
    description: 'Informations de l\'action',
    schema: {
      type: 'object',
      required: ['symbol', 'name', 'companyName'],
      properties: {
        symbol: { type: 'string', example: 'AAPL', description: 'Symbole boursier (max 10 caractères)' },
        name: { type: 'string', example: 'Apple Inc.' },
        companyName: { type: 'string', example: 'Apple Inc.' },
        isAvailable: { type: 'boolean', example: true, description: 'Disponible au trading (par défaut: true)' },
      },
    },
  })
  async createStock(@Body() body: CreateStockDto) {
    try {
      const stock = await this.createStockUseCase.execute(
        body.symbol,
        body.name,
        body.companyName,
        body.isAvailable
      );

      return {
        success: true,
        message: 'Stock created successfully',
        stock: {
          id: stock.id,
          symbol: stock.symbol,
          name: stock.name,
          companyName: stock.companyName,
          isAvailable: stock.isAvailable,
          createdAt: stock.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create stock',
      };
    }
  }

  @Put('stocks/:stockId')
  @ApiOperation({
    summary: 'Modifier une action',
    description: 'Le directeur peut modifier les informations d\'une action existante',
  })
  @ApiResponse({ status: 200, description: 'Action modifiée avec succès' })
  @ApiResponse({ status: 404, description: 'Action introuvable' })
  @ApiParam({ name: 'stockId', description: 'ID de l\'action' })
  @ApiBody({
    description: 'Modifications à apporter',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Apple Inc. - Updated' },
        companyName: { type: 'string', example: 'Apple Corporation' },
        isAvailable: { type: 'boolean', example: false },
      },
    },
  })
  async updateStock(
    @Param('stockId') stockId: string,
    @Body() body: UpdateStockDto
  ) {
    try {
      const stock = await this.updateStockUseCase.execute(stockId, body);

      return {
        success: true,
        message: 'Stock updated successfully',
        stock: {
          id: stock.id,
          symbol: stock.symbol,
          name: stock.name,
          companyName: stock.companyName,
          isAvailable: stock.isAvailable,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update stock',
      };
    }
  }

  @Delete('stocks/:stockId')
  @ApiOperation({
    summary: 'Supprimer une action',
    description: 'Le directeur peut supprimer une action de la bourse',
  })
  @ApiResponse({ status: 200, description: 'Action supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Action introuvable' })
  @ApiParam({ name: 'stockId', description: 'ID de l\'action' })
  async deleteStock(@Param('stockId') stockId: string) {
    try {
      await this.deleteStockUseCase.execute(stockId);

      return {
        success: true,
        message: 'Stock deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete stock',
      };
    }
  }

  @Put('stocks/:stockId/availability')
  @ApiOperation({
    summary: 'Activer/Désactiver une action',
    description: 'Le directeur peut rendre une action disponible ou indisponible au trading',
  })
  @ApiResponse({ status: 200, description: 'Disponibilité modifiée avec succès' })
  @ApiResponse({ status: 404, description: 'Action introuvable' })
  @ApiParam({ name: 'stockId', description: 'ID de l\'action' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['isAvailable'],
      properties: {
        isAvailable: { type: 'boolean', example: true, description: 'true pour activer, false pour désactiver' },
      },
    },
  })
  async toggleAvailability(@Param('stockId') stockId: string, @Body() body: ToggleStockAvailabilityDto) {
    try {
      const stock = await this.toggleStockAvailabilityUseCase.execute(stockId, body.isAvailable);

      return {
        success: true,
        message: `Stock ${body.isAvailable ? 'activated' : 'deactivated'} successfully`,
        stock: {
          id: stock.id,
          symbol: stock.symbol,
          isAvailable: stock.isAvailable,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to toggle stock availability',
      };
    }
  }

  @Put('savings/interest-rate')
  @ApiOperation({
    summary: 'Fixer le taux d\'épargne',
    description: 'Le directeur peut modifier le taux d\'intérêt quotidien pour tous les comptes d\'épargne',
  })
  @ApiResponse({ status: 200, description: 'Taux d\'épargne mis à jour avec succès pour tous les comptes' })
  @ApiResponse({ status: 400, description: 'Taux invalide (négatif ou > 100%)' })
  @ApiBody({
    description: 'Nouveau taux d\'intérêt quotidien',
    schema: {
      type: 'object',
      required: ['interestRate'],
      properties: {
        interestRate: { type: 'number', example: 0.03, description: 'Taux d\'intérêt quotidien en % (ex: 0.03 pour 0.03%)' },
      },
    },
  })
  async updateInterestRate(@Body() body: UpdateSavingsRateDto) {
    try {
      const result = await this.updateSavingsInterestRateUseCase.execute(body.interestRate);

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update interest rate',
      };
    }
  }

  @Post('clients')
  @ApiOperation({
    summary: 'Créer un compte client',
    description: 'Le directeur peut créer un nouveau compte client avec confirmation automatique de l\'email',
  })
  @ApiResponse({ status: 201, description: 'Client créé avec succès' })
  @ApiResponse({ status: 400, description: 'Email déjà existant ou données invalides' })
  @ApiBody({
    description: 'Informations du client',
    schema: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: { type: 'string', example: 'client@example.com', description: 'Email unique du client' },
        password: { type: 'string', example: 'SecurePass123', description: 'Mot de passe (min 8 caractères)' },
        firstName: { type: 'string', example: 'Jean' },
        lastName: { type: 'string', example: 'Dupont' },
        phoneNumber: { type: 'string', example: '+33612345678' },
      },
    },
  })
  async createClient(@Body() body: CreateClientByDirectorDto) {
    try {
      const client = await this.createClientByDirectorUseCase.execute(
        body.email,
        body.password,
        body.firstName,
        body.lastName,
        body.phoneNumber
      );

      return {
        success: true,
        message: 'Client created successfully',
        client: {
          id: client.id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber,
          isEmailConfirmed: client.isEmailConfirmed,
          isBanned: client.isBanned,
          createdAt: client.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create client',
      };
    }
  }

  @Put('clients/:clientId')
  @ApiOperation({
    summary: 'Modifier un compte client',
    description: 'Le directeur peut modifier les informations d\'un client existant',
  })
  @ApiResponse({ status: 200, description: 'Client modifié avec succès' })
  @ApiResponse({ status: 404, description: 'Client introuvable' })
  @ApiParam({ name: 'clientId', description: 'ID du client' })
  @ApiBody({
    description: 'Modifications à apporter',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'newemail@example.com' },
        password: { type: 'string', example: 'NewSecurePass123' },
        firstName: { type: 'string', example: 'Jean-Pierre' },
        lastName: { type: 'string', example: 'Martin' },
        phoneNumber: { type: 'string', example: '+33698765432' },
      },
    },
  })
  async updateClient(
    @Param('clientId') clientId: string,
    @Body() body: UpdateClientByDirectorDto
  ) {
    try {
      const client = await this.updateClientByDirectorUseCase.execute(clientId, body);

      return {
        success: true,
        message: 'Client updated successfully',
        client: {
          id: client.id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber,
          isBanned: client.isBanned,
          updatedAt: client.updatedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update client',
      };
    }
  }

  @Delete('clients/:clientId')
  @ApiOperation({
    summary: 'Supprimer un compte client',
    description: 'Le directeur peut supprimer un compte client (impossible si le client a des comptes bancaires actifs)',
  })
  @ApiResponse({ status: 200, description: 'Client supprimé avec succès' })
  @ApiResponse({ status: 400, description: 'Impossible de supprimer un client avec des comptes bancaires actifs' })
  @ApiResponse({ status: 404, description: 'Client introuvable' })
  @ApiParam({ name: 'clientId', description: 'ID du client' })
  async deleteClient(@Param('clientId') clientId: string) {
    try {
      await this.deleteClientByDirectorUseCase.execute(clientId);

      return {
        success: true,
        message: 'Client deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete client',
      };
    }
  }

  @Put('clients/:clientId/ban')
  @ApiOperation({
    summary: 'Bannir/Débannir un client',
    description: 'Le directeur peut bannir ou débannir un client',
  })
  @ApiResponse({ status: 200, description: 'Statut du client modifié avec succès' })
  @ApiResponse({ status: 404, description: 'Client introuvable' })
  @ApiParam({ name: 'clientId', description: 'ID du client' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['banned'],
      properties: {
        banned: { type: 'boolean', example: true, description: 'true pour bannir, false pour débannir' },
      },
    },
  })
  async banClient(@Param('clientId') clientId: string, @Body() body: BanClientDto) {
    try {
      const client = await this.banClientUseCase.execute(clientId, body.banned);

      return {
        success: true,
        message: `Client ${body.banned ? 'banned' : 'unbanned'} successfully`,
        client: {
          id: client.id,
          email: client.email,
          isBanned: client.isBanned,
          updatedAt: client.updatedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update client ban status',
      };
    }
  }

  @Get('advisors')
  @ApiOperation({
    summary: 'Lister tous les conseillers',
    description: 'Le directeur peut voir la liste de tous les conseillers',
  })
  @ApiResponse({ status: 200, description: 'Liste des conseillers' })
  async getAllAdvisors() {
    try {
      const advisors = await this.advisorRepository.findAll();
      return {
        success: true,
        count: advisors.length,
        advisors: advisors.map(a => ({
          id: a.id,
          email: a.email,
          firstName: a.firstName,
          lastName: a.lastName,
          createdAt: a.createdAt,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch advisors',
        advisors: [],
      };
    }
  }
}
