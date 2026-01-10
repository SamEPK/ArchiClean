import { Module, Global } from '@nestjs/common';
import { PersistentClientRepository } from '../../../infrastructure/repositories/persistent/PersistentClientRepository';
import { InMemoryBankAccountRepository } from '../../../infrastructure/repositories/in-memory/InMemoryBankAccountRepository';
import { InMemorySavingsAccountRepository } from '../../../infrastructure/repositories/in-memory/InMemorySavingsAccountRepository';
import { PersistentAdvisorRepository } from '../../../infrastructure/repositories/persistent/PersistentAdvisorRepository';
import { InMemoryCreditRepository } from '../../../infrastructure/repositories/in-memory/InMemoryCreditRepository';
import { PersistentMessageRepository } from '../../../infrastructure/repositories/persistent/PersistentMessageRepository';
import { PersistentPrivateMessageRepository } from '../../../infrastructure/repositories/persistent/PersistentPrivateMessageRepository';
import { InMemoryFriendshipRepository } from '../../../infrastructure/repositories/in-memory/InMemoryFriendshipRepository';
import { InMemoryGroupRepository } from '../../../infrastructure/repositories/in-memory/InMemoryGroupRepository';
import { InMemoryGroupMemberRepository } from '../../../infrastructure/repositories/in-memory/InMemoryGroupMemberRepository';
import { InMemoryGroupMessageRepository } from '../../../infrastructure/repositories/in-memory/InMemoryGroupMessageRepository';
import { PersistentUserRepository } from '../../../infrastructure/repositories/persistent/PersistentUserRepository';
import { InMemoryOrderRepository } from '../../../infrastructure/repositories/in-memory/InMemoryOrderRepository';
import { InMemoryStockRepository } from '../../../infrastructure/repositories/in-memory/InMemoryStockRepository';
import { InMemoryPortfolioRepository } from '../../../infrastructure/repositories/in-memory/InMemoryPortfolioRepository';
import { InMemoryTransactionRepository } from '../../../infrastructure/repositories/in-memory/InMemoryTransactionRepository';

import { MockEmailService } from '../../../infrastructure/services/EmailService';
import { InMemoryEventStore } from '../../../infrastructure/event-store/InMemoryEventStore';
import { EVENT_STORE } from '../../../domain/events/DomainEvent';

// SINGLETON INSTANCES - UNE SEULE INSTANCE POUR TOUTE L'APPLICATION
console.log('[RepositoriesModule] Creating SINGLETON repository instances...');

// REPOSITORIES PERSISTANTS - Sauvegardés sur disque
const clientRepository = new PersistentClientRepository('./data');
const advisorRepository = new PersistentAdvisorRepository('./data');
const messageRepository = new PersistentMessageRepository('./data');
const privateMessageRepository = new PersistentPrivateMessageRepository('./data');
const userRepository = new PersistentUserRepository('./data');

console.log('[RepositoriesModule] PERSISTENT repositories created');

const bankAccountRepository = new InMemoryBankAccountRepository();
const savingsAccountRepository = new InMemorySavingsAccountRepository();
const creditRepository = new InMemoryCreditRepository();
const friendshipRepository = new InMemoryFriendshipRepository();
const groupRepository = new InMemoryGroupRepository();
const groupMemberRepository = new InMemoryGroupMemberRepository();
const groupMessageRepository = new InMemoryGroupMessageRepository();
const orderRepository = new InMemoryOrderRepository();
const stockRepository = new InMemoryStockRepository();
const portfolioRepository = new InMemoryPortfolioRepository();
const transactionRepository = new InMemoryTransactionRepository();

const emailService = new MockEmailService();
const eventStore = new InMemoryEventStore();

