import { Advisor } from '../../domain/entities/Advisor';
import { IAdvisorRepository } from '../../domain/repositories/IAdvisorRepository';
import * as bcrypt from 'bcryptjs';
import { uuidv4 } from '@infrastructure/utils/uuid-helper';

export class RegisterAdvisorUseCase {
  constructor(private advisorRepository: IAdvisorRepository) {}

  async execute(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<Advisor> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check if advisor already exists
    const existingAdvisor = await this.advisorRepository.findByEmail(email);
    if (existingAdvisor) {
      throw new Error('Advisor with this email already exists');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    // Validate names
    if (!firstName || firstName.trim().length === 0) {
      throw new Error('First name is required');
    }

    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create advisor
    const advisor = new Advisor({
      id: uuidv4(),
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      createdAt: new Date(),
    });

    await this.advisorRepository.create(advisor);

    return advisor;
  }
}
