import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, UserRole } from '../../domain/entities/User';
import { HashService } from '../../infrastructure/services/HashService';
import { EmailService } from '../../infrastructure/services/EmailService';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
  isPublic?: boolean;
}

export interface RegisterUserResult {
  user: User;
  message: string;
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: HashService,
    private emailService: EmailService
  ) {}

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
      isEmailConfirmed: false,
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
