import { Controller, Post, Body, UseGuards, Req, Get, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RegisterAdvisorUseCase } from '@application/use-cases/RegisterAdvisorUseCase';
import { AuthenticateAdvisorUseCase } from '@application/use-cases/AuthenticateAdvisorUseCase';
import { JwtService } from '@nestjs/jwt';
import { AdvisorAuthGuard } from '../guards/advisor-auth.guard';
import { UserRole } from '@domain/entities/User';
import { Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrantCreditCommand } from '@application/cqrs/commands/GrantCreditCommand';
import { ReplyToConversationCommand } from '@application/cqrs/commands/ReplyToConversationCommand';
import { AssignConversationCommand } from '@application/cqrs/commands/AssignConversationCommand';
import { TransferConversationCommand } from '@application/cqrs/commands/TransferConversationCommand';
import { ListOpenConversationsQuery } from '@application/cqrs/queries/ListOpenConversationsQuery';
import { GetClientCreditsQuery } from '@application/cqrs/queries/GetClientCreditsQuery';
import { GetCreditScheduleUseCase } from '@application/use-cases/GetCreditScheduleUseCase';
import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import { RegisterAdvisorDto } from '../dto/advisor/register-advisor.dto';
import { LoginAdvisorDto } from '../dto/advisor/login-advisor.dto';
import { GrantCreditDto } from '../dto/advisor/grant-credit.dto';
import { ReplyConversationDto } from '../dto/advisor/reply-conversation.dto';
import { TransferConversationDto } from '../dto/advisor/transfer-conversation.dto';

