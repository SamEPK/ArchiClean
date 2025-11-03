import { ConfirmEmailUseCase } from '../ConfirmEmailUseCase';
import { RegisterClientUseCase, IEmailService } from '../RegisterClientUseCase';
import { InMemoryClientRepository } from '@infrastructure/repositories/in-memory/InMemoryClientRepository';

class MockEmailService implements IEmailService {
  async sendConfirmationEmail(): Promise<void> {
    // Mock implementation
  }
}

describe('ConfirmEmailUseCase', () => {
  let confirmUseCase: ConfirmEmailUseCase;
  let registerUseCase: RegisterClientUseCase;
  let clientRepository: InMemoryClientRepository;
  let emailService: MockEmailService;

  beforeEach(() => {
    clientRepository = new InMemoryClientRepository();
    emailService = new MockEmailService();
    confirmUseCase = new ConfirmEmailUseCase(clientRepository);
    registerUseCase = new RegisterClientUseCase(clientRepository, emailService);
  });

  it('should confirm email with valid token', async () => {
    const { confirmationToken } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');

    const result = await confirmUseCase.execute(confirmationToken);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Email confirmed successfully');

    const client = await clientRepository.findByEmail('test@example.com');
    expect(client?.isEmailConfirmed).toBe(true);
    expect(client?.emailConfirmationToken).toBeUndefined();
  });

  it('should reject invalid token', async () => {
    const result = await confirmUseCase.execute('invalid-token');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid or expired confirmation token');
  });

  it('should reject empty token', async () => {
    const result = await confirmUseCase.execute('');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid confirmation token');
  });

  it('should handle already confirmed email', async () => {
    const { confirmationToken, client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');

    const firstResult = await confirmUseCase.execute(confirmationToken);
    expect(firstResult.success).toBe(true);

    // After confirmation, the token is cleared, so trying again with the same token should fail
    const result = await confirmUseCase.execute(confirmationToken);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid or expired confirmation token');
  });

  it('should reject expired token', async () => {
    const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');

    const expiredToken = client.emailConfirmationToken!;
    client.emailConfirmationTokenExpiry = new Date(Date.now() - 1000);
    await clientRepository.update(client);

    const result = await confirmUseCase.execute(expiredToken);

    expect(result.success).toBe(false);
    expect(result.message).toContain('expired');
  });
});
