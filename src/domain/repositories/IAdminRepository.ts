import { BankDirector } from '../entities/BankDirector';
import { Advisor } from '../entities/Advisor';

export interface IAdminRepository {
  createDirector(director: BankDirector): Promise<void>;
  findDirectorByEmail(email: string): Promise<BankDirector | null>;
  createAdvisor(advisor: Advisor): Promise<void>;
  findAdvisorByEmail(email: string): Promise<Advisor | null>;
  banClient(clientId: string): Promise<void>;
}
