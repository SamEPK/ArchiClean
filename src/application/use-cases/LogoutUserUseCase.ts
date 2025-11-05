import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export interface LogoutUserDTO {
  userId: string;
}

export interface LogoutUserResult {
  message: string;
}

export class LogoutUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: LogoutUserDTO): Promise<LogoutUserResult> {
    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Supprimer le refresh token
    user.updateRefreshToken(null);
    await this.userRepository.update(user);

    return {
      message: 'Déconnexion réussie',
    };
  }
}
