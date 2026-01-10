import { DomainEvent } from './DomainEvent';

export interface AccountCreatedData {
  accountId: string;
  clientId: string;
  iban: string;
  accountName: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
}

export type AccountCreatedEvent = DomainEvent<AccountCreatedData>;

export function createAccountCreatedEvent(
  accountId: string,
  data: AccountCreatedData
): AccountCreatedEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    streamId: `account-${accountId}`,
    version: 1,
    type: 'AccountCreated',
    occurredAt: new Date(),
    data,
  };
}
