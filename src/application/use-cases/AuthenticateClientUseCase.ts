import * as bcrypt from 'bcryptjs';
import { Client } from '@domain/entities/Client';
import { IClientRepository } from '@domain/repositories/IClientRepository';

export interface AuthenticationResult {
  success: boolean;
  client?: Client;
  message: string;
}

export class AuthenticateClientUseCase {
  constructor(private clientRepository: IClientRepository) {}

  async execute(email: string, password: string): Promise<AuthenticationResult> {
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required',
      };
    }

    const client = await this.clientRepository.findByEmail(email.toLowerCase().trim());

    if (!client) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    if (!client.isEmailConfirmed) {
      return {
        success: false,
        message: 'Please confirm your email before logging in',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, client.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    return {
      success: true,
      client,
      message: 'Authentication successful',
    };
  }
}
