import { Client } from '../../domain/entities/Client';
import { IClientRepository } from '../../domain/repositories/IClientRepository';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

export class CreateClientByDirectorUseCase {
  constructor(private clientRepository: IClientRepository) {}

  async execute(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string
  ): Promise<Client> {
    // Validate inputs
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!firstName || firstName.trim().length === 0) {
      throw new Error('First name is required');
    }

    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    // Check if client already exists
    const existingClient = await this.clientRepository.findByEmail(email.toLowerCase());
    if (existingClient) {
      throw new Error('A client with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create client (director creates pre-confirmed accounts)
    const client = new Client({
      id: uuidv4(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber?.trim(),
      isEmailConfirmed: true, // Director-created accounts are pre-confirmed
      isBanned: false,
      createdAt: new Date(),
    });

    await this.clientRepository.create(client);
    return client;
  }
}
