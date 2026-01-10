import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IClientRepository } from '@domain/repositories/IClientRepository';
import { IAdvisorRepository } from '@domain/repositories/IAdvisorRepository';
import { IAdminRepository } from '@domain/repositories/IAdminRepository';
import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';
import { ITransactionRepository } from '@domain/repositories/ITransactionRepository';
import { ISavingsAccountRepository } from '@domain/repositories/ISavingsAccountRepository';
import { ICreditRepository } from '@domain/repositories/ICreditRepository';
import { IStockRepository } from '@domain/repositories/IStockRepository';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { IPortfolioRepository } from '@domain/repositories/IPortfolioRepository';
import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import { IPrivateMessageRepository } from '@domain/repositories/IPrivateMessageRepository';
import { IFriendshipRepository } from '@domain/repositories/IFriendshipRepository';
import { IGroupRepository } from '@domain/repositories/IGroupRepository';
import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';
import { IGroupMessageRepository } from '@domain/repositories/IGroupMessageRepository';

// InMemory repositories
import { InMemoryUserRepository } from './in-memory/InMemoryUserRepository';
import { InMemoryClientRepository } from './in-memory/InMemoryClientRepository';
import { InMemoryAdvisorRepository } from './in-memory/InMemoryAdvisorRepository';
import { InMemoryAdminRepository } from './in-memory/InMemoryAdminRepository';
import { InMemoryBankAccountRepository } from './in-memory/InMemoryBankAccountRepository';
import { InMemoryTransactionRepository } from './in-memory/InMemoryTransactionRepository';
import { InMemorySavingsAccountRepository } from './in-memory/InMemorySavingsAccountRepository';
import { InMemoryCreditRepository } from './in-memory/InMemoryCreditRepository';
import { InMemoryStockRepository } from './in-memory/InMemoryStockRepository';
import { InMemoryOrderRepository } from './in-memory/InMemoryOrderRepository';
import { InMemoryPortfolioRepository } from './in-memory/InMemoryPortfolioRepository';
import { InMemoryMessageRepository } from './in-memory/InMemoryMessageRepository';
import { InMemoryPrivateMessageRepository } from './in-memory/InMemoryPrivateMessageRepository';
import { InMemoryFriendshipRepository } from './in-memory/InMemoryFriendshipRepository';
import { InMemoryGroupRepository } from './in-memory/InMemoryGroupRepository';
import { InMemoryGroupMemberRepository } from './in-memory/InMemoryGroupMemberRepository';
import { InMemoryGroupMessageRepository } from './in-memory/InMemoryGroupMessageRepository';

// Note: MongoDB repositories NOT imported here to avoid NestJS decorator compilation errors
// MongoDB repositories are only usable within NestJS context via module injection

type DatabaseType = 'inmemory' | 'mongodb';

/**
 * Centralized Repository Factory
 * 
 * Permet de basculer entre InMemory et MongoDB via variable d'environnement DATABASE_TYPE
 * Usage: DATABASE_TYPE=mongodb ou DATABASE_TYPE=inmemory (default)
 * 
 * **IMPORTANT**: MongoDB repositories utilisent des decorators NestJS incompatibles avec Fastify standalone.
 * Pour Fastify, utilisez DATABASE_TYPE=inmemory (ou aucune env var).
 * Pour NestJS, vous pouvez utiliser DATABASE_TYPE=mongodb.
 * 
 * Singleton pattern pour garantir une seule instance de chaque repository
 */
export class RepositoryFactory {
  private static instance: RepositoryFactory | null = null;
  private databaseType: DatabaseType;
  private isNestJSContext: boolean;

