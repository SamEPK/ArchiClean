import cron from 'node-cron';
import { ApplyDailyInterestUseCase } from '@application/use-cases/ApplyDailyInterestUseCase';
import { RepositoryFactory } from '@infrastructure/repositories/RepositoryFactory';

/**
 * Scheduler pour l'automatisation des tâches bancaires quotidiennes
 * 
 * Responsabilités:
 * - Exécuter automatiquement la rémunération quotidienne des comptes d'épargne
 * - Gérer les erreurs et logs d'exécution
 * - S'assurer qu'une seule exécution ne se chevauche pas
 * 
 * @infrastructure Scheduler - Couche Infrastructure
 */
export class BankingScheduler {
  private applyDailyInterestUseCase: ApplyDailyInterestUseCase;
  private isRunning = false;

  constructor() {
    const factory = RepositoryFactory.getInstance();
    const savingsAccountRepo = factory.getSavingsAccountRepository();
    this.applyDailyInterestUseCase = new ApplyDailyInterestUseCase(savingsAccountRepo);
  }

  /**
   * Démarre le scheduler
   * Exécute la rémunération quotidienne tous les jours à minuit
   */
  start(): void {
    console.log('🕐 Banking Scheduler started');
    console.log('📅 Daily interest will be applied every day at midnight (00:00)');

    // Exécution quotidienne à minuit (00:00)
    cron.schedule('0 0 * * *', async () => {
      await this.applyDailyInterest();
    });

    // Optionnel: Exécution toutes les heures pour tests
    // Décommenter pour activer les tests horaires
    // cron.schedule('0 * * * *', async () => {
    //   console.log('⏰ Hourly test execution');
    //   await this.applyDailyInterest();
    // });

    console.log('✅ Scheduler configured successfully');
  }

  /**
   * Applique les intérêts quotidiens sur tous les comptes d'épargne
   * Vérifie qu'une exécution n'est pas déjà en cours
   */
  private async applyDailyInterest(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Daily interest application already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('💰 Starting daily interest application...');
      
      const result = await this.applyDailyInterestUseCase.execute({
        currentDate: new Date(),
      });

      const duration = Date.now() - startTime;
      
      console.log('✅ Daily interest application completed successfully');
      console.log(`📊 Summary:`);
      console.log(`   - Accounts processed: ${result.accountsUpdated}`);
      console.log(`   - Total interest applied: €${result.totalInterestApplied.toFixed(2)}`);
      console.log(`   - Execution time: ${duration}ms`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Failed to apply daily interest');
      console.error(`   - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(`   - Execution time: ${duration}ms`);
      
      // Optionnel: Envoyer une alerte aux administrateurs
      // await this.notifyAdmins(error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Exécute manuellement la rémunération quotidienne
   * Utile pour les tests ou exécutions exceptionnelles
   */
  async executeNow(): Promise<void> {
    console.log('🔧 Manual execution triggered');
    await this.applyDailyInterest();
  }

  /**
   * Arrête le scheduler (pour les tests ou l'arrêt gracieux)
   */
  stop(): void {
    console.log('🛑 Banking Scheduler stopped');
  }
}

// Singleton instance
let schedulerInstance: BankingScheduler | null = null;

/**
 * Obtient l'instance singleton du scheduler
 */
export function getBankingScheduler(): BankingScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new BankingScheduler();
  }
  return schedulerInstance;
}

/**
 * Démarre le scheduler automatiquement
 */
export function startBankingScheduler(): BankingScheduler {
  const scheduler = getBankingScheduler();
  scheduler.start();
  return scheduler;
}
