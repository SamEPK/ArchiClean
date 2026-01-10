import { IClientRepository } from '@domain/repositories/IClientRepository';
import { Client } from '@domain/entities/Client';

export class InMemoryClientRepository implements IClientRepository {
  private static instanceCount = 0;
  private instanceId: number;
  private clients: Map<string, Client> = new Map();

  constructor() {
    this.instanceId = ++InMemoryClientRepository.instanceCount;
    console.log(`[InMemoryClientRepository] Instance #${this.instanceId} created`);
  }

  async create(client: Client): Promise<void> {
    console.log(`[InMemoryClientRepository #${this.instanceId}] Creating client: ${client.email}`);
    this.clients.set(client.id, client);
  }

  async findById(id: string): Promise<Client | null> {
    return this.clients.get(id) || null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    console.log(`[InMemoryClientRepository #${this.instanceId}] findByEmail(${email}) - has ${this.clients.size} clients`);
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
    console.log(`[InMemoryClientRepository #${this.instanceId}] findAll() - has ${this.clients.size} clients`);
    return Array.from(this.clients.values());
  }

  clear(): void {
    this.clients.clear();
  }
}
