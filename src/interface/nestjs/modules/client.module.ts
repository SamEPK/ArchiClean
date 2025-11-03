import { Module } from '@nestjs/common';
import { ClientController } from '../controllers/client.controller';
import { RegisterClientUseCase } from '@application/use-cases/RegisterClientUseCase';
import { ConfirmEmailUseCase } from '@application/use-cases/ConfirmEmailUseCase';
import { AuthenticateClientUseCase } from '@application/use-cases/AuthenticateClientUseCase';
import { CreateBankAccountUseCase } from '@application/use-cases/CreateBankAccountUseCase';
import { DeleteBankAccountUseCase } from '@application/use-cases/DeleteBankAccountUseCase';
import { UpdateBankAccountNameUseCase } from '@application/use-cases/UpdateBankAccountNameUseCase';
import { ListBankAccountsUseCase } from '@application/use-cases/ListBankAccountsUseCase';
import { InMemoryClientRepository } from '@infrastructure/repositories/in-memory/InMemoryClientRepository';
import { InMemoryBankAccountRepository } from '@infrastructure/repositories/in-memory/InMemoryBankAccountRepository';
import { MockEmailService } from '@infrastructure/services/EmailService';

const clientRepository = new InMemoryClientRepository();
const bankAccountRepository = new InMemoryBankAccountRepository();
const emailService = new MockEmailService();

const registerClientUseCase = new RegisterClientUseCase(clientRepository, emailService);
const confirmEmailUseCase = new ConfirmEmailUseCase(clientRepository);
const authenticateClientUseCase = new AuthenticateClientUseCase(clientRepository);
const createBankAccountUseCase = new CreateBankAccountUseCase(bankAccountRepository, clientRepository);
const deleteBankAccountUseCase = new DeleteBankAccountUseCase(bankAccountRepository);
const updateBankAccountNameUseCase = new UpdateBankAccountNameUseCase(bankAccountRepository);
const listBankAccountsUseCase = new ListBankAccountsUseCase(bankAccountRepository);

@Module({
  controllers: [ClientController],
  providers: [
    {
      provide: RegisterClientUseCase,
      useValue: registerClientUseCase,
    },
    {
      provide: ConfirmEmailUseCase,
      useValue: confirmEmailUseCase,
    },
    {
      provide: AuthenticateClientUseCase,
      useValue: authenticateClientUseCase,
    },
    {
      provide: CreateBankAccountUseCase,
      useValue: createBankAccountUseCase,
    },
    {
      provide: DeleteBankAccountUseCase,
      useValue: deleteBankAccountUseCase,
    },
    {
      provide: UpdateBankAccountNameUseCase,
      useValue: updateBankAccountNameUseCase,
    },
    {
      provide: ListBankAccountsUseCase,
      useValue: listBankAccountsUseCase,
    },
  ],
})
export class ClientModule {}
