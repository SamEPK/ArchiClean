import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    console.log('🔑 [JwtStrategy] validate() called');
    console.log('🔑 [JwtStrategy] Payload:', JSON.stringify(payload));

    const user = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    console.log('🔑 [JwtStrategy] Returning user:', JSON.stringify(user));
    return user;
  }
}
