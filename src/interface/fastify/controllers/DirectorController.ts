import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateStockUseCase } from '@application/use-cases/CreateStockUseCase';
import { UpdateStockUseCase } from '@application/use-cases/UpdateStockUseCase';
import { DeleteStockUseCase } from '@application/use-cases/DeleteStockUseCase';
import { ToggleStockAvailabilityUseCase } from '@application/use-cases/ToggleStockAvailabilityUseCase';
import { UpdateSavingsInterestRateUseCase } from '@application/use-cases/UpdateSavingsInterestRateUseCase';
import { CreateClientByDirectorUseCase } from '@application/use-cases/CreateClientByDirectorUseCase';
import { UpdateClientByDirectorUseCase } from '@application/use-cases/UpdateClientByDirectorUseCase';
import { DeleteClientByDirectorUseCase } from '@application/use-cases/DeleteClientByDirectorUseCase';
import { BanClientUseCase } from '@application/use-cases/BanClientUseCase';
import { RepositoryFactory } from '@infrastructure/repositories/RepositoryFactory';

const factory = RepositoryFactory.getInstance();

// Initialize use cases
const stockRepo = factory.getStockRepository();
const savingsAccountRepo = factory.getSavingsAccountRepository();
const clientRepo = factory.getClientRepository();
const bankAccountRepo = factory.getBankAccountRepository();

const createStockUseCase = new CreateStockUseCase(stockRepo);
const updateStockUseCase = new UpdateStockUseCase(stockRepo);
const deleteStockUseCase = new DeleteStockUseCase(stockRepo);
const toggleStockAvailabilityUseCase = new ToggleStockAvailabilityUseCase(stockRepo);
const updateSavingsInterestRateUseCase = new UpdateSavingsInterestRateUseCase(savingsAccountRepo);
const createClientByDirectorUseCase = new CreateClientByDirectorUseCase(clientRepo);
const updateClientByDirectorUseCase = new UpdateClientByDirectorUseCase(clientRepo);
const deleteClientByDirectorUseCase = new DeleteClientByDirectorUseCase(clientRepo, bankAccountRepo);
const banClientUseCase = new BanClientUseCase(clientRepo);

interface CreateStockBody {
  symbol: string;
  name: string;
  companyName: string;
  isAvailable?: boolean;
}

interface UpdateStockBody {
  name?: string;
  companyName?: string;
  isAvailable?: boolean;
}

interface ToggleStockBody {
  isAvailable: boolean;
}

interface UpdateSavingsRateBody {
  interestRate: number;
}

interface CreateClientBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

interface UpdateClientBody {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

interface BanClientBody {
  reason?: string;
}

export class DirectorController {
  // Stock Management
  async createStock(request: FastifyRequest<{ Body: CreateStockBody }>, reply: FastifyReply) {
    try {
      const { symbol, name, companyName, isAvailable = true } = request.body;
      const stock = await createStockUseCase.execute(symbol, name, companyName, isAvailable);

      return reply.status(201).send({
        success: true,
        message: 'Stock created successfully',
        stock: {
          id: stock.id,
          symbol: stock.symbol,
          name: stock.name,
          companyName: stock.companyName,
          isAvailable: stock.isAvailable,
          createdAt: stock.createdAt,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create stock',
      });
    }
  }

  async updateStock(
    request: FastifyRequest<{ Params: { stockId: string }; Body: UpdateStockBody }>,
    reply: FastifyReply
  ) {
    try {
      const { stockId } = request.params;
      const stock = await updateStockUseCase.execute(stockId, request.body);

      return reply.send({
        success: true,
        message: 'Stock updated successfully',
        stock: {
          id: stock.id,
          symbol: stock.symbol,
          name: stock.name,
          companyName: stock.companyName,
          isAvailable: stock.isAvailable,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update stock',
      });
    }
  }

  async deleteStock(
    request: FastifyRequest<{ Params: { stockId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { stockId } = request.params;
      await deleteStockUseCase.execute(stockId);

      return reply.send({
        success: true,
        message: 'Stock deleted successfully',
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete stock',
      });
    }
  }

  async toggleStockAvailability(
    request: FastifyRequest<{ Params: { stockId: string }; Body: ToggleStockBody }>,
    reply: FastifyReply
  ) {
    try {
      const { stockId } = request.params;
      const { isAvailable } = request.body;
      const stock = await toggleStockAvailabilityUseCase.execute(stockId, isAvailable);

      return reply.send({
        success: true,
        message: `Stock ${isAvailable ? 'activated' : 'deactivated'} successfully`,
        stock: {
          id: stock.id,
          symbol: stock.symbol,
          isAvailable: stock.isAvailable,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to toggle stock availability',
      });
    }
  }

  // Savings Interest Rate Management
  async updateInterestRate(
    request: FastifyRequest<{ Body: UpdateSavingsRateBody }>,
    reply: FastifyReply
  ) {
    try {
      const { interestRate } = request.body;
      const result = await updateSavingsInterestRateUseCase.execute(interestRate);

      return reply.send({
        success: true,
        ...result,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update interest rate',
      });
    }
  }

  // Client Management
  async createClient(
    request: FastifyRequest<{ Body: CreateClientBody }>,
    reply: FastifyReply
  ) {
    try {
      const { email, password, firstName, lastName, phoneNumber } = request.body;
      const client = await createClientByDirectorUseCase.execute(
        email,
        password,
        firstName,
        lastName,
        phoneNumber
      );

      return reply.status(201).send({
        success: true,
        message: 'Client created successfully by director (email auto-confirmed)',
        client: {
          id: client.id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber,
          isEmailConfirmed: client.isEmailConfirmed,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create client',
      });
    }
  }

  async updateClient(
    request: FastifyRequest<{ Params: { clientId: string }; Body: UpdateClientBody }>,
    reply: FastifyReply
  ) {
    try {
      const { clientId } = request.params;
      const client = await updateClientByDirectorUseCase.execute(clientId, request.body);

      return reply.send({
        success: true,
        message: 'Client updated successfully',
        client: {
          id: client.id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update client',
      });
    }
  }

  async deleteClient(
    request: FastifyRequest<{ Params: { clientId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { clientId } = request.params;
      await deleteClientByDirectorUseCase.execute(clientId);

      return reply.send({
        success: true,
        message: 'Client deleted successfully',
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete client',
      });
    }
  }

  async banClient(
    request: FastifyRequest<{ Params: { clientId: string }; Body: BanClientBody }>,
    reply: FastifyReply
  ) {
    try {
      const { clientId } = request.params;
      const { reason } = request.body;
      const client = await banClientUseCase.execute(clientId, true);

      return reply.send({
        success: true,
        message: 'Client banned successfully',
        client: {
          id: client.id,
          email: client.email,
          isBanned: client.isBanned,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to ban client',
      });
    }
  }
}
