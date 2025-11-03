import { CreateBankAccountUseCase } from '../CreateBankAccountUseCase';
import { RegisterClientUseCase, IEmailService } from '../RegisterClientUseCase';
import { InMemoryBankAccountRepository } from '@infrastructure/repositories/in-memory/InMemoryBankAccountRepository';
import { InMemoryClientRepository } from '@infrastructure/repositories/in-memory/InMemoryClientRepository';
import { BankAccount } from '@domain/entities/BankAccount';

class MockEmailService implements IEmailService {
  async sendConfirmationEmail(): Promise<void> {
    // Mock implementation
  }
}

describe('CreateBankAccountUseCase', () => {
  let createAccountUseCase: CreateBankAccountUseCase;
  let registerUseCase: RegisterClientUseCase;
  let bankAccountRepository: InMemoryBankAccountRepository;
  let clientRepository: InMemoryClientRepository;
  let emailService: MockEmailService;

  beforeEach(() => {
    bankAccountRepository = new InMemoryBankAccountRepository();
    clientRepository = new InMemoryClientRepository();
    emailService = new MockEmailService();
    createAccountUseCase = new CreateBankAccountUseCase(bankAccountRepository, clientRepository);
    registerUseCase = new RegisterClientUseCase(clientRepository, emailService);
  });

  it('should create a bank account with valid data', async () => {
    const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
    client.confirmEmail();
    await clientRepository.update(client);

    const account = await createAccountUseCase.execute(client.id, 'My Checking Account', 1000, 'EUR');

    expect(account).toBeInstanceOf(BankAccount);
    expect(account.clientId).toBe(client.id);
    expect(account.accountName).toBe('My Checking Account');
    expect(account.balance).toBe(1000);
    expect(account.currency).toBe('EUR');
    expect(account.isActive).toBe(true);
    expect(account.iban).toBeDefined();
    expect(BankAccount.validateIBAN(account.iban)).toBe(true);
  });

  it('should create account with default values', async () => {
    const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
    client.confirmEmail();
    await clientRepository.update(client);

    const account = await createAccountUseCase.execute(client.id, 'Savings Account');

    expect(account.balance).toBe(0);
    expect(account.currency).toBe('EUR');
  });

  it('should throw error for non-existent client', async () => {
    await expect(createAccountUseCase.execute('invalid-client-id', 'Account', 100)).rejects.toThrow('Client not found');
  });

  it('should throw error if client email not confirmed', async () => {
    const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');

    await expect(createAccountUseCase.execute(client.id, 'Account', 100)).rejects.toThrow(
      'Client email must be confirmed before creating a bank account'
    );
  });

  it('should throw error for empty account name', async () => {
    const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
    client.confirmEmail();
    await clientRepository.update(client);

    await expect(createAccountUseCase.execute(client.id, '', 100)).rejects.toThrow('Account name is required');
  });

  it('should throw error for negative initial balance', async () => {
    const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
    client.confirmEmail();
    await clientRepository.update(client);

    await expect(createAccountUseCase.execute(client.id, 'Account', -100)).rejects.toThrow(
      'Initial balance cannot be negative'
    );
  });

  it('should generate unique IBAN', async () => {
    const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
    client.confirmEmail();
    await clientRepository.update(client);

    const account1 = await createAccountUseCase.execute(client.id, 'Account 1', 100);
    const account2 = await createAccountUseCase.execute(client.id, 'Account 2', 200);

    expect(account1.iban).not.toBe(account2.iban);
  });

  it('should trim account name', async () => {
    const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
    client.confirmEmail();
    await clientRepository.update(client);

    const account = await createAccountUseCase.execute(client.id, '  My Account  ', 100);

    expect(account.accountName).toBe('My Account');
  });
});
