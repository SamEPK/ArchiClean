import { Client } from '../../domain/entities/Client';
import { IClientRepository } from '../../domain/repositories/IClientRepository';

export class UpdateClientProfileUseCase {
  constructor(private clientRepository: IClientRepository) {}

  async execute(
    clientId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      phoneNumber?: string;
      address?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    }
  ): Promise<Client> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Validate first name if provided
    if (updates.firstName !== undefined && updates.firstName.trim().length === 0) {
      throw new Error('First name cannot be empty');
    }

    // Validate last name if provided
    if (updates.lastName !== undefined && updates.lastName.trim().length === 0) {
      throw new Error('Last name cannot be empty');
    }

    // Update the client properties
    if (updates.firstName !== undefined) {
      client.firstName = updates.firstName.trim();
    }

    if (updates.lastName !== undefined) {
      client.lastName = updates.lastName.trim();
    }

    // Handle phone number (can be either phone or phoneNumber)
    const phoneValue = updates.phone || updates.phoneNumber;
    if (phoneValue !== undefined) {
      client.phoneNumber = phoneValue.trim();
    }

    // These fields might not exist in the base Client entity, 
    // but we'll add them as extended properties
    const extendedClient = client as any;
    
    if (updates.address !== undefined) {
      extendedClient.address = updates.address.trim();
    }

    if (updates.city !== undefined) {
      extendedClient.city = updates.city.trim();
    }

    if (updates.postalCode !== undefined) {
      extendedClient.postalCode = updates.postalCode.trim();
    }

    if (updates.country !== undefined) {
      extendedClient.country = updates.country.trim();
    }

    // Update the client in repository
    await this.clientRepository.update(client);
    
    return client;
  }
}
