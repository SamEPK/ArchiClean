import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { BankDirector } from '../../domain/entities/BankDirector';
function simpleHash(input: string): string {
  // Simple deterministic hash for demo only (not secure)
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16);
}

export class AuthenticateDirector {
  constructor(private adminRepo: IAdminRepository) {}

  async register(director: BankDirector): Promise<void> {
    director.password = simpleHash(director.password);
    await this.adminRepo.createDirector(director);
  }

  async execute(email: string, password: string): Promise<BankDirector | null> {
    const d = await this.adminRepo.findDirectorByEmail(email);
    if (!d) return null;
    const hashed = simpleHash(password);
    if (d.password === hashed) return d;
    return null;
  }
}
