import { Client } from '../../domain/entities/Client';
import { IClientRepository } from '../../domain/repositories/IClientRepository';

export class BanClientUseCase {
  constructor(private clientRepository: IClientRepository) {}

  async execute(clientId: string, banned: boolean): Promise<Client> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    if (banned) {
      client.ban();
    } else {
      client.unban();
    }

    await this.clientRepository.update(client);
    return client;
  }
}
