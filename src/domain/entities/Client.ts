export interface ClientProps {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isEmailConfirmed: boolean;
  emailConfirmationToken?: string;
  emailConfirmationTokenExpiry?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export class Client {
  public readonly id: string;
  public readonly email: string;
  public password: string;
  public firstName: string;
  public lastName: string;
  public phoneNumber?: string;
  public isEmailConfirmed: boolean;
  public emailConfirmationToken?: string;
  public emailConfirmationTokenExpiry?: Date;
  public readonly createdAt: Date;
  public updatedAt?: Date;

  constructor(props: ClientProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.phoneNumber = props.phoneNumber;
    this.isEmailConfirmed = props.isEmailConfirmed;
    this.emailConfirmationToken = props.emailConfirmationToken;
    this.emailConfirmationTokenExpiry = props.emailConfirmationTokenExpiry;
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
    return token;
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
