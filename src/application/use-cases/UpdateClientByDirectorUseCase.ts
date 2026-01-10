import { Client } from '../../domain/entities/Client';
import { IClientRepository } from '../../domain/repositories/IClientRepository';
import * as bcrypt from 'bcryptjs';

export class UpdateClientByDirectorUseCase {
  constructor(private clientRepository: IClientRepository) {}

  async execute(
    clientId: string,
    updates: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
    }
  ): Promise<Client> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Validate email if provided
    if (updates.email !== undefined) {
      if (updates.email.trim().length === 0) {
        throw new Error('Email cannot be empty');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        throw new Error('Invalid email format');
      }

      // Check if email is already taken by another client
      const existingClient = await this.clientRepository.findByEmail(updates.email.toLowerCase());
      if (existingClient && existingClient.id !== clientId) {
        throw new Error('Email already in use by another client');
      }
    }

    // Validate password if provided
    if (updates.password !== undefined && updates.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Validate first name if provided
    if (updates.firstName !== undefined && updates.firstName.trim().length === 0) {
      throw new Error('First name cannot be empty');
    }

    // Validate last name if provided
    if (updates.lastName !== undefined && updates.lastName.trim().length === 0) {
      throw new Error('Last name cannot be empty');
    }

    // Update client properties
    if (updates.email !== undefined) {
      (client as any).email = updates.email.toLowerCase().trim();
    }

    if (updates.password !== undefined) {
      client.password = await bcrypt.hash(updates.password, 10);
    }

    if (updates.firstName !== undefined) {
      client.firstName = updates.firstName.trim();
    }

    if (updates.lastName !== undefined) {
      client.lastName = updates.lastName.trim();
    }

    if (updates.phoneNumber !== undefined) {
      client.phoneNumber = updates.phoneNumber.trim();
    }

    client.updatedAt = new Date();

    await this.clientRepository.update(client);
    return client;
  }
}
