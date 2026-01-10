import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../domain/entities/User';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('👮 [RolesGuard] Required roles:', requiredRoles);

    if (!requiredRoles) {
      console.log('👮 [RolesGuard] No roles required, access granted');
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    console.log('👮 [RolesGuard] User from request:', user ? JSON.stringify(user) : 'NONE');

    if (!user) {
      console.log('❌ [RolesGuard] No user in request, throwing ForbiddenException');
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    console.log('👮 [RolesGuard] User role:', user.role);
    console.log('👮 [RolesGuard] Has required role:', hasRole);

    if (!hasRole) {
      console.log('❌ [RolesGuard] Access denied - role mismatch');
      throw new ForbiddenException('Accès refusé : rôle insuffisant');
    }

    console.log('✅ [RolesGuard] Access granted');
    return true;
  }
}
