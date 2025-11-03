import { CreateBankAccountUseCase } from '../CreateBankAccountUseCase';
import { DeleteBankAccountUseCase } from '../DeleteBankAccountUseCase';
import { UpdateBankAccountNameUseCase } from '../UpdateBankAccountNameUseCase';
import { ListBankAccountsUseCase } from '../ListBankAccountsUseCase';
import { RegisterClientUseCase, IEmailService } from '../RegisterClientUseCase';
import { InMemoryBankAccountRepository } from '@infrastructure/repositories/in-memory/InMemoryBankAccountRepository';
import { InMemoryClientRepository } from '@infrastructure/repositories/in-memory/InMemoryClientRepository';

class MockEmailService implements IEmailService {
  async sendConfirmationEmail(): Promise<void> {
    // Mock implementation
  }
}

describe('Bank Account Management', () => {
  let createAccountUseCase: CreateBankAccountUseCase;
  let deleteAccountUseCase: DeleteBankAccountUseCase;
  let updateAccountUseCase: UpdateBankAccountNameUseCase;
  let listAccountsUseCase: ListBankAccountsUseCase;
  let registerUseCase: RegisterClientUseCase;
  let bankAccountRepository: InMemoryBankAccountRepository;
  let clientRepository: InMemoryClientRepository;
  let emailService: MockEmailService;

  beforeEach(() => {
    bankAccountRepository = new InMemoryBankAccountRepository();
    clientRepository = new InMemoryClientRepository();
    emailService = new MockEmailService();
    createAccountUseCase = new CreateBankAccountUseCase(bankAccountRepository, clientRepository);
    deleteAccountUseCase = new DeleteBankAccountUseCase(bankAccountRepository);
    updateAccountUseCase = new UpdateBankAccountNameUseCase(bankAccountRepository);
    listAccountsUseCase = new ListBankAccountsUseCase(bankAccountRepository);
    registerUseCase = new RegisterClientUseCase(clientRepository, emailService);
  });

  describe('DeleteBankAccountUseCase', () => {
    it('should delete account with zero balance', async () => {
      const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
      client.confirmEmail();
      await clientRepository.update(client);

      const account = await createAccountUseCase.execute(client.id, 'Test Account', 0);

      const result = await deleteAccountUseCase.execute(account.id, client.id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Bank account deactivated successfully');

      const updatedAccount = await bankAccountRepository.findById(account.id);
      expect(updatedAccount?.isActive).toBe(false);
    });

    it('should not delete account with positive balance', async () => {
      const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
      client.confirmEmail();
      await clientRepository.update(client);

      const account = await createAccountUseCase.execute(client.id, 'Test Account', 1000);

      const result = await deleteAccountUseCase.execute(account.id, client.id);

      expect(result.success).toBe(false);
      expect(result.message).toContain('positive balance');
    });

    it('should not delete account of another client', async () => {
      const { client: client1 } = await registerUseCase.execute('client1@example.com', 'Password123', 'John', 'Doe');
      const { client: client2 } = await registerUseCase.execute('client2@example.com', 'Password123', 'Jane', 'Smith');
      client1.confirmEmail();
      client2.confirmEmail();
      await clientRepository.update(client1);
      await clientRepository.update(client2);

      const account = await createAccountUseCase.execute(client1.id, 'Test Account', 0);

      const result = await deleteAccountUseCase.execute(account.id, client2.id);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unauthorized');
    });

    it('should not delete non-existent account', async () => {
      const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
      client.confirmEmail();
      await clientRepository.update(client);

      const result = await deleteAccountUseCase.execute('invalid-id', client.id);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Bank account not found');
    });
  });

  describe('UpdateBankAccountNameUseCase', () => {
    it('should update account name', async () => {
      const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
      client.confirmEmail();
      await clientRepository.update(client);

      const account = await createAccountUseCase.execute(client.id, 'Old Name', 100);

      const updatedAccount = await updateAccountUseCase.execute(account.id, client.id, 'New Name');

      expect(updatedAccount.accountName).toBe('New Name');
    });

    it('should throw error for unauthorized client', async () => {
      const { client: client1 } = await registerUseCase.execute('client1@example.com', 'Password123', 'John', 'Doe');
      const { client: client2 } = await registerUseCase.execute('client2@example.com', 'Password123', 'Jane', 'Smith');
      client1.confirmEmail();
      client2.confirmEmail();
      await clientRepository.update(client1);
      await clientRepository.update(client2);

      const account = await createAccountUseCase.execute(client1.id, 'Test Account', 100);

      await expect(updateAccountUseCase.execute(account.id, client2.id, 'New Name')).rejects.toThrow('Unauthorized');
    });

    it('should throw error for empty name', async () => {
      const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
      client.confirmEmail();
      await clientRepository.update(client);

      const account = await createAccountUseCase.execute(client.id, 'Test Account', 100);

      await expect(updateAccountUseCase.execute(account.id, client.id, '')).rejects.toThrow(
        'Account name cannot be empty'
      );
    });

    it('should not update inactive account', async () => {
      const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
      client.confirmEmail();
      await clientRepository.update(client);

      const account = await createAccountUseCase.execute(client.id, 'Test Account', 0);
      await deleteAccountUseCase.execute(account.id, client.id);

      await expect(updateAccountUseCase.execute(account.id, client.id, 'New Name')).rejects.toThrow(
        'Cannot update inactive account'
      );
    });
  });

  describe('ListBankAccountsUseCase', () => {
    it('should list all active accounts for a client', async () => {
      const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
      client.confirmEmail();
      await clientRepository.update(client);

      await createAccountUseCase.execute(client.id, 'Account 1', 100);
      await createAccountUseCase.execute(client.id, 'Account 2', 200);

      const accounts = await listAccountsUseCase.execute(client.id);

      expect(accounts).toHaveLength(2);
      expect(accounts.every(acc => acc.isActive)).toBe(true);
    });

    it('should exclude inactive accounts by default', async () => {
      const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
      client.confirmEmail();
      await clientRepository.update(client);

      const account1 = await createAccountUseCase.execute(client.id, 'Account 1', 0);
      await createAccountUseCase.execute(client.id, 'Account 2', 100);

      await deleteAccountUseCase.execute(account1.id, client.id);

      const accounts = await listAccountsUseCase.execute(client.id);

      expect(accounts).toHaveLength(1);
      expect(accounts[0].accountName).toBe('Account 2');
    });

    it('should include inactive accounts when requested', async () => {
      const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
      client.confirmEmail();
      await clientRepository.update(client);

      const account1 = await createAccountUseCase.execute(client.id, 'Account 1', 0);
      await createAccountUseCase.execute(client.id, 'Account 2', 100);

      await deleteAccountUseCase.execute(account1.id, client.id);

      const accounts = await listAccountsUseCase.execute(client.id, true);

      expect(accounts).toHaveLength(2);
    });

    it('should return empty array if no accounts', async () => {
      const { client } = await registerUseCase.execute('test@example.com', 'Password123', 'John', 'Doe');
      client.confirmEmail();
      await clientRepository.update(client);

      const accounts = await listAccountsUseCase.execute(client.id);

      expect(accounts).toHaveLength(0);
    });
  });
});
