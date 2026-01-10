import { IAdvisorRepository } from '@domain/repositories/IAdvisorRepository';
import { Advisor } from '@domain/entities/Advisor';
import * as fs from 'fs';
import * as path from 'path';

export class PersistentAdvisorRepository implements IAdvisorRepository {
  private advisors: Map<string, Advisor> = new Map();
  private dataFile: string;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(dataDir: string = './data') {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.dataFile = path.join(dataDir, 'advisors.json');
    this.loadFromDisk();
    
    console.log(`[PersistentAdvisorRepository] Initialized with ${this.advisors.size} advisors`);
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        const advisorsArray = JSON.parse(data);
        
        advisorsArray.forEach((advisorData: any) => {
          const advisor = new Advisor({
            id: advisorData.id,
            email: advisorData.email,
            password: advisorData.password,
            firstName: advisorData.firstName,
            lastName: advisorData.lastName,
            createdAt: advisorData.createdAt ? new Date(advisorData.createdAt) : undefined,
          });
          this.advisors.set(advisor.id, advisor);
        });
        
        console.log(`[PersistentAdvisorRepository] Loaded ${this.advisors.size} advisors from disk`);
      }
    } catch (error) {
      console.error('[PersistentAdvisorRepository] Error loading data:', error);
    }
  }

  private saveToDisk(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    this.saveTimer = setTimeout(() => {
      try {
        const advisorsArray = Array.from(this.advisors.values()).map(advisor => ({
          id: advisor.id,
          email: advisor.email,
          password: advisor.password,
          firstName: advisor.firstName,
          lastName: advisor.lastName,
          createdAt: advisor.createdAt.toISOString(),
        }));
        
        fs.writeFileSync(this.dataFile, JSON.stringify(advisorsArray, null, 2), 'utf8');
        console.log(`[PersistentAdvisorRepository] Saved ${this.advisors.size} advisors to disk`);
      } catch (error) {
        console.error('[PersistentAdvisorRepository] Error saving data:', error);
      }
    }, 1000);
  }

  async create(advisor: Advisor): Promise<void> {
    this.advisors.set(advisor.id, advisor);
    this.saveToDisk();
  }

  async findById(id: string): Promise<Advisor | null> {
    return this.advisors.get(id) || null;
  }

  async findByEmail(email: string): Promise<Advisor | null> {
    return Array.from(this.advisors.values()).find(a => a.email === email) || null;
  }

  async findAll(): Promise<Advisor[]> {
    return Array.from(this.advisors.values());
  }

  async update(advisor: Advisor): Promise<void> {
    this.advisors.set(advisor.id, advisor);
    this.saveToDisk();
  }

  async delete(id: string): Promise<void> {
    this.advisors.delete(id);
    this.saveToDisk();
  }
}
