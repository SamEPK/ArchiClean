import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TransferFundsUseCase } from '../../../application/use-cases/TransferFundsUseCase';
import { DepositFundsUseCase } from '../../../application/use-cases/DepositFundsUseCase';
import { WithdrawFundsUseCase } from '../../../application/use-cases/WithdrawFundsUseCase';
import { GetTransactionHistoryUseCase } from '../../../application/use-cases/GetTransactionHistoryUseCase';
import { RepositoryFactory } from '../../../infrastructure/repositories/RepositoryFactory';

// Get singleton repository instances
const factory = RepositoryFactory.getInstance();
const accountRepo = factory.getBankAccountRepository();
const transactionRepo = factory.getTransactionRepository();

// Create singleton use case instances (shared across all requests)
const transferFundsUseCase = new TransferFundsUseCase(accountRepo, transactionRepo);
const depositFundsUseCase = new DepositFundsUseCase(accountRepo, transactionRepo);
const withdrawFundsUseCase = new WithdrawFundsUseCase(accountRepo, transactionRepo);
const getTransactionHistoryUseCase = new GetTransactionHistoryUseCase(transactionRepo, accountRepo);

console.log('✓ TransactionController initialized with singleton repositories and use cases');

interface TransferBody {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
}

interface DepositBody {
  toAccountId: string;
  amount: number;
  description: string;
}

interface WithdrawBody {
  fromAccountId: string;
  amount: number;
  description: string;
}

export class TransactionController {
  async transfer(request: FastifyRequest<{ Body: TransferBody }>, reply: FastifyReply) {
    try {
      const { fromAccountId, toAccountId, amount, description } = request.body;
      const transaction = await transferFundsUseCase.execute(
        fromAccountId,
        toAccountId,
        amount,
        description
      );

      return reply.code(201).send({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      });
    } catch (error) {
      return reply.code(400).send({
        error: 'Transfer failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deposit(request: FastifyRequest<{ Body: DepositBody }>, reply: FastifyReply) {
    try {
      const { toAccountId, amount, description } = request.body;
      const transaction = await depositFundsUseCase.execute(
        toAccountId,
        amount,
        description
      );

      return reply.code(201).send({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      });
    } catch (error) {
      return reply.code(400).send({
        error: 'Deposit failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async withdraw(request: FastifyRequest<{ Body: WithdrawBody }>, reply: FastifyReply) {
    try {
      const { fromAccountId, amount, description } = request.body;
      const transaction = await withdrawFundsUseCase.execute(
        fromAccountId,
        amount,
        description
      );

      return reply.code(201).send({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      });
    } catch (error) {
      return reply.code(400).send({
        error: 'Withdrawal failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getTransactions(request: FastifyRequest<{ Params: { accountId: string } }>, reply: FastifyReply) {
    try {
      const { accountId } = request.params;
      const transactions = await transactionRepo.findByAccountId(accountId, 50);

      return reply.code(200).send(
        transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          description: t.description,
          status: t.status,
          createdAt: t.createdAt,
        }))
      );
    } catch (error) {
      return reply.code(500).send({
        error: 'Failed to retrieve transactions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getClientHistory(request: FastifyRequest<{ Params: { clientId: string } }>, reply: FastifyReply) {
    try {
      const { clientId } = request.params;
      const transactions = await getTransactionHistoryUseCase.execute(clientId, 100);

      return reply.code(200).send({
        success: true,
        count: transactions.length,
        transactions: transactions.map(t => ({
          id: t.id,
          type: t.type,
          fromAccountId: t.fromAccountId,
          toAccountId: t.toAccountId,
          amount: t.amount,
          description: t.description,
          status: t.status,
          createdAt: t.createdAt,
          completedAt: t.completedAt,
        })),
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve client history',
      });
    }
  }
}
