import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { HashService } from '../../infrastructure/services/HashService';

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface LoginUserResult {
  user: User;
  message: string;
}

export class LoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: HashService
  ) {}

  async execute(dto: LoginUserDTO): Promise<LoginUserResult> {
    // Trouver l'utilisateur
    const user = await this.userRepository.findByEmail(dto.email);
    
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await this.hashService.comparePassword(
      dto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier si l'email est confirmé
    if (!user.isEmailConfirmed) {
      throw new Error('Veuillez confirmer votre email avant de vous connecter');
    }

    // Mettre à jour la date de dernière connexion
    user.updateLastLogin();
    await this.userRepository.update(user);

    return {
      user,
      message: 'Connexion réussie',
    };
  }
}
