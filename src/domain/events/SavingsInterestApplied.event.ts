import { DomainEvent } from './DomainEvent';

export interface SavingsInterestAppliedData {
  savingsAccountId: string;
  clientId: string;
  previousBalance: number;
  interestAmount: number;
  newBalance: number;
  interestRate: number;
  appliedAt: Date;
}

export type SavingsInterestAppliedEvent = DomainEvent<SavingsInterestAppliedData>;

export function createSavingsInterestAppliedEvent(
  savingsAccountId: string,
  data: SavingsInterestAppliedData
): SavingsInterestAppliedEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    streamId: `savings-${savingsAccountId}`,
    version: 1,
    type: 'SavingsInterestApplied',
    occurredAt: new Date(),
    data,
  };
}
