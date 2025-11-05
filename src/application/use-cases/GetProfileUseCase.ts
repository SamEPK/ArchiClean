import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export interface GetProfileDTO {
  userId: string;
  requestingUserId: string;
}

export interface GetProfileResult {
  user: User | Partial<User>;
  message: string;
}

export class GetProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: GetProfileDTO): Promise<GetProfileResult> {
    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier si l'utilisateur peut accéder à ce profil
    if (!user.canAccessProfile(dto.requestingUserId)) {
      // Retourner seulement le profil public
      return {
        user: user.toPublicProfile(),
        message: 'Profil public récupéré avec succès',
      };
    }

    // Retourner le profil complet
    return {
      user,
      message: 'Profil récupéré avec succès',
    };
  }
}
