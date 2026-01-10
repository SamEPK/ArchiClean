import { Advisor } from '../../domain/entities/Advisor';
import { IAdvisorRepository } from '../../domain/repositories/IAdvisorRepository';
import * as bcrypt from 'bcryptjs';

export interface AuthenticateAdvisorResult {
  success: boolean;
  message: string;
  advisor?: Advisor;
}

export class AuthenticateAdvisorUseCase {
  constructor(private advisorRepository: IAdvisorRepository) {}

  async execute(email: string, password: string): Promise<AuthenticateAdvisorResult> {
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required',
      };
    }

    const advisor = await this.advisorRepository.findByEmail(email);

    if (!advisor) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, advisor.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    return {
      success: true,
      message: 'Authentication successful',
      advisor,
    };
  }
}
