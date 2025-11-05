import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginUserUseCase } from '../../../application/use-cases/LoginUserUseCase';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private loginUserUseCase: LoginUserUseCase) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const result = await this.loginUserUseCase.execute({ email, password });
      return result.user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      throw new UnauthorizedException(message);
    }
  }
}
