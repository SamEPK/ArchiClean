import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserRole } from '@domain/entities/User';

interface AdvisorJwtPayload {
  sub: string;
  role: UserRole;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AdvisorAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const payload = this.jwtService.verify<AdvisorJwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'default-secret-key',
      });

      if (payload.role !== UserRole.ADVISOR) {
        throw new ForbiddenException('Invalid role for advisor access');
      }

      (request as any).user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
      };
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];
    if (!authHeader || Array.isArray(authHeader)) {
      return null;
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }
    return token;
  }
}
