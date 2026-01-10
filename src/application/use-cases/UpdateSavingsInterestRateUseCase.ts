import { ISavingsAccountRepository } from '../../domain/repositories/ISavingsAccountRepository';
import { getNotificationService } from '@infrastructure/services/NotificationService';

export interface RateChangeNotificationPayload {
  newRate: number;
  updatedCount: number;
}

export type RateChangeNotifier = (payload: RateChangeNotificationPayload) => Promise<void>;

export class UpdateSavingsInterestRateUseCase {
  constructor(
    private savingsAccountRepository: ISavingsAccountRepository,
    private notifyRateChange?: RateChangeNotifier
  ) {}

  async execute(newInterestRate: number): Promise<{
    updatedCount: number;
    newRate: number;
    message: string;
  }> {
    if (newInterestRate < 0) {
      throw new Error('Interest rate cannot be negative');
    }

    if (newInterestRate > 100) {
      throw new Error('Interest rate cannot exceed 100%');
    }

    const rateAsDecimal = newInterestRate / 100;
    const allAccounts = await this.savingsAccountRepository.findAll();

    let updatedCount = 0;
    for (const account of allAccounts) {
      const updatedAccount = new (account.constructor as any)(
        account.id,
        account.accountId,
        rateAsDecimal,
        account.balance,
        account.lastInterestDate,
        account.createdAt
      );
      await this.savingsAccountRepository.update(updatedAccount);
      updatedCount++;
    }

    const result = {
      updatedCount,
      newRate: newInterestRate,
      message: `Interest rate updated to ${newInterestRate}% for ${updatedCount} savings accounts`,
    };

    // Notification automatique via le service
    try {
      const notificationService = getNotificationService();
      await notificationService.notifySavingsRateChange(newInterestRate, updatedCount);
    } catch (error) {
      console.error('Savings rate change notification failed (service)', error);
    }

    // Hook optionnel pour compatibilité
    if (this.notifyRateChange) {
      try {
        await this.notifyRateChange({
          newRate: newInterestRate,
          updatedCount,
        });
      } catch (error) {
        console.error('Savings rate change notification failed (hook)', error);
      }
    }

    return result;
  }
}
