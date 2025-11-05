import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface RefreshTokenResult {
  user: User;
  message: string;
}

export class RefreshTokenUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: RefreshTokenDTO): Promise<RefreshTokenResult> {
    // Trouver l'utilisateur par refresh token
    const user = await this.userRepository.findByRefreshToken(dto.refreshToken);

    if (!user) {
      throw new Error('Token de rafraîchissement invalide');
    }

    // Vérifier si l'email est confirmé
    if (!user.isEmailConfirmed) {
      throw new Error('Email non confirmé');
    }

    return {
      user,
      message: 'Token rafraîchi avec succès',
    };
  }
}
