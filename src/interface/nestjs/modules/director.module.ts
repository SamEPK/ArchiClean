import { Module } from '@nestjs/common';
import { DirectorController } from '../controllers/director.controller';
import { CreateStockUseCase } from '../../../application/use-cases/CreateStockUseCase';
import { UpdateStockUseCase } from '../../../application/use-cases/UpdateStockUseCase';
import { DeleteStockUseCase } from '../../../application/use-cases/DeleteStockUseCase';
import { ToggleStockAvailabilityUseCase } from '../../../application/use-cases/ToggleStockAvailabilityUseCase';
import { UpdateSavingsInterestRateUseCase } from '../../../application/use-cases/UpdateSavingsInterestRateUseCase';
import { CreateClientByDirectorUseCase } from '../../../application/use-cases/CreateClientByDirectorUseCase';
import { UpdateClientByDirectorUseCase } from '../../../application/use-cases/UpdateClientByDirectorUseCase';
import { DeleteClientByDirectorUseCase } from '../../../application/use-cases/DeleteClientByDirectorUseCase';
import { BanClientUseCase } from '../../../application/use-cases/BanClientUseCase';
import { InMemorySavingsAccountRepository } from '../../../infrastructure/repositories/in-memory/InMemorySavingsAccountRepository';
import { InMemoryBankAccountRepository } from '../../../infrastructure/repositories/in-memory/InMemoryBankAccountRepository';
import { MongoSavingsAccountRepository } from '../../../infrastructure/repositories/mongodb/MongoSavingsAccountRepository';
import { MongoBankAccountRepository } from '../../../infrastructure/repositories/mongodb/MongoBankAccountRepository';
import { AuthModule } from './auth.module';
import { ClientModule } from './client.module';
import { StockModule } from './stock.module';
import { AdvisorModule } from './advisor.module';
import { EmailService } from '@infrastructure/services/EmailService';
import { IStockRepository } from '@domain/repositories/IStockRepository';
import { ISavingsAccountRepository } from '@domain/repositories/ISavingsAccountRepository';
import { IClientRepository } from '@domain/repositories/IClientRepository';
import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';

const useMongo = process.env.DIRECTOR_PERSISTENCE === 'mongo' || process.env.PERSISTENCE === 'mongo';

// Note: StockRepository is imported from StockModule to ensure singleton behavior
// This prevents multiple repository instances and data inconsistency issues
const savingsAccountRepository: ISavingsAccountRepository = useMongo
  ? new MongoSavingsAccountRepository()
  : new InMemorySavingsAccountRepository();
// Note: ClientRepository is imported from ClientModule to ensure singleton behavior
// This prevents multiple repository instances and data inconsistency issues
const bankAccountRepository: IBankAccountRepository = useMongo
  ? new MongoBankAccountRepository()
  : new InMemoryBankAccountRepository();
// Note: AdvisorRepository is imported from AdvisorModule to ensure singleton behavior
// This prevents multiple repository instances and data inconsistency issues

@Module({
  imports: [AuthModule, ClientModule, StockModule, AdvisorModule], // Import modules to reuse singleton repositories
  controllers: [DirectorController],
  providers: [
    // Repositories
    // IStockRepository is provided by StockModule (imported above)
    {
      provide: 'ISavingsAccountRepository',
      useValue: savingsAccountRepository,
    },
    // IClientRepository is provided by ClientModule (imported above)
    {
      provide: 'IBankAccountRepository',
      useValue: bankAccountRepository,
    },
    // IAdvisorRepository is provided by AdvisorModule (imported above)

    // Use Cases
    {
      provide: CreateStockUseCase,
      useFactory: (stockRepo: IStockRepository) => {
        return new CreateStockUseCase(stockRepo);
      },
      inject: ['IStockRepository'],
    },
    {
      provide: UpdateStockUseCase,
      useFactory: (stockRepo: IStockRepository) => {
        return new UpdateStockUseCase(stockRepo);
      },
      inject: ['IStockRepository'],
    },
    {
      provide: DeleteStockUseCase,
      useFactory: (stockRepo: IStockRepository) => {
        return new DeleteStockUseCase(stockRepo);
      },
      inject: ['IStockRepository'],
    },
    {
      provide: ToggleStockAvailabilityUseCase,
      useFactory: (stockRepo: IStockRepository) => {
        return new ToggleStockAvailabilityUseCase(stockRepo);
      },
      inject: ['IStockRepository'],
    },
    {
      provide: UpdateSavingsInterestRateUseCase,
      useFactory: (
        savingsRepo: ISavingsAccountRepository,
        clientRepo: IClientRepository,
        emailService: EmailService
      ) => {
        return new UpdateSavingsInterestRateUseCase(savingsRepo, async ({ newRate, updatedCount }) => {
          const clients = await clientRepo.findAll();

          await Promise.all(
            clients.map((client) =>
              emailService.sendEmail({
                to: client.email,
                subject: 'Mise à jour du taux d\'épargne',
                text: `Le nouveau taux d\'épargne quotidien est de ${newRate}%. ${updatedCount} comptes ont été mis à jour.`,
                html: `<p>Bonjour ${client.firstName},</p><p>Le taux d'épargne quotidien passe à <strong>${newRate}%</strong>. ${updatedCount} comptes ont été ajustés.</p><p>Aucun changement de votre part n'est nécessaire.</p>`,
              })
            )
          );
        });
      },
      inject: ['ISavingsAccountRepository', 'IClientRepository', EmailService],
    },
    {
      provide: CreateClientByDirectorUseCase,
      useFactory: (clientRepo: IClientRepository) => {
        return new CreateClientByDirectorUseCase(clientRepo);
      },
      inject: ['IClientRepository'],
    },
    {
      provide: UpdateClientByDirectorUseCase,
      useFactory: (clientRepo: IClientRepository) => {
        return new UpdateClientByDirectorUseCase(clientRepo);
      },
      inject: ['IClientRepository'],
    },
    {
      provide: DeleteClientByDirectorUseCase,
      useFactory: (
        clientRepo: IClientRepository,
        bankAccountRepo: IBankAccountRepository
      ) => {
        return new DeleteClientByDirectorUseCase(clientRepo, bankAccountRepo);
      },
      inject: ['IClientRepository', 'IBankAccountRepository'],
    },
    {
      provide: BanClientUseCase,
      useFactory: (clientRepo: IClientRepository) => {
        return new BanClientUseCase(clientRepo);
      },
      inject: ['IClientRepository'],
    },
  ],
})
export class DirectorModule {}