@ApiTags('Advisors')
@Controller('advisors')
export class AdvisorController {
  constructor(
    private registerAdvisorUseCase: RegisterAdvisorUseCase,
    private authenticateAdvisorUseCase: AuthenticateAdvisorUseCase,
    private jwtService: JwtService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private getCreditScheduleUseCase: GetCreditScheduleUseCase,
    @Inject('IMessageRepository')
    private messageRepository: IMessageRepository
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Inscription d\'un conseiller',
    description: 'Créer un compte conseiller avec email et mot de passe sécurisé',
  })
  @ApiResponse({ status: 201, description: 'Conseiller inscrit avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides (email déjà utilisé, mot de passe faible, etc.)' })
  @ApiBody({
    description: 'Informations du conseiller',
    schema: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: { type: 'string', example: 'conseiller@banque.com' },
        password: {
          type: 'string',
          example: 'SecurePass123',
          description: 'Minimum 8 caractères avec majuscule, minuscule et chiffre',
        },
        firstName: { type: 'string', example: 'Marie' },
        lastName: { type: 'string', example: 'Martin' },
      },
    },
  })
  async register(@Body() body: RegisterAdvisorDto) {
    try {
      const advisor = await this.registerAdvisorUseCase.execute(
        body.email,
        body.password,
        body.firstName,
        body.lastName
      );

      return {
        success: true,
        message: 'Advisor registered successfully',
        advisor: {
          id: advisor.id,
          email: advisor.email,
          firstName: advisor.firstName,
          lastName: advisor.lastName,
          createdAt: advisor.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  @Post('login')
  @ApiOperation({
    summary: 'Authentification d\'un conseiller',
    description: 'Se connecter avec email et mot de passe',
  })
  @ApiResponse({ status: 200, description: 'Authentification réussie' })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  @ApiBody({
    description: 'Identifiants de connexion',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'conseiller@banque.com' },
        password: { type: 'string', example: 'SecurePass123' },
      },
    },
  })
  async login(@Body() body: LoginAdvisorDto) {
    const result = await this.authenticateAdvisorUseCase.execute(body.email, body.password);

    if (result.success && result.advisor) {
      const token = this.jwtService.sign({
        sub: result.advisor.id,
        role: UserRole.ADVISOR,
        email: result.advisor.email,
      });

      return {
        success: true,
        message: result.message,
        advisor: {
          id: result.advisor.id,
          email: result.advisor.email,
          firstName: result.advisor.firstName,
          lastName: result.advisor.lastName,
        },
        token,
      };
    }

    return {
      success: false,
      message: result.message,
    };
  }

  @Post('credits')
  @UseGuards(AdvisorAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Octroyer un crédit', description: 'Crée un crédit avec mensualité constante et assurance incluse.' })
  @ApiResponse({ status: 201, description: 'Crédit créé et mensualités calculées' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['clientId', 'amount', 'annualRate', 'insuranceRate', 'durationMonths'],
      properties: {
        clientId: { type: 'string', example: 'client-123' },
        amount: { type: 'number', example: 20000 },
        annualRate: { type: 'number', example: 3.2 },
        insuranceRate: { type: 'number', example: 0.3 },
        durationMonths: { type: 'number', example: 60 },
      },
    },
  })
  async grantCreditForClient(@Body() body: GrantCreditDto) {
    const credit = await this.commandBus.execute(
      new GrantCreditCommand(
        body.clientId,
        body.amount,
        body.annualRate,
        body.insuranceRate,
        body.durationMonths
      )
    );

    return {
      success: true,
      message: 'Crédit accordé',
      credit: {
        id: credit.id,
        userId: credit.userId,
        amount: credit.amount,
        annualRate: credit.annualRate,
        insuranceRate: credit.insuranceRate,
        monthlyPayment: credit.monthlyPayment,
        durationMonths: body.durationMonths,
      },
    };
  }

  @Get('conversations/open')
  @UseGuards(AdvisorAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les conversations ouvertes' })
  async listOpenConversations() {
    const conversations = await this.queryBus.execute(new ListOpenConversationsQuery());
    return { success: true, conversations: conversations ?? [] };
  }

  @Post('conversations/:conversationId/reply')
  @UseGuards(AdvisorAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Répondre à un message client et s\'attribuer la conversation au premier répondant' })
  @ApiParam({ name: 'conversationId', description: 'ID de la conversation' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['content'],
      properties: { content: { type: 'string', example: 'Bonjour, je prends en charge votre demande.' } },
    },
  })
  async reply(
    @Param('conversationId') conversationId: string,
    @Body() body: ReplyConversationDto,
    @Req() req: Request
  ) {
    const advisorId = (req as any).user?.id;
    await this.commandBus.execute(
      new ReplyToConversationCommand(conversationId, advisorId, body.content)
    );
    return { success: true };
  }

  @Post('conversations/:conversationId/assign')
  @UseGuards(AdvisorAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Prendre en charge une conversation ouverte' })
  @ApiParam({ name: 'conversationId', description: 'ID de la conversation' })
  async assignConversationToSelf(@Param('conversationId') conversationId: string, @Req() req: Request) {
    const advisorId = (req as any).user?.id;
    await this.commandBus.execute(new AssignConversationCommand(conversationId, advisorId));
    return { success: true };
  }

  @Post('conversations/:conversationId/transfer')
  @UseGuards(AdvisorAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transférer une conversation à un autre conseiller' })
  @ApiParam({ name: 'conversationId', description: 'ID de la conversation' })
  @ApiBody({ schema: { type: 'object', required: ['toAdvisorId'], properties: { toAdvisorId: { type: 'string' } } } })
  async transferConversationTo(
    @Param('conversationId') conversationId: string,
    @Body() body: TransferConversationDto,
    @Req() req: Request
  ) {
    const advisorId = (req as any).user?.id;
    await this.commandBus.execute(
      new TransferConversationCommand(conversationId, advisorId, body.toAdvisorId)
    );
    return { success: true };
  }

  @Get('clients/:clientId/credits')
  @UseGuards(AdvisorAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les crédits d\'un client (query side)' })
  @ApiParam({ name: 'clientId', description: 'ID du client' })
  async listCredits(@Param('clientId') clientId: string) {
    const credits = await this.queryBus.execute(new GetClientCreditsQuery(clientId));
    return { success: true, credits };
  }

  @Get('credits/:creditId/schedule')
  @UseGuards(AdvisorAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtenir l\'échéancier d\'un crédit',
    description: 'Récupère l\'échéancier complet avec détail de chaque mensualité (capital, intérêts, assurance, capital restant)'
  })
  @ApiParam({ name: 'creditId', description: 'ID du crédit' })
  @ApiResponse({ status: 200, description: 'Échéancier détaillé du crédit' })
  @ApiResponse({ status: 404, description: 'Crédit introuvable' })
  async getCreditSchedule(
    @Param('creditId') creditId: string,
    @Param('durationMonths') durationMonths: number = 60
  ) {
    try {
      const schedule = await this.getCreditScheduleUseCase.execute(creditId, durationMonths);
      return { success: true, schedule };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get credit schedule',
      };
    }
  }

  @Get('conversations/:conversationId/messages')
  @UseGuards(AdvisorAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer l\'historique des messages d\'une conversation',
    description: 'Obtient tous les messages échangés avec un client dans une conversation donnée'
  })
  @ApiParam({ name: 'conversationId', description: 'ID de la conversation (généralement l\'ID du client)' })
  @ApiResponse({ status: 200, description: 'Liste des messages de la conversation' })
  async getConversationMessages(@Param('conversationId') conversationId: string) {
    try {
      const messages = await this.messageRepository.listMessages(conversationId);
      return { success: true, messages };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get conversation messages',
        messages: []
      };
    }
  }

  @Get('client-assignments')
  @UseGuards(AdvisorAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Afficher les assignations client-conseiller',
    description: 'Montre quels clients sont assignés à quels conseillers via les conversations actives'
  })
  @ApiResponse({ status: 200, description: 'Mapping des assignations client-conseiller' })
  async getClientAssignments() {
    try {
      const conversations = await this.queryBus.execute(new ListOpenConversationsQuery());
      
      // Pour l'instant on retourne les conversations brutes
      // TODO: Réimplémenter avec injection de dépendance correcte
      const result = conversations || [];

      return { 
        success: true, 
        conversations: result,
        count: result.length
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get client assignments',
        conversations: []
      };
    }
  }
}
