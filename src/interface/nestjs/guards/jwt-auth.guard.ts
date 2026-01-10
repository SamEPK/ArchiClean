import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log('🔐 [JwtAuthGuard] Authorization header:', authHeader ? authHeader.substring(0, 50) + '...' : 'MISSING');
    console.log('🔐 [JwtAuthGuard] Request URL:', request.url);
    console.log('🔐 [JwtAuthGuard] Request method:', request.method);

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('🔐 [JwtAuthGuard] handleRequest called');
    console.log('🔐 [JwtAuthGuard] Error:', err ? err.message : 'none');
    console.log('🔐 [JwtAuthGuard] User:', user ? JSON.stringify(user) : 'NONE');
    console.log('🔐 [JwtAuthGuard] Info:', info ? JSON.stringify(info) : 'none');

    if (err || !user) {
      throw err || new UnauthorizedException('Token invalide ou manquant');
    }
    return user;
  }
}
