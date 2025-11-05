import { User } from '../entities/User';

export interface IUserRepository {
  /**
   * Crée un nouvel utilisateur
   */
  create(user: User): Promise<User>;

  /**
   * Trouve un utilisateur par son ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Trouve un utilisateur par son email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Trouve un utilisateur par son token de confirmation d'email
   */
  findByEmailConfirmationToken(token: string): Promise<User | null>;

  /**
   * Trouve un utilisateur par son refresh token
   */
  findByRefreshToken(refreshToken: string): Promise<User | null>;

  /**
   * Met à jour un utilisateur
   */
  update(user: User): Promise<User>;

  /**
   * Supprime un utilisateur
   */
  delete(id: string): Promise<void>;

  /**
   * Liste tous les utilisateurs (avec pagination)
   */
  findAll(skip?: number, limit?: number): Promise<User[]>;

  /**
   * Compte le nombre total d'utilisateurs
   */
  count(): Promise<number>;

  /**
   * Recherche des utilisateurs par nom
   */
  searchByName(query: string, skip?: number, limit?: number): Promise<User[]>;

  /**
   * Trouve tous les profils publics
   */
  findPublicProfiles(skip?: number, limit?: number): Promise<User[]>;
}
