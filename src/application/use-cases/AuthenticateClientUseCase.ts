import * as bcrypt from 'bcryptjs';
import { Client } from '@domain/entities/Client';
import { IClientRepository } from '@domain/repositories/IClientRepository';

export interface AuthenticationResult {
  success: boolean;
  client?: Client;
  message: string;
}

export class AuthenticateClientUseCase {
  constructor(private clientRepository: IClientRepository) {
    const repoInstance = (clientRepository as any).instanceId;
    console.log('[AuthenticateClientUseCase] Constructor called with repository:', clientRepository.constructor.name, `(instance #${repoInstance})`);
  }

  async execute(email: string, password: string): Promise<AuthenticationResult> {
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required',
      };
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[AuthenticateClientUseCase] Attempting login for: ${normalizedEmail}`);

    const client = await this.clientRepository.findByEmail(normalizedEmail);

    console.log(`[AuthenticateClientUseCase] Client found: ${client ? 'YES' : 'NO'}`);
    if (client) {
      console.log(`[AuthenticateClientUseCase] Client ID: ${client.id}, Email confirmed: ${client.isEmailConfirmed}`);
    }

    if (!client) {
      // Debug: List all clients
      const allClients = await this.clientRepository.findAll();
      console.log(`[AuthenticateClientUseCase] Total clients in repository: ${allClients.length}`);
      if (allClients.length > 0) {
        console.log(`[AuthenticateClientUseCase] Client emails:`, allClients.map(c => c.email));
      }
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
