import { Controller, Post, Get, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { RegisterClientUseCase } from '@application/use-cases/RegisterClientUseCase';
import { ConfirmEmailUseCase } from '@application/use-cases/ConfirmEmailUseCase';
import { AuthenticateClientUseCase } from '@application/use-cases/AuthenticateClientUseCase';
import { CreateBankAccountUseCase } from '@application/use-cases/CreateBankAccountUseCase';
import { DeleteBankAccountUseCase } from '@application/use-cases/DeleteBankAccountUseCase';
import { UpdateBankAccountNameUseCase } from '@application/use-cases/UpdateBankAccountNameUseCase';
import { ListBankAccountsUseCase } from '@application/use-cases/ListBankAccountsUseCase';
import { UpdateClientProfileUseCase } from '@application/use-cases/UpdateClientProfileUseCase';
import { IClientRepository } from '@domain/repositories/IClientRepository';
import { RegisterClientDto } from '../dto/client/register-client.dto';
import { ClientLoginDto } from '../dto/client/client-login.dto';
import { ConfirmClientEmailDto } from '../dto/client/confirm-client-email.dto';
import { CreateBankAccountDto } from '../dto/client/create-bank-account.dto';
import { UpdateBankAccountNameDto } from '../dto/client/update-bank-account-name.dto';
import { UpdateClientProfileDto } from '../dto/client/update-client-profile.dto';
import { ListBankAccountsQueryDto } from '../dto/client/list-bank-accounts-query.dto';

@ApiTags('Clients')
@Controller('clients')
export class ClientController {
  constructor(
    private registerClientUseCase: RegisterClientUseCase,
    private confirmEmailUseCase: ConfirmEmailUseCase,
    private authenticateClientUseCase: AuthenticateClientUseCase,
    private createBankAccountUseCase: CreateBankAccountUseCase,
    private deleteBankAccountUseCase: DeleteBankAccountUseCase,
    private updateBankAccountNameUseCase: UpdateBankAccountNameUseCase,
    private listBankAccountsUseCase: ListBankAccountsUseCase,
    private updateClientProfileUseCase: UpdateClientProfileUseCase,
    private jwtService: JwtService,
    @Inject('IClientRepository') private clientRepository: IClientRepository
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les clients', description: 'Récupérer la liste de tous les clients (pour les menus déroulants)' })
  @ApiResponse({ status: 200, description: 'Liste des clients' })
  async listClients() {
    try {
      const clients = await this.clientRepository.findAll();
      return {
        success: true,
        count: clients.length,
        clients: clients.map(client => ({
          id: client.id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber,
          isEmailConfirmed: client.isEmailConfirmed,
          isBanned: client.isBanned,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list clients',
        clients: [],
      };
    }
  }

  @Put(':clientId')
  @ApiOperation({ summary: 'Mettre à jour le profil client', description: 'Modifier les informations personnelles du client' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Client introuvable' })
  @ApiParam({ name: 'clientId', description: 'ID du client' })
  @ApiBody({
    description: 'Informations à mettre à jour',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Jean' },
        lastName: { type: 'string', example: 'Dupont' },
        phone: { type: 'string', example: '+33612345678' },
        address: { type: 'string', example: '123 rue de la Paix' },
        city: { type: 'string', example: 'Paris' },
        postalCode: { type: 'string', example: '75001' },
        country: { type: 'string', example: 'France' },
      },
    },
  })
  async updateProfile(
    @Param('clientId') clientId: string,
    @Body() body: UpdateClientProfileDto
  ) {
    try {
      const client = await this.updateClientProfileUseCase.execute(clientId, body);

      return {
        success: true,
        message: 'Profile updated successfully',
        client: {
          id: client.id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber,
          address: (client as any).address,
          city: (client as any).city,
          postalCode: (client as any).postalCode,
          country: (client as any).country,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Inscription d\'un nouveau client', description: 'Créer un compte client avec email, mot de passe et informations personnelles. Un email de confirmation sera envoyé.' })
  @ApiResponse({ status: 201, description: 'Client inscrit avec succès. Email de confirmation envoyé.' })
  @ApiResponse({ status: 400, description: 'Données invalides (email déjà utilisé, mot de passe faible, etc.)' })
  @ApiBody({
    description: 'Informations du client',
    schema: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: { type: 'string', example: 'client@example.com' },
        password: { type: 'string', example: 'SecurePass123', description: 'Minimum 8 caractères avec majuscule, minuscule et chiffre' },
        firstName: { type: 'string', example: 'Jean' },
        lastName: { type: 'string', example: 'Dupont' },
        phoneNumber: { type: 'string', example: '+33612345678' },
      },
    },
  })
  async register(@Body() body: RegisterClientDto) {
    try {
      const result = await this.registerClientUseCase.execute(
        body.email,
        body.password,
        body.firstName,
        body.lastName,
        body.phoneNumber
      );

      // Generate JWT token for the newly registered client
      const payload = {
        sub: result.client.id,
        email: result.client.email,
        type: 'client',
      };
      const token = this.jwtService.sign(payload);

      return {
        success: true,
        message: 'Registration successful. You are now logged in.',
        token,
        client: {
          id: result.client.id,
          email: result.client.email,
          firstName: result.client.firstName,
          lastName: result.client.lastName,
          phoneNumber: result.client.phoneNumber,
          role: 'CLIENT',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  @Get('confirm-email')
  @ApiOperation({ summary: 'Confirmer l\'email du client', description: 'Valider l\'adresse email via le token envoyé par email' })
  @ApiResponse({ status: 200, description: 'Email confirmé avec succès' })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  @ApiQuery({ name: 'token', description: 'Token de confirmation reçu par email' })
  async confirmEmail(@Query() query: ConfirmClientEmailDto) {
    const result = await this.confirmEmailUseCase.execute(query.token);
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Authentification d\'un client', description: 'Se connecter avec email et mot de passe' })
  @ApiResponse({ status: 200, description: 'Authentification réussie' })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect, ou email non confirmé' })
  @ApiBody({
    description: 'Identifiants de connexion',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'client@example.com' },
        password: { type: 'string', example: 'SecurePass123' },
      },
    },
  })
  async login(@Body() body: ClientLoginDto) {
    try {
      const result = await this.authenticateClientUseCase.execute(body.email, body.password);

      if (result.success && result.client) {
        // Generate JWT token for the client
        const payload = {
          sub: result.client.id,
          email: result.client.email,
          type: 'client',
        };
        const token = this.jwtService.sign(payload);

        return {
          success: true,
          message: result.message,
          token,
          client: {
            id: result.client.id,
            email: result.client.email,
            firstName: result.client.firstName,
            lastName: result.client.lastName,
            phoneNumber: result.client.phoneNumber,
            role: 'CLIENT',
          },
        };
      }

      return {
        success: false,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  @Post(':clientId/accounts')
  @ApiTags('Bank Accounts')
  @ApiOperation({ summary: 'Créer un compte bancaire', description: 'Créer un nouveau compte bancaire avec IBAN généré automatiquement (algorithme Mod-97)' })
  @ApiResponse({ status: 201, description: 'Compte bancaire créé avec IBAN valide' })
  @ApiResponse({ status: 400, description: 'Client introuvable ou données invalides' })
  @ApiParam({ name: 'clientId', description: 'ID du client propriétaire' })
  @ApiBody({
    description: 'Informations du compte',
    schema: {
      type: 'object',
      required: ['accountName'],
      properties: {
        accountName: { type: 'string', example: 'Mon compte principal' },
        initialBalance: { type: 'number', example: 1000, description: 'Solde initial (par défaut: 0)' },
        currency: { type: 'string', example: 'EUR', description: 'Devise (par défaut: EUR)' },
      },
    },
  })
  async createBankAccount(
    @Param('clientId') clientId: string,
    @Body() body: CreateBankAccountDto
  ) {
    try {
      const account = await this.createBankAccountUseCase.execute(
        clientId,
        body.accountName,
        body.initialBalance,
        body.currency
      );

      return {
        success: true,
        message: 'Bank account created successfully',
        account: {
          id: account.id,
          iban: account.iban,
          accountName: account.accountName,
          balance: account.balance,
          currency: account.currency,
          isActive: account.isActive,
          createdAt: account.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create bank account',
      };
    }
  }

  @Get(':clientId/accounts')
  @ApiTags('Bank Accounts')
  @ApiOperation({ summary: 'Lister les comptes bancaires', description: 'Récupérer tous les comptes bancaires d\'un client' })
  @ApiResponse({ status: 200, description: 'Liste des comptes bancaires' })
  @ApiParam({ name: 'clientId', description: 'ID du client' })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Inclure les comptes inactifs (true/false)' })
  async listBankAccounts(@Param('clientId') clientId: string, @Query() query: ListBankAccountsQueryDto) {
    const accounts = await this.listBankAccountsUseCase.execute(clientId, query.includeInactive === 'true');

    return {
      success: true,
      count: accounts.length,
      accounts: accounts.map(account => ({
        id: account.id,
        iban: account.iban,
        accountName: account.accountName,
        balance: account.balance,
        currency: account.currency,
        isActive: account.isActive,
        createdAt: account.createdAt,
      })),
    };
  }

  @Put(':clientId/accounts/:accountId')
  @ApiTags('Bank Accounts')
  @ApiOperation({ summary: 'Modifier le nom d\'un compte', description: 'Renommer un compte bancaire existant' })
  @ApiResponse({ status: 200, description: 'Nom du compte modifié avec succès' })
  @ApiResponse({ status: 403, description: 'Vous n\'êtes pas autorisé à modifier ce compte' })
  @ApiResponse({ status: 404, description: 'Compte introuvable' })
  @ApiParam({ name: 'clientId', description: 'ID du client propriétaire' })
  @ApiParam({ name: 'accountId', description: 'ID du compte bancaire' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['accountName'],
      properties: {
        accountName: { type: 'string', example: 'Mon compte épargne' },
      },
    },
  })
  async updateBankAccountName(
    @Param('clientId') clientId: string,
    @Param('accountId') accountId: string,
    @Body() body: UpdateBankAccountNameDto
  ) {
    try {
      const account = await this.updateBankAccountNameUseCase.execute(accountId, clientId, body.accountName);

      return {
        success: true,
        message: 'Account name updated successfully',
        account: {
          id: account.id,
          iban: account.iban,
          accountName: account.accountName,
          balance: account.balance,
          currency: account.currency,
          isActive: account.isActive,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update account name',
      };
    }
  }

  @Delete(':clientId/accounts/:accountId')
  @ApiTags('Bank Accounts')
  @ApiOperation({ summary: 'Supprimer un compte bancaire', description: 'Désactiver un compte bancaire (uniquement si le solde est 0)' })
  @ApiResponse({ status: 200, description: 'Compte supprimé avec succès' })
  @ApiResponse({ status: 400, description: 'Impossible de supprimer un compte avec un solde non nul' })
  @ApiResponse({ status: 403, description: 'Vous n\'êtes pas autorisé à supprimer ce compte' })
  @ApiParam({ name: 'clientId', description: 'ID du client propriétaire' })
  @ApiParam({ name: 'accountId', description: 'ID du compte bancaire' })
  async deleteBankAccount(@Param('clientId') clientId: string, @Param('accountId') accountId: string) {
    const result = await this.deleteBankAccountUseCase.execute(accountId, clientId);
    return result;
  }
}
