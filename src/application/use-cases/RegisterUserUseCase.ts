import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, UserRole } from '../../domain/entities/User';
import { HashService } from '../../infrastructure/services/HashService';
import { EmailService } from '../../infrastructure/services/EmailService';
import { v4 as uuidv4 } from 'uuid';

/**
 * DTO (Data Transfer Object) pour l'inscription d'un utilisateur
 */
export interface RegisterUserDTO {
  /** Adresse email (sera utilisée comme identifiant) */
  email: string;
  /** Mot de passe (sera hashé avant stockage) */
  password: string;
  /** Prénom */
  firstName: string;
  /** Nom de famille */
  lastName: string;
  /** Numéro de téléphone (optionnel) */
  phoneNumber?: string;
  /** Rôle dans le système (par défaut: USER) */
  role?: UserRole;
  /** Profil public ou privé (par défaut: false) */
  isPublic?: boolean;
}

/**
 * Résultat de l'inscription
 */
export interface RegisterUserResult {
  /** Utilisateur créé */
  user: User;
  /** Message de confirmation */
  message: string;
}

/**
 * Use Case: Inscription d'un nouvel utilisateur
 * 
 * Responsabilités:
 * - Vérifier l'unicité de l'email
 * - Valider la robustesse du mot de passe
 * - Hasher le mot de passe
 * - Créer l'entité User
 * - Générer un token de confirmation d'email
 * - Sauvegarder l'utilisateur
 * - Envoyer l'email de confirmation
 * 
 * @application Use Case - Couche Application
 */
export class RegisterUserUseCase {
  /**
   * Constructeur avec injection de dépendances
   * @param userRepository - Repository pour la persistance des utilisateurs
   * @param hashService - Service de hachage des mots de passe (bcrypt)
   * @param emailService - Service d'envoi d'emails
   */
  constructor(
    private userRepository: IUserRepository,
    private hashService: HashService,
    private emailService: EmailService
  ) {}

  /**
   * Exécute le cas d'utilisation d'inscription
   * 
   * @param dto - Données d'inscription de l'utilisateur
   * @returns Résultat contenant l'utilisateur créé et un message
   * @throws {Error} Si l'email existe déjà
   * @throws {Error} Si le mot de passe ne respecte pas les critères de sécurité
   */
  async execute(dto: RegisterUserDTO): Promise<RegisterUserResult> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Valider le mot de passe
    this.validatePassword(dto.password);

    // Hasher le mot de passe
    const hashedPassword = await this.hashService.hashPassword(dto.password);

    // Créer l'utilisateur
    const user = new User({
      id: uuidv4(),
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      role: dto.role || UserRole.USER,
      isPublic: dto.isPublic || false,
      isEmailConfirmed: true,
      createdAt: new Date(),
    });

    // Générer le token de confirmation
    const confirmationToken = user.generateEmailConfirmationToken();

    // Sauvegarder l'utilisateur
    const savedUser = await this.userRepository.create(user);

    // Envoyer l'email de confirmation (asynchrone, ne pas bloquer)
    this.emailService
      .sendUserConfirmationEmail(savedUser.email, confirmationToken, savedUser.firstName)
      .catch(error => {
        console.error('Error sending confirmation email:', error);
      });

    return {
      user: savedUser,
      message: 'Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.',
    };
  }

  /**
   * Valide la robustesse du mot de passe
   * 
   * Critères de sécurité:
   * - Minimum 8 caractères
   * - Au moins une majuscule
   * - Au moins une minuscule
   * - Au moins un chiffre
   * - Au moins un caractère spécial (!@#$%^&*)
   * 
   * @param password - Mot de passe à valider
   * @throws {Error} Si le mot de passe ne respecte pas les critères
   * @private
   */
  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins une minuscule');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins un chiffre');
    }

    if (!/[!@#$%^&*]/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)');
    }
  }
}