// Tokens pour l'injection de dépendance
export const CLIENT_REPOSITORY = 'CLIENT_REPOSITORY';
export const BANK_ACCOUNT_REPOSITORY = 'BANK_ACCOUNT_REPOSITORY';
export const SAVINGS_ACCOUNT_REPOSITORY = 'SAVINGS_ACCOUNT_REPOSITORY';
export const ADVISOR_REPOSITORY = 'ADVISOR_REPOSITORY';
export const CREDIT_REPOSITORY = 'CREDIT_REPOSITORY';
export const MESSAGE_REPOSITORY = 'MESSAGE_REPOSITORY';
export const PRIVATE_MESSAGE_REPOSITORY = 'PRIVATE_MESSAGE_REPOSITORY';
export const FRIENDSHIP_REPOSITORY = 'FRIENDSHIP_REPOSITORY';
export const GROUP_REPOSITORY = 'GROUP_REPOSITORY';
export const GROUP_MEMBER_REPOSITORY = 'GROUP_MEMBER_REPOSITORY';
export const GROUP_MESSAGE_REPOSITORY = 'GROUP_MESSAGE_REPOSITORY';
export const USER_REPOSITORY = 'USER_REPOSITORY';
export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';
export const STOCK_REPOSITORY = 'STOCK_REPOSITORY';
export const PORTFOLIO_REPOSITORY = 'PORTFOLIO_REPOSITORY';
export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';
export const EMAIL_SERVICE = 'EMAIL_SERVICE';
// EVENT_STORE utilise le Symbol défini dans domain (pas string)
export { EVENT_STORE } from '../../../domain/events/DomainEvent';

@Global()
@Module({
  providers: [
    {
      provide: CLIENT_REPOSITORY,
      useValue: clientRepository,
    },
    {
      provide: BANK_ACCOUNT_REPOSITORY,
      useValue: bankAccountRepository,
    },
    {
      provide: SAVINGS_ACCOUNT_REPOSITORY,
      useValue: savingsAccountRepository,
    },
    {
      provide: ADVISOR_REPOSITORY,
      useValue: advisorRepository,
    },
    {
      provide: CREDIT_REPOSITORY,
      useValue: creditRepository,
    },
    {
      provide: MESSAGE_REPOSITORY,
      useValue: messageRepository,
    },
    {
      provide: PRIVATE_MESSAGE_REPOSITORY,
      useValue: privateMessageRepository,
    },
    {
      provide: FRIENDSHIP_REPOSITORY,
      useValue: friendshipRepository,
    },
    {
      provide: GROUP_REPOSITORY,
      useValue: groupRepository,
    },
    {
      provide: GROUP_MEMBER_REPOSITORY,
      useValue: groupMemberRepository,
    },
    {
      provide: GROUP_MESSAGE_REPOSITORY,
      useValue: groupMessageRepository,
    },
    {
      provide: USER_REPOSITORY,
      useValue: userRepository,
    },
    {
      provide: ORDER_REPOSITORY,
      useValue: orderRepository,
    },
    {
      provide: STOCK_REPOSITORY,
      useValue: stockRepository,
    },
    {
      provide: PORTFOLIO_REPOSITORY,
      useValue: portfolioRepository,
    },
    {
      provide: TRANSACTION_REPOSITORY,
      useValue: transactionRepository,
    },
    {
      provide: EMAIL_SERVICE,
      useValue: emailService,
    },
    {
      provide: EVENT_STORE,
      useValue: eventStore,
    },
  ],
  exports: [
    CLIENT_REPOSITORY,
    BANK_ACCOUNT_REPOSITORY,
    SAVINGS_ACCOUNT_REPOSITORY,
    ADVISOR_REPOSITORY,
    CREDIT_REPOSITORY,
    MESSAGE_REPOSITORY,
    PRIVATE_MESSAGE_REPOSITORY,
    FRIENDSHIP_REPOSITORY,
    GROUP_REPOSITORY,
    GROUP_MEMBER_REPOSITORY,
    GROUP_MESSAGE_REPOSITORY,
    USER_REPOSITORY,
    ORDER_REPOSITORY,
    STOCK_REPOSITORY,
    PORTFOLIO_REPOSITORY,
    TRANSACTION_REPOSITORY,
    EMAIL_SERVICE,
    EVENT_STORE,
  ],
})
export class RepositoriesModule {}