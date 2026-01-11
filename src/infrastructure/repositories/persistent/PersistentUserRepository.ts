import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import * as fs from 'fs';
import * as path from 'path';

export class PersistentUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private dataFile: string;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(dataDir: string = './data') {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.dataFile = path.join(dataDir, 'users.json');
    this.loadFromDisk();
    
    console.log(`[PersistentUserRepository] Initialized with ${this.users.size} users`);
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        const usersArray = JSON.parse(data);
        
        usersArray.forEach((userData: any) => {
          const user = new User({
            id: userData.id,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            role: userData.role,
            avatar: userData.avatar,
            bio: userData.bio,
            isPublic: userData.isPublic ?? false,
            isEmailConfirmed: userData.isEmailConfirmed ?? false,
            emailConfirmationToken: userData.emailConfirmationToken,
            emailConfirmationTokenExpiry: userData.emailConfirmationTokenExpiry ? new Date(userData.emailConfirmationTokenExpiry) : undefined,
            refreshToken: userData.refreshToken,
            lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : undefined,
            createdAt: new Date(userData.createdAt),
            updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
          });
          this.users.set(user.id, user);
        });
        
        console.log(`[PersistentUserRepository] Loaded ${this.users.size} users from disk`);
      }
    } catch (error) {
      console.error('[PersistentUserRepository] Error loading data:', error);
    }
  }

  public save(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }

    try {
      const usersArray = Array.from(this.users.values()).map(user => ({
        id: user.id,
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        isPublic: user.isPublic,
        isEmailConfirmed: user.isEmailConfirmed,
        emailConfirmationToken: user.emailConfirmationToken,
        emailConfirmationTokenExpiry: user.emailConfirmationTokenExpiry?.toISOString(),
        refreshToken: user.refreshToken,
        lastLoginAt: user.lastLoginAt?.toISOString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
      }));
      
      fs.writeFileSync(this.dataFile, JSON.stringify(usersArray, null, 2), 'utf8');
      console.log(`[PersistentUserRepository] Force saved ${this.users.size} users to disk`);
    } catch (error) {
      console.error('[PersistentUserRepository] Error saving data:', error);
    }
  }

  private saveToDisk(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    this.saveTimer = setTimeout(() => {
     this.save();
    }, 1000);
  }

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    this.saveToDisk();
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values()).find(u => u.email === email) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async update(user: User): Promise<User> {
    this.users.set(user.id, user);
    this.saveToDisk();
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
    this.saveToDisk();
  }

  async search(query: string): Promise<User[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.users.values()).filter(
      u =>
        u.email.toLowerCase().includes(lowerQuery) ||
        (u.firstName && u.firstName.toLowerCase().includes(lowerQuery)) ||
        (u.lastName && u.lastName.toLowerCase().includes(lowerQuery))
    );
  }

  async findByEmailConfirmationToken(token: string): Promise<User | null> {
    return Array.from(this.users.values()).find(u => u.emailConfirmationToken === token) || null;
  }

  async findByRefreshToken(token: string): Promise<User | null> {
    return Array.from(this.users.values()).find(u => u.refreshToken === token) || null;
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  async searchByName(query: string): Promise<User[]> {
    return this.search(query);
  }

  async findPublicProfiles(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.isPublic);
  }
}