  // Singleton instances
  private userRepo: IUserRepository | null = null;
  private clientRepo: IClientRepository | null = null;
  private advisorRepo: IAdvisorRepository | null = null;
  private adminRepo: IAdminRepository | null = null;
  private bankAccountRepo: IBankAccountRepository | null = null;
  private transactionRepo: ITransactionRepository | null = null;
  private savingsAccountRepo: ISavingsAccountRepository | null = null;
  private creditRepo: ICreditRepository | null = null;
  private stockRepo: IStockRepository | null = null;
  private orderRepo: IOrderRepository | null = null;
  private portfolioRepo: IPortfolioRepository | null = null;
  private messageRepo: IMessageRepository | null = null;
  private privateMessageRepo: IPrivateMessageRepository | null = null;
  private friendshipRepo: IFriendshipRepository | null = null;
  private groupRepo: IGroupRepository | null = null;
  private groupMemberRepo: IGroupMemberRepository | null = null;
  private groupMessageRepo: IGroupMessageRepository | null = null;

  private constructor() {
    const requestedType = (process.env.DATABASE_TYPE as DatabaseType) || 'inmemory';
    
    // Detect if running in NestJS context (NestJS sets specific env vars or process metadata)
    this.isNestJSContext = process.argv.some(arg => arg.includes('nestjs/main.ts'));
    
    // Force InMemory if not in NestJS context and MongoDB was requested
    if (!this.isNestJSContext && requestedType === 'mongodb') {
      console.warn('⚠️  MongoDB repositories require NestJS context. Falling back to InMemory.');
      this.databaseType = 'inmemory';
    } else {
      this.databaseType = requestedType;
    }
    
    console.log(`📦 RepositoryFactory initialized with database type: ${this.databaseType.toUpperCase()}`);
    if (!this.isNestJSContext) {
      console.log('   Running in standalone context (Fastify) - using InMemory repositories');
    }
  }

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  getUserRepository(): IUserRepository {
    if (!this.userRepo) {
      // MongoDB only available in NestJS context
      if (this.databaseType === 'mongodb' && this.isNestJSContext) {
        throw new Error('MongoDB repositories must be injected via NestJS modules, not RepositoryFactory');
      }
      this.userRepo = new InMemoryUserRepository();
    }
    return this.userRepo;
  }

  getClientRepository(): IClientRepository {
    if (!this.clientRepo) {
      if (this.databaseType === 'mongodb' && this.isNestJSContext) {
        throw new Error('MongoDB repositories must be injected via NestJS modules, not RepositoryFactory');
      }
      this.clientRepo = new InMemoryClientRepository();
    }
    return this.clientRepo;
  }

  getAdvisorRepository(): IAdvisorRepository {
    if (!this.advisorRepo) {
      if (this.databaseType === 'mongodb' && this.isNestJSContext) {
        throw new Error('MongoDB repositories must be injected via NestJS modules, not RepositoryFactory');
      }
      this.advisorRepo = new InMemoryAdvisorRepository();
    }
    return this.advisorRepo;
  }

  getAdminRepository(): IAdminRepository {
    if (!this.adminRepo) {
      if (this.databaseType === 'mongodb' && this.isNestJSContext) {
        throw new Error('MongoDB repositories must be injected via NestJS modules, not RepositoryFactory');
      }
      this.adminRepo = new InMemoryAdminRepository();
    }
    return this.adminRepo;
  }

  getBankAccountRepository(): IBankAccountRepository {
    if (!this.bankAccountRepo) {
      this.bankAccountRepo = new InMemoryBankAccountRepository();
    }
    return this.bankAccountRepo;
  }

  getTransactionRepository(): ITransactionRepository {
    if (!this.transactionRepo) {
      this.transactionRepo = new InMemoryTransactionRepository();
    }
    return this.transactionRepo;
  }

  getSavingsAccountRepository(): ISavingsAccountRepository {
    if (!this.savingsAccountRepo) {
      this.savingsAccountRepo = new InMemorySavingsAccountRepository();
    }
    return this.savingsAccountRepo;
  }

  getCreditRepository(): ICreditRepository {
    if (!this.creditRepo) {
      this.creditRepo = new InMemoryCreditRepository();
    }
    return this.creditRepo;
  }

