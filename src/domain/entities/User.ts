/**
 * Énumération des rôles utilisateur dans le système
 * - USER: Utilisateur standard
 * - ADMIN: Administrateur système (gestion globale)
 * - ADVISOR: Conseiller bancaire
 * - DIRECTOR: Directeur de banque
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  ADVISOR = 'ADVISOR',
  DIRECTOR = 'DIRECTOR',
}

/**
 * Interface définissant les propriétés d'un utilisateur
 */
export interface UserProps {
  /** Identifiant unique de l'utilisateur */
  id: string;
  /** Adresse email (unique) */
  email: string;
  /** Mot de passe hashé */
  password: string;
  /** Prénom */
  firstName: string;
  /** Nom de famille */
  lastName: string;
  /** Numéro de téléphone (optionnel) */
  phoneNumber?: string;
  /** Rôle dans le système */
  role: UserRole;
  /** URL de l'avatar (optionnel) */
  avatar?: string;
  /** Biographie/description (optionnel) */
  bio?: string;
  /** Profil visible publiquement */
  isPublic: boolean;
  /** Email confirmé via token */
  isEmailConfirmed: boolean;
  /** Token de confirmation d'email */
  emailConfirmationToken?: string;
  /** Date d'expiration du token de confirmation */
  emailConfirmationTokenExpiry?: Date;
  /** Token de rafraîchissement JWT */
  refreshToken?: string;
  /** Date de dernière connexion */
  lastLoginAt?: Date;
  /** Date de création du compte */
  createdAt: Date;
  /** Date de dernière modification */
  updatedAt?: Date;
}

/**
 * Entité User - Représente un utilisateur du système bancaire
 * 
 * Cette entité centrale gère l'authentification, les profils utilisateurs,
 * et les règles métier associées aux utilisateurs.
 * 
 * @domain Entity - Couche Domain
 */
export class User {
  public readonly id: string;
  public readonly email: string;
  public password: string;
  public firstName: string;
  public lastName: string;
  public phoneNumber?: string;
  public role: UserRole;
  public avatar?: string;
  public bio?: string;
  public isPublic: boolean;
  public isEmailConfirmed: boolean;
  public emailConfirmationToken?: string;
  public emailConfirmationTokenExpiry?: Date;
  public refreshToken?: string;
  public lastLoginAt?: Date;
  public readonly createdAt: Date;
  public updatedAt?: Date;

  /**
   * Constructeur de l'entité User
   * @param props - Propriétés initiales de l'utilisateur
   */
  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.phoneNumber = props.phoneNumber;
    this.role = props.role;
    this.avatar = props.avatar;
    this.bio = props.bio;
    this.isPublic = props.isPublic;
    this.isEmailConfirmed = props.isEmailConfirmed;
    this.emailConfirmationToken = props.emailConfirmationToken;
    this.emailConfirmationTokenExpiry = props.emailConfirmationTokenExpiry;
    this.refreshToken = props.refreshToken;
    this.lastLoginAt = props.lastLoginAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Retourne le nom complet de l'utilisateur
   * @returns Prénom et nom concaténés
   */
  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Vérifie si le token de confirmation d'email est toujours valide
   * @returns true si le token existe et n'est pas expiré
   */
  public isTokenValid(): boolean {
    if (!this.emailConfirmationToken || !this.emailConfirmationTokenExpiry) {
      return false;
    }
    return new Date() < this.emailConfirmationTokenExpiry;
  }

  /**
   * Confirme l'email de l'utilisateur
   * Supprime le token de confirmation après validation
   */
  public confirmEmail(): void {
    this.isEmailConfirmed = true;
    this.emailConfirmationToken = undefined;
    this.emailConfirmationTokenExpiry = undefined;
    this.updatedAt = new Date();
  }

  /**
   * Génère un nouveau token de confirmation d'email
   * Le token expire après 24 heures
   * 
   * @returns Le token généré (à envoyer par email)
   */
  public generateEmailConfirmationToken(): string {
    const token = this.generateRandomToken(32);
    this.emailConfirmationToken = token;
    this.emailConfirmationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
    this.updatedAt = new Date();
    return token;
  }

  /**
   * Met à jour le refresh token JWT de l'utilisateur
   * @param refreshToken - Nouveau token ou null pour le supprimer
   */
  public updateRefreshToken(refreshToken: string | null): void {
    this.refreshToken = refreshToken ?? undefined;
    this.updatedAt = new Date();
  }

  /**
   * Enregistre la date et l'heure de la dernière connexion
   */
  public updateLastLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Met à jour les informations du profil utilisateur
   * @param data - Données partielles à mettre à jour
   */
  public updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    bio?: string;
    isPublic?: boolean;
  }): void {
    if (data.firstName) this.firstName = data.firstName;
    if (data.lastName) this.lastName = data.lastName;
    if (data.phoneNumber !== undefined) this.phoneNumber = data.phoneNumber;
    if (data.bio !== undefined) this.bio = data.bio;
    if (data.isPublic !== undefined) this.isPublic = data.isPublic;
    this.updatedAt = new Date();
  }

  /**
   * Met à jour l'URL de l'avatar de l'utilisateur
   * @param avatarUrl - URL de la nouvelle image d'avatar
   */
  public updateAvatar(avatarUrl: string): void {
    this.avatar = avatarUrl;
    this.updatedAt = new Date();
  }

  /**
   * Vérifie si l'utilisateur a le rôle administrateur
   * @returns true si le rôle est ADMIN
   */
  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Vérifie si un utilisateur peut accéder à ce profil
   * 
   * @param requestingUserId - ID de l'utilisateur qui demande l'accès
   * @returns true si accès autorisé (profil public ou propre profil)
   * 
   * Règle métier: L'utilisateur peut toujours voir son propre profil,
   * sinon le profil doit être public
   */
  public canAccessProfile(requestingUserId: string): boolean {
    // L'utilisateur peut toujours accéder à son propre profil
    if (this.id === requestingUserId) {
      return true;
    }
    // Si le profil est public, tout le monde peut y accéder
    return this.isPublic;
  }

  /**
   * Convertit le profil utilisateur en version publique
   * Ne retourne que les informations non sensibles
   * 
   * @returns Objet partiel avec uniquement les données publiques
   */
  public toPublicProfile(): Partial<User> {
    return {
      id: this.id,
      email: this.isPublic ? this.email : undefined,
      firstName: this.firstName,
      lastName: this.lastName,
      avatar: this.avatar,
      bio: this.bio,
      role: this.role,
      createdAt: this.createdAt,
    };
  }

  /**
   * Génère un token aléatoire sécurisé
   * 
   * @param length - Longueur du token à générer
   * @returns Token alphanumérique aléatoire
   * @private
   */
  private generateRandomToken(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}
