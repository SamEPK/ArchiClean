import { DomainEvent } from './DomainEvent';

export interface FundsTransferredData {
  transactionId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  transferredAt: Date;
}

export type FundsTransferredEvent = DomainEvent<FundsTransferredData>;

export function createFundsTransferredEvent(
  transactionId: string,
  data: FundsTransferredData
): FundsTransferredEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    streamId: `transfer-${transactionId}`,
    version: 1,
    type: 'FundsTransferred',
    occurredAt: new Date(),
    data,
  };
}
