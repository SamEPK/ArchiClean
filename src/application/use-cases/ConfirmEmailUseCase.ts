import { IClientRepository } from '@domain/repositories/IClientRepository';

export class ConfirmEmailUseCase {
  constructor(private clientRepository: IClientRepository) {}

  async execute(token: string): Promise<{ success: boolean; message: string }> {
    if (!token || token.trim().length === 0) {
      return { success: false, message: 'Invalid confirmation token' };
    }

    const client = await this.clientRepository.findByEmailConfirmationToken(token);

    if (!client) {
      return { success: false, message: 'Invalid or expired confirmation token' };
    }

    if (client.isEmailConfirmed) {
      return { success: true, message: 'Email already confirmed' };
    }

    if (!client.isTokenValid()) {
      return { success: false, message: 'Confirmation token has expired. Please request a new confirmation email' };
    }

    client.confirmEmail();
    await this.clientRepository.update(client);

    return { success: true, message: 'Email confirmed successfully' };
  }
}
