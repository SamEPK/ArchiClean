import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export interface SearchUsersDTO {
  query: string;
  skip?: number;
  limit?: number;
}

export interface SearchUsersResult {
  users: Partial<User>[];
  total: number;
  message: string;
}

export class SearchUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: SearchUsersDTO): Promise<SearchUsersResult> {
    const skip = dto.skip || 0;
    const limit = dto.limit || 20;

    if (!dto.query || dto.query.trim().length < 2) {
      throw new Error('La recherche doit contenir au moins 2 caractères');
    }

    const users = await this.userRepository.searchByName(dto.query, skip, limit);
    const total = users.length;

    // Retourner seulement les profils publics
    const publicUsers = users.map(user => user.toPublicProfile());

    return {
      users: publicUsers,
      total,
      message: 'Recherche effectuée avec succès',
    };
  }
}
