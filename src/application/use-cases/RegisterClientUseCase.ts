import * as bcrypt from 'bcryptjs';
import { Client } from '@domain/entities/Client';
import { IClientRepository } from '@domain/repositories/IClientRepository';

export interface IEmailService {
  sendConfirmationEmail(email: string, token: string, clientName: string): Promise<void>;
}

export class RegisterClientUseCase {
  constructor(
    private clientRepository: IClientRepository,
    private emailService: IEmailService
  ) {}

  async execute(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string
  ): Promise<{ client: Client; confirmationToken: string }> {
    const trimmedEmail = email.toLowerCase().trim();

    if (!this.isValidEmail(trimmedEmail)) {
      throw new Error('Invalid email format');
    }

    if (!this.isValidPassword(password)) {
      throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
    }

    const existingClient = await this.clientRepository.findByEmail(trimmedEmail);
    if (existingClient) {
      throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const client = new Client({
      id: this.generateId(),
      email: trimmedEmail,
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber?.trim(),
      isEmailConfirmed: false,
      createdAt: new Date(),
    });

    const confirmationToken = client.generateEmailConfirmationToken();

    await this.clientRepository.create(client);

    try {
      await this.emailService.sendConfirmationEmail(client.email, confirmationToken, client.getFullName());
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }

    return { client, confirmationToken };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    if (password.length < 8) {
      return false;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers;
  }

  private generateId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
