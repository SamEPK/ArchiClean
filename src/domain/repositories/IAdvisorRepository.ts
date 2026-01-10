import { Advisor } from '../entities/Advisor';

export interface IAdvisorRepository {
  create(advisor: Advisor): Promise<void>;
  findById(id: string): Promise<Advisor | null>;
  findByEmail(email: string): Promise<Advisor | null>;
  findAll(): Promise<Advisor[]>;
  update(advisor: Advisor): Promise<void>;
}
