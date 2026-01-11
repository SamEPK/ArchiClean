import { Module, Inject } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientController } from '../controllers/client.controller';
import { RegisterClientUseCase } from '../../../application/use-cases/RegisterClientUseCase';
import { ConfirmEmailUseCase } from '../../../application/use-cases/ConfirmEmailUseCase';
import { AuthenticateClientUseCase } from '../../../application/use-cases/AuthenticateClientUseCase';
import { CreateBankAccountUseCase } from '../../../application/use-cases/CreateBankAccountUseCase';
import { DeleteBankAccountUseCase } from '../../../application/use-cases/DeleteBankAccountUseCase';
import { UpdateBankAccountNameUseCase } from '../../../application/use-cases/UpdateBankAccountNameUseCase';
import { ListBankAccountsUseCase } from '../../../application/use-cases/ListBankAccountsUseCase';
import { UpdateClientProfileUseCase } from '../../../application/use-cases/UpdateClientProfileUseCase';
import { 
  RepositoriesModule, 
  CLIENT_REPOSITORY, 
  BANK_ACCOUNT_REPOSITORY, 
  EMAIL_SERVICE 
} from './repositories.module';
@Module({
  imports: [
    RepositoriesModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [ClientController],
  providers: [
    {
      provide: 'IClientRepository',
      useFactory: (clientRepository) => clientRepository,
      inject: [CLIENT_REPOSITORY],
    },
    {
      provide: RegisterClientUseCase,
      useFactory: (clientRepository, emailService, bankAccountRepository) => {
        const createBankAccountUseCase = new CreateBankAccountUseCase(bankAccountRepository, clientRepository);
        return new RegisterClientUseCase(clientRepository, emailService, createBankAccountUseCase);
      },
      inject: [CLIENT_REPOSITORY, EMAIL_SERVICE, BANK_ACCOUNT_REPOSITORY],
    },
    {
      provide: ConfirmEmailUseCase,
      useFactory: (clientRepository) => new ConfirmEmailUseCase(clientRepository),
      inject: [CLIENT_REPOSITORY],
    },
    {
      provide: AuthenticateClientUseCase,
      useFactory: (clientRepository) => {
        console.log('[ClientModule] Creating AuthenticateClientUseCase with repository instance:', 
          clientRepository.constructor.name, 
          `(instance #${(clientRepository as any).instanceId})`);
        return new AuthenticateClientUseCase(clientRepository);
      },
      inject: [CLIENT_REPOSITORY],
    },
    {
      provide: CreateBankAccountUseCase,
      useFactory: (bankAccountRepository, clientRepository) => 
        new CreateBankAccountUseCase(bankAccountRepository, clientRepository),
      inject: [BANK_ACCOUNT_REPOSITORY, CLIENT_REPOSITORY],
    },
    {
      provide: DeleteBankAccountUseCase,
      useFactory: (bankAccountRepository) => new DeleteBankAccountUseCase(bankAccountRepository),
      inject: [BANK_ACCOUNT_REPOSITORY],
    },
    {
      provide: UpdateBankAccountNameUseCase,
      useFactory: (bankAccountRepository) => new UpdateBankAccountNameUseCase(bankAccountRepository),
      inject: [BANK_ACCOUNT_REPOSITORY],
    },
    {
      provide: ListBankAccountsUseCase,
      useFactory: (bankAccountRepository) => new ListBankAccountsUseCase(bankAccountRepository),
      inject: [BANK_ACCOUNT_REPOSITORY],
    },
    {
      provide: UpdateClientProfileUseCase,
      useFactory: (clientRepository) => new UpdateClientProfileUseCase(clientRepository),
      inject: [CLIENT_REPOSITORY],
    },
  ],
  exports: ['IClientRepository'],
})
export class ClientModule {}
