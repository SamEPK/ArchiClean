export interface DomainEvent<T = any> {
  id: string;
  streamId: string;
  version: number;
  type: string;
  occurredAt: Date;
  data: T;
  metadata?: Record<string, any>;
}

export interface EventStore {
  append(event: DomainEvent): Promise<void>;
  load(streamId: string): Promise<DomainEvent[]>;
}

// Injection token to use with Nest providers
export const EVENT_STORE = Symbol('EVENT_STORE');
