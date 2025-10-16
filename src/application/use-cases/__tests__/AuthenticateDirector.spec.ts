import { AuthenticateDirector } from '../AuthenticateDirector';
import { InMemoryAdminRepository } from '@infrastructure/repositories/in-memory/InMemoryAdminRepository';
import { BankDirector } from '@domain/entities/BankDirector';

describe('AuthenticateDirector', () => {
  it('registers and authenticates a director', async () => {
    const repo = new InMemoryAdminRepository();
    const useCase = new AuthenticateDirector(repo);
    const dir = new BankDirector({ id: 'd1', email: 'a@b.com', password: 'pwd', firstName: 'A', lastName: 'B' });
    await useCase.register(dir);
    const auth = await useCase.execute('a@b.com', 'pwd');
    expect(auth).not.toBeNull();
    expect(auth?.email).toBe('a@b.com');
  });
});