  getStockRepository(): IStockRepository {
    if (!this.stockRepo) {
      this.stockRepo = new InMemoryStockRepository();
    }
    return this.stockRepo;
  }

  getOrderRepository(): IOrderRepository {
    if (!this.orderRepo) {
      this.orderRepo = new InMemoryOrderRepository();
    }
    return this.orderRepo;
  }

  getPortfolioRepository(): IPortfolioRepository {
    if (!this.portfolioRepo) {
      this.portfolioRepo = new InMemoryPortfolioRepository();
    }
    return this.portfolioRepo;
  }

  getMessageRepository(): IMessageRepository {
    if (!this.messageRepo) {
      this.messageRepo = new InMemoryMessageRepository();
    }
    return this.messageRepo;
  }

  getPrivateMessageRepository(): IPrivateMessageRepository {
    if (!this.privateMessageRepo) {
      this.privateMessageRepo = new InMemoryPrivateMessageRepository();
    }
    return this.privateMessageRepo;
  }

  getFriendshipRepository(): IFriendshipRepository {
    if (!this.friendshipRepo) {
      this.friendshipRepo = new InMemoryFriendshipRepository();
    }
    return this.friendshipRepo;
  }

  getGroupRepository(): IGroupRepository {
    if (!this.groupRepo) {
      this.groupRepo = new InMemoryGroupRepository();
    }
    return this.groupRepo;
  }

  getGroupMemberRepository(): IGroupMemberRepository {
    if (!this.groupMemberRepo) {
      this.groupMemberRepo = new InMemoryGroupMemberRepository();
    }
    return this.groupMemberRepo;
  }

  getGroupMessageRepository(): IGroupMessageRepository {
    if (!this.groupMessageRepo) {
      this.groupMessageRepo = new InMemoryGroupMessageRepository();
    }
    return this.groupMessageRepo;
  }

  getDatabaseType(): DatabaseType {
    return this.databaseType;
  }

  /**
   * Switch database type dynamically (InMemory <-> MongoDB)
   * Resets all repository instances to use the new database type
   * 
   * @param newType - 'inmemory' or 'mongodb'
   * @returns Current database type after switch
   */
  switchDatabase(newType: DatabaseType): DatabaseType {
    const oldType = this.databaseType;
    
    // Validate MongoDB can only be used in NestJS context
    if (!this.isNestJSContext && newType === 'mongodb') {
      console.warn('⚠️  MongoDB repositories require NestJS context. Cannot switch to MongoDB.');
      return this.databaseType;
    }
    
    this.databaseType = newType;
    
    // Reset all repository instances to recreate them with new database type
    this.resetAllRepositories();
    
    console.log(`🔄 Database switched from ${oldType.toUpperCase()} to ${newType.toUpperCase()}`);
    return this.databaseType;
  }

  /**
   * Reset all repository singleton instances
   * Forces recreation on next access
   */
  private resetAllRepositories(): void {
    this.userRepo = null;
    this.clientRepo = null;
    this.advisorRepo = null;
    this.adminRepo = null;
    this.bankAccountRepo = null;
    this.transactionRepo = null;
    this.savingsAccountRepo = null;
    this.creditRepo = null;
    this.stockRepo = null;
    this.orderRepo = null;
    this.portfolioRepo = null;
    this.messageRepo = null;
    this.privateMessageRepo = null;
    this.friendshipRepo = null;
    this.groupRepo = null;
    this.groupMemberRepo = null;
    this.groupMessageRepo = null;
    
    console.log('♻️  All repository instances reset');
  }

  /**
   * Reset the singleton factory instance completely
   * Use with caution - will lose all in-memory data
   */
  static reset(): void {
    if (RepositoryFactory.instance) {
      RepositoryFactory.instance.resetAllRepositories();
      RepositoryFactory.instance = null;
      console.log('🔄 RepositoryFactory singleton reset');
    }
  }
}
