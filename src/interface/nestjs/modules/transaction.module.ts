import { Module } from '@nestjs/common';
import { TransactionController } from '../controllers/transaction.controller';
import { TransferFundsUseCase } from '../../../application/use-cases/TransferFundsUseCase';
import { DepositFundsUseCase } from '../../../application/use-cases/DepositFundsUseCase';
import { WithdrawFundsUseCase } from '../../../application/use-cases/WithdrawFundsUseCase';
import { GetTransactionHistoryUseCase } from '../../../application/use-cases/GetTransactionHistoryUseCase';
import {
  RepositoriesModule,
  BANK_ACCOUNT_REPOSITORY,
  TRANSACTION_REPOSITORY,
} from './repositories.module';

console.log('[TransactionModule] Using SINGLETON repositories from RepositoriesModule');

@Module({
  imports: [RepositoriesModule],
  controllers: [TransactionController],
  providers: [
    // Use Cases
    {
      provide: TransferFundsUseCase,
      useFactory: (bankAccountRepository, transactionRepository) =>
        new TransferFundsUseCase(bankAccountRepository, transactionRepository),
      inject: [BANK_ACCOUNT_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: DepositFundsUseCase,
      useFactory: (bankAccountRepository, transactionRepository) =>
        new DepositFundsUseCase(bankAccountRepository, transactionRepository),
      inject: [BANK_ACCOUNT_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: WithdrawFundsUseCase,
      useFactory: (bankAccountRepository, transactionRepository) =>
        new WithdrawFundsUseCase(bankAccountRepository, transactionRepository),
      inject: [BANK_ACCOUNT_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: GetTransactionHistoryUseCase,
      useFactory: (transactionRepository, bankAccountRepository) =>
        new GetTransactionHistoryUseCase(transactionRepository, bankAccountRepository),
      inject: [TRANSACTION_REPOSITORY, BANK_ACCOUNT_REPOSITORY],
    },
  ],
})
export class TransactionModule {}
