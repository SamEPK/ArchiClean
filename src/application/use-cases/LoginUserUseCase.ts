import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { HashService } from '../../infrastructure/services/HashService';

/**
 * DTO pour la connexion d'un utilisateur
 */
export interface LoginUserDTO {
  /** Adresse email de l'utilisateur */
  email: string;
  /** Mot de passe en clair */
  password: string;
}

/**
 * Résultat de la connexion
 */
export interface LoginUserResult {
  /** Utilisateur authentifié */
  user: User;
  /** Message de confirmation */
  message: string;
}

/**
 * Use Case: Authentification d'un utilisateur
 * 
 * Responsabilités:
 * - Vérifier l'existence de l'utilisateur
 * - Valider le mot de passe
 * - Vérifier la confirmation d'email
 * - Mettre à jour la date de dernière connexion
 * 
 * @application Use Case - Couche Application
 */
export class LoginUserUseCase {
  /**
   * Constructeur avec injection de dépendances
   * @param userRepository - Repository pour accéder aux utilisateurs
   * @param hashService - Service de comparaison des mots de passe hashés
   */
  constructor(
    private userRepository: IUserRepository,
    private hashService: HashService
  ) {}

  /**
   * Exécute le cas d'utilisation de connexion
   * 
   * @param dto - Identifiants de connexion (email, password)
   * @returns Résultat contenant l'utilisateur authentifié
   * @throws {Error} Si l'email est invalide
   * @throws {Error} Si le mot de passe est incorrect
   * @throws {Error} Si l'email n'est pas confirmé
   */
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
