import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { EmailService } from '../../infrastructure/services/EmailService';

export interface ConfirmUserEmailDTO {
  token: string;
}

export interface ConfirmUserEmailResult {
  user: User;
  message: string;
}

export class ConfirmUserEmailUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: EmailService
  ) {}

  async execute(dto: ConfirmUserEmailDTO): Promise<ConfirmUserEmailResult> {
    // Trouver l'utilisateur par token
    const user = await this.userRepository.findByEmailConfirmationToken(dto.token);

    if (!user) {
      throw new Error('Token de confirmation invalide');
    }

    // Vérifier si le token est encore valide
    if (!user.isTokenValid()) {
      throw new Error('Le token de confirmation a expiré');
    }

    // Vérifier si l'email n'est pas déjà confirmé
    if (user.isEmailConfirmed) {
      throw new Error('Email déjà confirmé');
    }

    // Confirmer l'email
    user.confirmEmail();
    const updatedUser = await this.userRepository.update(user);

    // Envoyer l'email de bienvenue (asynchrone)
    this.emailService
      .sendWelcomeEmail(updatedUser.email, updatedUser.firstName)
      .catch(error => {
        console.error('Error sending welcome email:', error);
      });

    return {
      user: updatedUser,
      message: 'Email confirmé avec succès. Vous pouvez maintenant vous connecter.',
    };
  }
}
