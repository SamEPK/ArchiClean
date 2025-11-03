import { BankAccount } from '@domain/entities/BankAccount';
import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';
import { IClientRepository } from '@domain/repositories/IClientRepository';

export class CreateBankAccountUseCase {
  constructor(
    private bankAccountRepository: IBankAccountRepository,
    private clientRepository: IClientRepository
  ) {}

  async execute(clientId: string, accountName: string, initialBalance: number = 0, currency: string = 'EUR'): Promise<BankAccount> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    if (!client.isEmailConfirmed) {
      throw new Error('Client email must be confirmed before creating a bank account');
    }

    if (!accountName || accountName.trim().length === 0) {
      throw new Error('Account name is required');
    }

    if (initialBalance < 0) {
      throw new Error('Initial balance cannot be negative');
    }

    const iban = BankAccount.generateIBAN('FR');

    const existingAccount = await this.bankAccountRepository.findByIban(iban);
    if (existingAccount) {
      throw new Error('IBAN already exists, please retry');
    }

    const bankAccount = new BankAccount({
      id: this.generateId(),
      clientId,
      iban,
      accountName: accountName.trim(),
      balance: initialBalance,
      currency,
      isActive: true,
      createdAt: new Date(),
    });

    await this.bankAccountRepository.create(bankAccount);

    return bankAccount;
  }

  private generateId(): string {
    return `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
