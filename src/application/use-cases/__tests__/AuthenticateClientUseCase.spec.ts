import { AuthenticateClientUseCase } from '../AuthenticateClientUseCase';
import { RegisterClientUseCase, IEmailService } from '../RegisterClientUseCase';
import { InMemoryClientRepository } from '@infrastructure/repositories/in-memory/InMemoryClientRepository';
import { Client } from '@domain/entities/Client';

class MockEmailService implements IEmailService {
  async sendConfirmationEmail(): Promise<void> {
    // Mock implementation
  }
}

describe('AuthenticateClientUseCase', () => {
  let authUseCase: AuthenticateClientUseCase;
  let registerUseCase: RegisterClientUseCase;
  let clientRepository: InMemoryClientRepository;
  let emailService: MockEmailService;

  beforeEach(() => {
    clientRepository = new InMemoryClientRepository();
    emailService = new MockEmailService();
    authUseCase = new AuthenticateClientUseCase(clientRepository);
    registerUseCase = new RegisterClientUseCase(clientRepository, emailService);
  });

  it('should authenticate a client with valid credentials', async () => {
    const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
    client.confirmEmail();
    await clientRepository.update(client);

    const result = await authUseCase.execute('test@example.com', 'Password123');

    expect(result.success).toBe(true);
    expect(result.client).toBeDefined();
    expect(result.client?.email).toBe('test@example.com');
    expect(result.message).toBe('Authentication successful');
  });

  it('should reject authentication with invalid email', async () => {
    const result = await authUseCase.execute('nonexistent@example.com', 'Password123');

    expect(result.success).toBe(false);
    expect(result.client).toBeUndefined();
    expect(result.message).toBe('Invalid email or password');
  });

  it('should reject authentication with invalid password', async () => {
    const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
    client.confirmEmail();
    await clientRepository.update(client);

    const result = await authUseCase.execute('test@example.com', 'WrongPassword123');

    expect(result.success).toBe(false);
    expect(result.client).toBeUndefined();
    expect(result.message).toBe('Invalid email or password');
  });

  it('should reject authentication if email is not confirmed', async () => {
    await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');

    const result = await authUseCase.execute('test@example.com', 'Password123');

    expect(result.success).toBe(false);
    expect(result.client).toBeUndefined();
    expect(result.message).toBe('Please confirm your email before logging in');
  });

  it('should reject authentication with missing email', async () => {
    const result = await authUseCase.execute('', 'Password123');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Email and password are required');
  });

  it('should reject authentication with missing password', async () => {
    const result = await authUseCase.execute('test@example.com', '');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Email and password are required');
  });

  it('should handle case-insensitive email', async () => {
    const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
    client.confirmEmail();
    await clientRepository.update(client);

    const result = await authUseCase.execute('TEST@EXAMPLE.COM', 'Password123');

    expect(result.success).toBe(true);
    expect(result.client).toBeDefined();
  });
});
