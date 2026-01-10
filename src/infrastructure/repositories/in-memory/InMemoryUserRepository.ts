import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';

export class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, User>();

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const lower = email.toLowerCase();
    for (const user of this.users.values()) {
      if ((user.email || '').toLowerCase() === lower) return user;
    }
    return null;
  }

  async findByEmailConfirmationToken(token: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.emailConfirmationToken === token) return user;
    }
    return null;
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.refreshToken === refreshToken) return user;
    }
    return null;
  }

  async update(user: User): Promise<User> {
    if (!this.users.has(user.id)) {
      throw new Error(`User with id ${user.id} not found`);
    }
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  async findAll(skip = 0, limit = 20): Promise<User[]> {
    return Array.from(this.users.values()).slice(skip, skip + limit);
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  async searchByName(query: string, skip = 0, limit = 20): Promise<User[]> {
    const q = query.toLowerCase();
    const list = Array.from(this.users.values()).filter((u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
    );
    return list.slice(skip, skip + limit);
  }

  async findPublicProfiles(skip = 0, limit = 20): Promise<User[]> {
    const list = Array.from(this.users.values()).filter((u) => u.isPublic);
    return list.slice(skip, skip + limit);
  }
}
