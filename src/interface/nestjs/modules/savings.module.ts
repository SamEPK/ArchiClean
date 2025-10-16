import { Module } from '@nestjs/common';
import { SavingsController } from '../controllers/savings.controller';
import { OpenSavingsAccountUseCase } from '@application/use-cases/OpenSavingsAccountUseCase';
import { ApplyDailyInterestUseCase } from '@application/use-cases/ApplyDailyInterestUseCase';
import { InMemorySavingsAccountRepository } from '@infrastructure/repositories/in-memory/InMemorySavingsAccountRepository';

const savingsAccountRepo = new InMemorySavingsAccountRepository();

const openSavingsAccountUseCase = new OpenSavingsAccountUseCase(
  savingsAccountRepo,
);

const applyDailyInterestUseCase = new ApplyDailyInterestUseCase(
  savingsAccountRepo,
);

@Module({
  controllers: [SavingsController],
  providers: [
    {
      provide: 'OpenSavingsAccountUseCase',
      useValue: openSavingsAccountUseCase,
    },
    {
      provide: 'ApplyDailyInterestUseCase',
      useValue: applyDailyInterestUseCase,
    },
  ],
})
export class SavingsModule {}
