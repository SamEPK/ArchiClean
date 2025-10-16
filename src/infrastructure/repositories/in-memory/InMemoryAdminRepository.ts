import { IAdminRepository } from '../../../domain/repositories/IAdminRepository';
import { BankDirector } from '../../../domain/entities/BankDirector';
import { Advisor } from '../../../domain/entities/Advisor';

export class InMemoryAdminRepository implements IAdminRepository {
  private directors: Map<string, BankDirector> = new Map();
  private advisors: Map<string, Advisor> = new Map();
  private bannedClients: Set<string> = new Set();

  async createDirector(director: BankDirector): Promise<void> {
    this.directors.set(director.id, director);
  }
  async findDirectorByEmail(email: string): Promise<BankDirector | null> {
    for (const d of this.directors.values()) {
      if (d.email === email) return d;
    }
    return null;
  }
  async createAdvisor(advisor: Advisor): Promise<void> {
    this.advisors.set(advisor.id, advisor);
  }
  async findAdvisorByEmail(email: string): Promise<Advisor | null> {
    for (const a of this.advisors.values()) {
      if (a.email === email) return a;
    }
    return null;
  }
  async banClient(clientId: string): Promise<void> {
    this.bannedClients.add(clientId);
  }
}
