import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export interface UpdateProfileDTO {
  userId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  isPublic?: boolean;
}

export interface UpdateProfileResult {
  user: User;
  message: string;
}

export class UpdateProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: UpdateProfileDTO): Promise<UpdateProfileResult> {
    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Mettre à jour le profil
    user.updateProfile({
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      bio: dto.bio,
      isPublic: dto.isPublic,
    });

    const updatedUser = await this.userRepository.update(user);

    return {
      user: updatedUser,
      message: 'Profil mis à jour avec succès',
    };
  }
}
