import { Module, Inject } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { AdvisorController } from '../controllers/advisor.controller';
import { RegisterAdvisorUseCase } from '../../../application/use-cases/RegisterAdvisorUseCase';
import { AuthenticateAdvisorUseCase } from '../../../application/use-cases/AuthenticateAdvisorUseCase';
import { GetCreditScheduleUseCase } from '../../../application/use-cases/GetCreditScheduleUseCase';
import { GrantCredit } from '../../../application/use-cases/GrantCredit';
import { AssignConversation } from '../../../application/use-cases/AssignConversation';
import { TransferConversation } from '../../../application/use-cases/TransferConversation';
import { SendMessage } from '../../../application/use-cases/SendMessage';
import { AdvisorAuthGuard } from '../guards/advisor-auth.guard';
import { GrantCreditHandler } from '@application/cqrs/handlers/GrantCreditHandler';
import { AssignConversationHandler } from '@application/cqrs/handlers/AssignConversationHandler';
import { TransferConversationHandler } from '@application/cqrs/handlers/TransferConversationHandler';
import { ReplyToConversationHandler } from '@application/cqrs/handlers/ReplyToConversationHandler';
import { ListOpenConversationsHandler } from '@application/cqrs/handlers/ListOpenConversationsHandler';
import { GetClientCreditsHandler } from '@application/cqrs/handlers/GetClientCreditsHandler';
import { 
  RepositoriesModule,
  CLIENT_REPOSITORY,
  ADVISOR_REPOSITORY,
  CREDIT_REPOSITORY,
  MESSAGE_REPOSITORY,
  EVENT_STORE
} from './repositories.module';

@Module({
  controllers: [AdvisorController],
  providers: [
    // Repository
    {
      provide: 'IAdvisorRepository',
      useFactory: (advisorRepository) => advisorRepository,
      inject: [ADVISOR_REPOSITORY],
    },
    {
      provide: 'ICreditRepository',
      useFactory: (creditRepository) => creditRepository,
      inject: [CREDIT_REPOSITORY],
    },
    {
      provide: 'IMessageRepository',
      useFactory: (messageRepository) => messageRepository,
      inject: [MESSAGE_REPOSITORY],
    },

    // Use Cases
    {
      provide: RegisterAdvisorUseCase,
      useFactory: (advisorRepository) => new RegisterAdvisorUseCase(advisorRepository),
      inject: [ADVISOR_REPOSITORY],
    },
    {
      provide: AuthenticateAdvisorUseCase,
      useFactory: (advisorRepository) => new AuthenticateAdvisorUseCase(advisorRepository),
      inject: [ADVISOR_REPOSITORY],
    },
    {
      provide: GrantCredit,
      useFactory: (creditRepository) => new GrantCredit(creditRepository),
      inject: [CREDIT_REPOSITORY],
    },
    {
      provide: AssignConversation,
      useFactory: (messageRepository) => new AssignConversation(messageRepository),
      inject: [MESSAGE_REPOSITORY],
    },
    {
      provide: TransferConversation,
      useFactory: (messageRepository) => new TransferConversation(messageRepository),
      inject: [MESSAGE_REPOSITORY],
    },
    {
      provide: SendMessage,
      useFactory: (messageRepository) => new SendMessage(messageRepository),
      inject: [MESSAGE_REPOSITORY],
    },
    {
      provide: GetCreditScheduleUseCase,
      useFactory: (creditRepository) => new GetCreditScheduleUseCase(creditRepository),
      inject: [CREDIT_REPOSITORY],
    },
    AdvisorAuthGuard,
    GrantCreditHandler,
    AssignConversationHandler,
    TransferConversationHandler,
    ReplyToConversationHandler,
    ListOpenConversationsHandler,
    GetClientCreditsHandler,
  ],
  imports: [
    RepositoriesModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-key',
      signOptions: { expiresIn: '2h' },
    }),
    CqrsModule,
  ],
  exports: [
    AdvisorAuthGuard,
    'IAdvisorRepository',
  ],
})
export class AdvisorModule {}
