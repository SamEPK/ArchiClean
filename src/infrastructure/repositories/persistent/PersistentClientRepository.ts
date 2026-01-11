import { IClientRepository } from '@domain/repositories/IClientRepository';
import { Client } from '@domain/entities/Client';
import * as fs from 'fs';
import * as path from 'path';

export class PersistentClientRepository implements IClientRepository {
  private clients: Map<string, Client> = new Map();
  private dataFile: string;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(dataDir: string = './data') {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.dataFile = path.join(dataDir, 'clients.json');
    this.loadFromDisk();
    
    console.log(`[PersistentClientRepository] Initialized with ${this.clients.size} clients`);
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        const clientsArray = JSON.parse(data);
        
        clientsArray.forEach((clientData: any) => {
          const client = new Client({
            id: clientData.id,
            email: clientData.email,
            password: clientData.password,
            firstName: clientData.firstName,
            lastName: clientData.lastName,
            phoneNumber: clientData.phoneNumber,
            isEmailConfirmed: clientData.isEmailConfirmed || false,
            emailConfirmationToken: clientData.emailConfirmationToken,
            emailConfirmationTokenExpiry: clientData.emailConfirmationTokenExpiry ? new Date(clientData.emailConfirmationTokenExpiry) : undefined,
            isBanned: clientData.isBanned || false,
            createdAt: new Date(clientData.createdAt),
            updatedAt: clientData.updatedAt ? new Date(clientData.updatedAt) : undefined,
          });
          this.clients.set(client.id, client);
        });
        
        console.log(`[PersistentClientRepository] Loaded ${this.clients.size} clients from disk`);
      }
    } catch (error) {
      console.error('[PersistentClientRepository] Error loading data:', error);
    }
  }

  private saveToDisk(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    this.saveTimer = setTimeout(() => {
      try {
        const clientsArray = Array.from(this.clients.values()).map(client => ({
          id: client.id,
          email: client.email,
          password: client.password,
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber,
          isEmailConfirmed: client.isEmailConfirmed,
          emailConfirmationToken: client.emailConfirmationToken,
          emailConfirmationTokenExpiry: client.emailConfirmationTokenExpiry?.toISOString(),
          isBanned: client.isBanned,
          createdAt: client.createdAt.toISOString(),
          updatedAt: client.updatedAt?.toISOString(),
        }));
        
        fs.writeFileSync(this.dataFile, JSON.stringify(clientsArray, null, 2), 'utf8');
        console.log(`[PersistentClientRepository] Saved ${this.clients.size} clients to disk`);
      } catch (error) {
        console.error('[PersistentClientRepository] Error saving data:', error);
      }
    }, 1000);
  }

  async create(client: Client): Promise<void> {
    this.clients.set(client.id, client);
    this.saveToDisk();
  }

  async findById(id: string): Promise<Client | null> {
    return this.clients.get(id) || null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const normalizedEmail = email.toLowerCase().trim();
    return Array.from(this.clients.values()).find(c => c.email.toLowerCase() === normalizedEmail) || null;
  }

  async findAll(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async update(client: Client): Promise<void> {
    this.clients.set(client.id, client);
    this.saveToDisk();
  }

  async delete(id: string): Promise<void> {
    this.clients.delete(id);
    this.saveToDisk();
  }

  async findByAdvisorId(advisorId: string): Promise<Client[]> {
    // Note: Ce repository ne stocke pas l'association client-advisor
    // Cette information doit être récupérée via le MessageRepository (conversations)
    return [];
  }

  async findByEmailConfirmationToken(token: string): Promise<Client | null> {
    return Array.from(this.clients.values()).find(c => c.emailConfirmationToken === token) || null;
  }
}
