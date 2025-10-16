import { SavingsAccount } from '../entities/SavingsAccount';

export interface ISavingsAccountRepository {
  save(savingsAccount: SavingsAccount): Promise<SavingsAccount>;
  findById(id: string): Promise<SavingsAccount | null>;
  findByAccountId(accountId: string): Promise<SavingsAccount | null>;
  findAll(): Promise<SavingsAccount[]>;
  update(savingsAccount: SavingsAccount): Promise<SavingsAccount>;
  delete(id: string): Promise<void>;
  findAccountsNeedingInterest(currentDate: Date): Promise<SavingsAccount[]>;
}
