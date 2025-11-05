import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto, LoginDto, ConfirmEmailDto, RefreshTokenDto } from '../dto/auth.dto';
import { RegisterUserUseCase } from '../../../application/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../application/use-cases/LoginUserUseCase';
import { ConfirmUserEmailUseCase } from '../../../application/use-cases/ConfirmUserEmailUseCase';
import { RefreshTokenUseCase } from '../../../application/use-cases/RefreshTokenUseCase';
import { LogoutUserUseCase } from '../../../application/use-cases/LogoutUserUseCase';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../../../domain/entities/User';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isEmailConfirmed: boolean;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private confirmUserEmailUseCase: ConfirmUserEmailUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private logoutUserUseCase: LogoutUserUseCase,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
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

  @Get('confirm-email')
  @HttpCode(HttpStatus.OK)
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
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

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any) {
    const result = await this.logoutUserUseCase.execute({ userId: user.userId });
    
    return {
      message: result.message,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    return {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'default-secret',
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
