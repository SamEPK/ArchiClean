import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export interface GetPublicProfilesDTO {
  skip?: number;
  limit?: number;
}

export interface GetPublicProfilesResult {
  profiles: Partial<User>[];
  total: number;
  message: string;
}

export class GetPublicProfilesUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: GetPublicProfilesDTO): Promise<GetPublicProfilesResult> {
    const skip = dto.skip || 0;
    const limit = dto.limit || 20;

    const users = await this.userRepository.findPublicProfiles(skip, limit);
    const total = users.length;

    // Retourner seulement les profils publics
    const profiles = users.map(user => user.toPublicProfile());

    return {
      profiles,
      total,
      message: 'Profils publics récupérés avec succès',
    };
  }
}
