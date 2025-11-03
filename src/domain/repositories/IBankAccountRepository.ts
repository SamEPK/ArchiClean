import { BankAccount } from '../entities/BankAccount';

export interface IBankAccountRepository {
  create(account: BankAccount): Promise<void>;
  findById(id: string): Promise<BankAccount | null>;
  findByIban(iban: string): Promise<BankAccount | null>;
  findByClientId(clientId: string): Promise<BankAccount[]>;
  update(account: BankAccount): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<BankAccount[]>;
}
