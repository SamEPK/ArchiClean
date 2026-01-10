import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RepositoryFactory } from '../../../infrastructure/repositories/RepositoryFactory';
import { RegisterClientUseCase } from '@application/use-cases/RegisterClientUseCase';
import { ConfirmEmailUseCase } from '@application/use-cases/ConfirmEmailUseCase';
import { AuthenticateClientUseCase } from '@application/use-cases/AuthenticateClientUseCase';
import { CreateBankAccountUseCase } from '@application/use-cases/CreateBankAccountUseCase';
import { UpdateBankAccountNameUseCase } from '@application/use-cases/UpdateBankAccountNameUseCase';
import { DeleteBankAccountUseCase } from '@application/use-cases/DeleteBankAccountUseCase';
import { ListBankAccountsUseCase } from '@application/use-cases/ListBankAccountsUseCase';
import { MockEmailService } from '@infrastructure/services/EmailService';

const factory = RepositoryFactory.getInstance();
const clientRepo = factory.getClientRepository();
const accountRepo = factory.getBankAccountRepository();
const emailService = new MockEmailService();

// Initialize use cases
const createBankAccountUseCase = new CreateBankAccountUseCase(accountRepo, clientRepo);
const registerClientUseCase = new RegisterClientUseCase(clientRepo, emailService, createBankAccountUseCase);
const confirmEmailUseCase = new ConfirmEmailUseCase(clientRepo);
const authenticateClientUseCase = new AuthenticateClientUseCase(clientRepo);
const updateBankAccountNameUseCase = new UpdateBankAccountNameUseCase(accountRepo);
const deleteBankAccountUseCase = new DeleteBankAccountUseCase(accountRepo);
const listBankAccountsUseCase = new ListBankAccountsUseCase(accountRepo);

interface RegisterClientBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

interface LoginClientBody {
  email: string;
  password: string;
}

interface CreateAccountBody {
  accountName: string;
  initialBalance?: number;
  currency?: string;
}

interface UpdateAccountNameBody {
  accountName: string;
}

export class ClientController {
  async register(request: FastifyRequest<{ Body: RegisterClientBody }>, reply: FastifyReply) {
    try {
      const { email, password, firstName, lastName, phoneNumber } = request.body;
      const result = await registerClientUseCase.execute(email, password, firstName, lastName, phoneNumber);

      return reply.status(201).send({
        success: true,
        message: 'Registration successful. Please check your email to confirm your account.',
        clientId: result.client.id,
        email: result.client.email,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  async confirmEmail(
    request: FastifyRequest<{ Querystring: { token: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { token } = request.query;
      const result = await confirmEmailUseCase.execute(token);

      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Email confirmation failed',
      });
    }
  }

  async login(
    request: FastifyRequest<{ Body: LoginClientBody }>,
    reply: FastifyReply,
    fastify: any
  ) {
    try {
      const { email, password } = request.body;
      const result = await authenticateClientUseCase.execute(email, password);

      if (result.success && result.client) {
        const token = fastify.jwt.sign({
          id: result.client.id,
          email: result.client.email,
          type: 'client',
        });

        return reply.send({
          success: true,
          message: result.message,
          token,
          client: {
            id: result.client.id,
            email: result.client.email,
            firstName: result.client.firstName,
            lastName: result.client.lastName,
            phoneNumber: result.client.phoneNumber,
          },
        });
      }

      return reply.status(401).send({
        success: false,
        message: result.message,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  }

  async createBankAccount(
    request: FastifyRequest<{ Params: { clientId: string }; Body: CreateAccountBody }>,
    reply: FastifyReply
  ) {
    try {
      const { clientId } = request.params;
      const { accountName, initialBalance = 0, currency = 'EUR' } = request.body;

      const account = await createBankAccountUseCase.execute(
        clientId,
        accountName,
        initialBalance,
        currency
      );

      return reply.status(201).send({
        success: true,
        message: 'Bank account created successfully',
        account: {
          id: account.id,
          iban: account.iban,
          accountName: account.accountName,
          balance: account.balance,
          currency: account.currency,
          isActive: account.isActive,
          createdAt: account.createdAt,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create bank account',
      });
    }
  }

  async listBankAccounts(
    request: FastifyRequest<{ Params: { clientId: string }; Querystring: { includeInactive?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { clientId } = request.params;
      const includeInactive = request.query.includeInactive === 'true';

      const accounts = await listBankAccountsUseCase.execute(clientId, includeInactive);

      return reply.send({
        success: true,
        count: accounts.length,
        accounts: accounts.map(account => ({
          id: account.id,
          iban: account.iban,
          accountName: account.accountName,
          balance: account.balance,
          currency: account.currency,
          isActive: account.isActive,
          createdAt: account.createdAt,
        })),
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list accounts',
      });
    }
  }

  async updateBankAccountName(
    request: FastifyRequest<{ 
      Params: { clientId: string; accountId: string }; 
      Body: UpdateAccountNameBody 
    }>,
    reply: FastifyReply
  ) {
    try {
      const { clientId, accountId } = request.params;
      const { accountName } = request.body;

      const account = await updateBankAccountNameUseCase.execute(accountId, clientId, accountName);

      return reply.send({
        success: true,
        message: 'Account name updated successfully',
        account: {
          id: account.id,
          iban: account.iban,
          accountName: account.accountName,
          balance: account.balance,
          currency: account.currency,
          isActive: account.isActive,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update account name',
      });
    }
  }

  async deleteBankAccount(
    request: FastifyRequest<{ Params: { clientId: string; accountId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { clientId, accountId } = request.params;
      const result = await deleteBankAccountUseCase.execute(accountId, clientId);

      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete account',
      });
    }
  }
  async getProfile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const client = await clientRepo.findById(id);

      if (!client) {
        return reply.code(404).send({ error: 'Client not found' });
      }

      return reply.code(200).send({
        id: client.id,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        phoneNumber: client.phoneNumber,
      });
    } catch (error) {
      return reply.code(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getAccounts(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const accounts = await accountRepo.findByClientId(id);

      return reply.code(200).send(
        accounts.map((acc: any) => ({
          id: acc.id,
          accountNumber: acc.accountNumber,
          balance: acc.balance,
          type: acc.type,
          createdAt: acc.createdAt,
        }))
      );
    } catch (error) {
      return reply.code(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getAllClients(request: FastifyRequest, reply: FastifyReply) {
    try {
      const clients = await clientRepo.findAll();

      return reply.code(200).send(
        clients.map((client: any) => ({
          id: client.id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber,
        }))
      );
    } catch (error) {
      return reply.code(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
