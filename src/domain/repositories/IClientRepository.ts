import { Client } from '../entities/Client';

export interface IClientRepository {
  create(client: Client): Promise<void>;
  findById(id: string): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  findByEmailConfirmationToken(token: string): Promise<Client | null>;
  update(client: Client): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Client[]>;
}
