import { Module } from '@nestjs/common';
import { SavingsController } from '../controllers/savings.controller';
import { OpenSavingsAccountUseCase } from '@application/use-cases/OpenSavingsAccountUseCase';
import { ApplyDailyInterestUseCase } from '@application/use-cases/ApplyDailyInterestUseCase';
import { GetSavingsAccountsByClientUseCase } from '@application/use-cases/GetSavingsAccountsByClientUseCase';
import {
  RepositoriesModule,
  SAVINGS_ACCOUNT_REPOSITORY,
  BANK_ACCOUNT_REPOSITORY
} from './repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [SavingsController],
  providers: [
    {
      provide: 'OpenSavingsAccountUseCase',
      useFactory: (savingsAccountRepository) =>
        new OpenSavingsAccountUseCase(savingsAccountRepository),
      inject: [SAVINGS_ACCOUNT_REPOSITORY],
    },
    {
      provide: 'ApplyDailyInterestUseCase',
      useFactory: (savingsAccountRepository) =>
        new ApplyDailyInterestUseCase(savingsAccountRepository),
      inject: [SAVINGS_ACCOUNT_REPOSITORY],
    },
    {
      provide: 'GetSavingsAccountsByClientUseCase',
      useFactory: (savingsAccountRepository, bankAccountRepository) =>
        new GetSavingsAccountsByClientUseCase(savingsAccountRepository, bankAccountRepository),
      inject: [SAVINGS_ACCOUNT_REPOSITORY, BANK_ACCOUNT_REPOSITORY],
    },
  ],
})
export class SavingsModule {}
