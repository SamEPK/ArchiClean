export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  ADVISOR = 'ADVISOR',
  DIRECTOR = 'DIRECTOR',
}

export interface UserProps {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isPublic: boolean;
  isEmailConfirmed: boolean;
  emailConfirmationToken?: string;
  emailConfirmationTokenExpiry?: Date;
  refreshToken?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

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

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public isTokenValid(): boolean {
    if (!this.emailConfirmationToken || !this.emailConfirmationTokenExpiry) {
      return false;
    }
    return new Date() < this.emailConfirmationTokenExpiry;
  }

  public confirmEmail(): void {
    this.isEmailConfirmed = true;
    this.emailConfirmationToken = undefined;
    this.emailConfirmationTokenExpiry = undefined;
    this.updatedAt = new Date();
  }

  public generateEmailConfirmationToken(): string {
    const token = this.generateRandomToken(32);
    this.emailConfirmationToken = token;
    this.emailConfirmationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    this.updatedAt = new Date();
    return token;
  }

  public updateRefreshToken(refreshToken: string | null): void {
    this.refreshToken = refreshToken ?? undefined;
    this.updatedAt = new Date();
  }

  public updateLastLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

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

  public updateAvatar(avatarUrl: string): void {
    this.avatar = avatarUrl;
    this.updatedAt = new Date();
  }

  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  public canAccessProfile(requestingUserId: string): boolean {
    // L'utilisateur peut toujours accéder à son propre profil
    if (this.id === requestingUserId) {
      return true;
    }
    // Si le profil est public, tout le monde peut y accéder
    return this.isPublic;
  }

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

  private generateRandomToken(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}
