import { User } from '../entities/User';

/**
 * Interface IUserRepository - Contrat pour la persistance des utilisateurs
 * 
 * Définit les opérations de persistence pour l'entité User.
 * Cette interface suit le pattern Repository de la Clean Architecture,
 * permettant l'indépendance entre le domaine et l'infrastructure.
 * 
 * @domain Repository Interface - Couche Domain
 */
export interface IUserRepository {
  /**
   * Crée un nouvel utilisateur dans la base de données
   * @param user - L'entité utilisateur à créer
   * @returns L'utilisateur créé avec son ID généré
   */
  create(user: User): Promise<User>;

  /**
   * Trouve un utilisateur par son identifiant unique
   * @param id - Identifiant de l'utilisateur
   * @returns L'utilisateur trouvé ou null si inexistant
   */
  findById(id: string): Promise<User | null>;

  /**
   * Trouve un utilisateur par son adresse email
   * @param email - Adresse email de l'utilisateur
   * @returns L'utilisateur trouvé ou null si inexistant
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Trouve un utilisateur par son token de confirmation d'email
   * Utilisé lors du processus de vérification d'email
   * @param token - Token de confirmation
   * @returns L'utilisateur trouvé ou null si le token est invalide
   */
  findByEmailConfirmationToken(token: string): Promise<User | null>;

  /**
   * Trouve un utilisateur par son refresh token JWT
   * Utilisé pour le rafraîchissement des tokens d'authentification
   * @param refreshToken - Token de rafraîchissement
   * @returns L'utilisateur trouvé ou null si le token est invalide
   */
  findByRefreshToken(refreshToken: string): Promise<User | null>;

  /**
   * Met à jour les informations d'un utilisateur existant
   * @param user - L'entité utilisateur avec les nouvelles données
   * @returns L'utilisateur mis à jour
   */
  update(user: User): Promise<User>;

  /**
   * Supprime un utilisateur de la base de données
   * @param id - Identifiant de l'utilisateur à supprimer
   */
  delete(id: string): Promise<void>;

  /**
   * Liste tous les utilisateurs avec pagination
   * @param skip - Nombre d'utilisateurs à ignorer (défaut: 0)
   * @param limit - Nombre maximum d'utilisateurs à retourner (défaut: 20)
   * @returns Liste paginée des utilisateurs
   */
  findAll(skip?: number, limit?: number): Promise<User[]>;

  /**
   * Compte le nombre total d'utilisateurs enregistrés
   * @returns Nombre total d'utilisateurs
   */
  count(): Promise<number>;

  /**
   * Recherche des utilisateurs par nom ou prénom (recherche insensible à la casse)
   * @param query - Texte de recherche
   * @param skip - Nombre de résultats à ignorer (pagination)
   * @param limit - Nombre maximum de résultats (pagination)
   * @returns Liste des utilisateurs correspondant à la recherche
   */
  searchByName(query: string, skip?: number, limit?: number): Promise<User[]>;

  /**
   * Trouve tous les profils utilisateurs définis comme publics
   * @param skip - Nombre de profils à ignorer (pagination)
   * @param limit - Nombre maximum de profils à retourner (pagination)
   * @returns Liste des profils publics
   */
  findPublicProfiles(skip?: number, limit?: number): Promise<User[]>;
}
