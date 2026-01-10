import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '../dto/auth/register.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { ConfirmEmailDto } from '../dto/auth/confirm-email.dto';
import { RefreshTokenDto } from '../dto/auth/refresh-token.dto';
import { RegisterUserUseCase } from '../../../application/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../application/use-cases/LoginUserUseCase';
import { ConfirmUserEmailUseCase } from '../../../application/use-cases/ConfirmUserEmailUseCase';
import { RefreshTokenUseCase } from '../../../application/use-cases/RefreshTokenUseCase';
import { LogoutUserUseCase } from '../../../application/use-cases/LogoutUserUseCase';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../../../domain/entities/User';

/**
 * Interface de réponse pour les endpoints d'authentification
 * Contient les tokens JWT et les informations utilisateur
 */
interface AuthResponse {
  /** Token d'accès JWT (durée: 1h) */
  accessToken: string;
  /** Token de rafraîchissement JWT (durée: 7j) */
  refreshToken: string;
  /** Informations utilisateur non sensibles */
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isEmailConfirmed: boolean;
  };
}

/**
 * Controller d'authentification
 * 
 * Expose les endpoints REST pour:
 * - Inscription (register)
 * - Connexion (login)
 * - Confirmation d'email (confirm-email)
 * - Rafraîchissement de token (refresh)
 * - Déconnexion (logout)
 * - Récupération du profil courant (me)
 * 
 * Architecture:
 * - Délègue la logique métier aux Use Cases
 * - Valide les entrées via DTOs (class-validator)
 * - Gère les tokens JWT
 * - Retourne des réponses HTTP standardisées
 * 
 * @interface Controller - Couche Interface/Présentation
 */
@Controller('auth')
export class AuthController {
  /**
   * Constructeur avec injection de dépendances
   * @param registerUserUseCase - Use case d'inscription
   * @param loginUserUseCase - Use case de connexion
   * @param confirmUserEmailUseCase - Use case de confirmation d'email
   * @param refreshTokenUseCase - Use case de rafraîchissement de token
   * @param logoutUserUseCase - Use case de déconnexion
   * @param jwtService - Service JWT de NestJS
   * @param configService - Service de configuration
   */
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private confirmUserEmailUseCase: ConfirmUserEmailUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private logoutUserUseCase: LogoutUserUseCase,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  /**
   * POST /auth/register - Inscription d'un nouvel utilisateur
   * 
   * Crée un compte utilisateur et envoie un email de confirmation.
   * Le compte n'est pas actif tant que l'email n'est pas confirmé.
   * 
   * @param dto - Données d'inscription validées
   * @returns Message de confirmation et informations utilisateur (sans mot de passe)
   * @throws BadRequestException Si l'email existe déjà ou si les données sont invalides
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerUserUseCase.execute(dto);
    
    return {
      message: result.message,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        isEmailConfirmed: result.user.isEmailConfirmed,
      },
    };
  }

  /**
   * POST /auth/login - Connexion d'un utilisateur
   * 
   * Authentifie l'utilisateur et génère les tokens JWT.
   * Requiert que l'email soit confirmé.
   * 
   * @param dto - Identifiants de connexion (email, password)
   * @returns Tokens JWT et informations utilisateur
   * @throws UnauthorizedException Si les identifiants sont incorrects
   * @throws BadRequestException Si l'email n'est pas confirmé
   */
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    const result = await this.loginUserUseCase.execute(dto);
    const tokens = await this.generateTokens(result.user);

    return {
      ...tokens,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        isEmailConfirmed: result.user.isEmailConfirmed,
      },
    };
  }

  /**
   * GET /auth/confirm-email?token=xxx - Confirmation de l'adresse email
   * 
   * Valide le token de confirmation reçu par email.
   * Active le compte utilisateur après validation.
   * 
   * @param dto - Token de confirmation
   * @returns Message de confirmation et informations utilisateur
   * @throws BadRequestException Si le token est invalide ou expiré
   */
  @Get('confirm-email')
  async confirmEmail(@Query() dto: ConfirmEmailDto) {
    const result = await this.confirmUserEmailUseCase.execute(dto);
    
    return {
      message: result.message,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        isEmailConfirmed: result.user.isEmailConfirmed,
      },
    };
  }

  /**
   * POST /auth/refresh - Rafraîchissement des tokens JWT
   * 
   * Génère de nouveaux tokens à partir d'un refresh token valide.
   * Permet de maintenir la session sans redemander les identifiants.
   * 
   * @param dto - Refresh token actuel
   * @returns Nouveaux tokens JWT et informations utilisateur
   * @throws UnauthorizedException Si le refresh token est invalide ou expiré
   */
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponse> {
    const result = await this.refreshTokenUseCase.execute(dto);
    const tokens = await this.generateTokens(result.user);

    return {
      ...tokens,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        isEmailConfirmed: result.user.isEmailConfirmed,
      },
    };
  }

  /**
   * POST /auth/logout - Déconnexion de l'utilisateur
   * 
   * Invalide le refresh token de l'utilisateur.
   * Nécessite un token JWT valide (route protégée).
   * 
   * @param user - Utilisateur courant (injecté par le guard)
   * @returns Message de confirmation
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: any) {
    const result = await this.logoutUserUseCase.execute({ userId: user.userId });
    
    return {
      message: result.message,
    };
  }

  /**
   * GET /auth/me - Récupération du profil utilisateur courant
   * 
   * Retourne les informations de l'utilisateur authentifié.
   * Route protégée par JWT.
   * 
   * @param user - Utilisateur courant (injecté par le guard)
   * @returns Informations de base de l'utilisateur
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    return {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Génère les tokens JWT (access + refresh)
   * 
   * Crée deux tokens:
   * - Access token: courte durée (1h), utilisé pour les requêtes
   * - Refresh token: longue durée (7j), utilisé pour renouveler l'access token
   * 
   * Le refresh token est sauvegardé dans l'utilisateur pour validation ultérieure.
   * 
   * @param user - Entité utilisateur
   * @returns Objet contenant les deux tokens
   * @private
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'default-secret-key',
      expiresIn: '1h',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
      expiresIn: '7d',
    });

    // Sauvegarder le refresh token dans l'utilisateur
    user.updateRefreshToken(refreshToken);

    return { accessToken, refreshToken };
  }
}
