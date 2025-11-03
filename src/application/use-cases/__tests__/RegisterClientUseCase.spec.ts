import { RegisterClientUseCase, IEmailService } from '../RegisterClientUseCase';
import { InMemoryClientRepository } from '@infrastructure/repositories/in-memory/InMemoryClientRepository';
import { Client } from '@domain/entities/Client';

class MockEmailService implements IEmailService {
  public sentEmails: Array<{ email: string; token: string; clientName: string }> = [];

  async sendConfirmationEmail(email: string, token: string, clientName: string): Promise<void> {
    this.sentEmails.push({ email, token, clientName });
  }
}

describe('RegisterClientUseCase', () => {
  let useCase: RegisterClientUseCase;
  let clientRepository: InMemoryClientRepository;
  let emailService: MockEmailService;

  beforeEach(() => {
    clientRepository = new InMemoryClientRepository();
    emailService = new MockEmailService();
    useCase = new RegisterClientUseCase(clientRepository, emailService);
  });

  it('should register a new client with valid data', async () => {
    const result = await useCase.execute('test@example.com', 'Password123', 'John', 'Doe', '0123456789');

    expect(result.client).toBeInstanceOf(Client);
    expect(result.client.email).toBe('test@example.com');
    expect(result.client.firstName).toBe('John');
    expect(result.client.lastName).toBe('Doe');
    expect(result.client.phoneNumber).toBe('0123456789');
    expect(result.client.isEmailConfirmed).toBe(false);
    expect(result.confirmationToken).toBeDefined();
    expect(emailService.sentEmails).toHaveLength(1);
  });

  it('should hash the password', async () => {
    const result = await useCase.execute('test@example.com', 'Password123', 'John', 'Doe');

    expect(result.client.password).not.toBe('Password123');
    expect(result.client.password.length).toBeGreaterThan(20);
  });

  it('should throw error for invalid email format', async () => {
    await expect(useCase.execute('invalid-email', 'Password123', 'John', 'Doe')).rejects.toThrow('Invalid email format');
  });

  it('should throw error for weak password', async () => {
    await expect(useCase.execute('test@example.com', 'weak', 'John', 'Doe')).rejects.toThrow(
      'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
    );
  });

  it('should throw error if email already exists', async () => {
    await useCase.execute('test@example.com', 'Password123', 'John', 'Doe');

    await expect(useCase.execute('test@example.com', 'Password456', 'Jane', 'Smith')).rejects.toThrow(
      'Email already registered'
    );
  });

  it('should trim and lowercase email', async () => {
    const result = await useCase.execute('  TEST@EXAMPLE.COM  ', 'Password123', 'John', 'Doe');

    expect(result.client.email).toBe('test@example.com');
  });

  it('should trim names', async () => {
    const result = await useCase.execute('test@example.com', 'Password123', '  John  ', '  Doe  ');

    expect(result.client.firstName).toBe('John');
    expect(result.client.lastName).toBe('Doe');
  });

  it('should work without phone number', async () => {
    const result = await useCase.execute('test@example.com', 'Password123', 'John', 'Doe');

    expect(result.client.phoneNumber).toBeUndefined();
  });
});
