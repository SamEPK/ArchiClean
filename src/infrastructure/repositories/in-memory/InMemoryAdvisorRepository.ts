import { IAdvisorRepository } from '../../../domain/repositories/IAdvisorRepository';
import { Advisor } from '../../../domain/entities/Advisor';

export class InMemoryAdvisorRepository implements IAdvisorRepository {
  private advisors: Map<string, Advisor> = new Map();

  async create(advisor: Advisor): Promise<void> {
    this.advisors.set(advisor.id, advisor);
  }

  async findById(id: string): Promise<Advisor | null> {
    return this.advisors.get(id) || null;
  }

  async findByEmail(email: string): Promise<Advisor | null> {
    for (const advisor of this.advisors.values()) {
      if (advisor.email.toLowerCase() === email.toLowerCase()) {
        return advisor;
      }
    }
    return null;
  }

  async findAll(): Promise<Advisor[]> {
    return Array.from(this.advisors.values());
  }

  async update(advisor: Advisor): Promise<void> {
    if (!this.advisors.has(advisor.id)) {
      throw new Error('Advisor not found');
    }
    this.advisors.set(advisor.id, advisor);
  }

  clear(): void {
    this.advisors.clear();
  }
}
