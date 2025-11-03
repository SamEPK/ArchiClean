import { IClientRepository } from '@domain/repositories/IClientRepository';
import { Client } from '@domain/entities/Client';

export class InMemoryClientRepository implements IClientRepository {
  private clients: Map<string, Client> = new Map();

  async create(client: Client): Promise<void> {
    this.clients.set(client.id, client);
  }

  async findById(id: string): Promise<Client | null> {
    return this.clients.get(id) || null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    for (const client of this.clients.values()) {
      if (client.email.toLowerCase() === email.toLowerCase()) {
        return client;
      }
    }
    return null;
  }

  async findByEmailConfirmationToken(token: string): Promise<Client | null> {
    for (const client of this.clients.values()) {
      if (client.emailConfirmationToken === token) {
        return client;
      }
    }
    return null;
  }

  async update(client: Client): Promise<void> {
    if (!this.clients.has(client.id)) {
      throw new Error('Client not found');
    }
    this.clients.set(client.id, client);
  }

  async delete(id: string): Promise<void> {
    this.clients.delete(id);
  }

  async findAll(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  clear(): void {
    this.clients.clear();
  }
}
