import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { BankDirector } from '../../domain/entities/BankDirector';
import * as bcrypt from 'bcryptjs';

export class AuthenticateDirector {
  constructor(private adminRepo: IAdminRepository) {}

  async register(director: BankDirector): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    director.password = await bcrypt.hash(director.password, salt);
    await this.adminRepo.createDirector(director);
  }

  async execute(email: string, password: string): Promise<BankDirector | null> {
    const d = await this.adminRepo.findDirectorByEmail(email);
    if (!d) return null;
    const match = await bcrypt.compare(password, d.password);
    return match ? d : null;
  }
}
