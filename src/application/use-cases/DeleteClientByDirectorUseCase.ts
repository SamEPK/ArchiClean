import { IClientRepository } from '../../domain/repositories/IClientRepository';
import { IBankAccountRepository } from '../../domain/repositories/IBankAccountRepository';

export class DeleteClientByDirectorUseCase {
  constructor(
    private clientRepository: IClientRepository,
    private bankAccountRepository: IBankAccountRepository
  ) {}

  async execute(clientId: string): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Check if client has active bank accounts
    const bankAccounts = await this.bankAccountRepository.findByClientId(clientId);
    const activeAccounts = bankAccounts.filter(account => account.isActive);

    if (activeAccounts.length > 0) {
      throw new Error('Cannot delete client with active bank accounts. Please close all accounts first.');
    }

    await this.clientRepository.delete(clientId);
  }
}
