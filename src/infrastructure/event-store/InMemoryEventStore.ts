import { DomainEvent, EventStore } from '@domain/events/DomainEvent';

export class InMemoryEventStore implements EventStore {
  private streams = new Map<string, DomainEvent[]>();

  async append(event: DomainEvent): Promise<void> {
    const events = this.streams.get(event.streamId) || [];
    const expectedVersion = events.length;
    if (event.version !== expectedVersion) {
      throw new Error(`Concurrency error: expected version ${expectedVersion}, got ${event.version}`);
    }
    events.push(event);
    this.streams.set(event.streamId, events);
  }

  async load(streamId: string): Promise<DomainEvent[]> {
    return this.streams.get(streamId) || [];
  }

  async getAllEvents(): Promise<DomainEvent[]> {
    const allEvents: DomainEvent[] = [];
    for (const events of this.streams.values()) {
      allEvents.push(...events);
    }
    // Sort by timestamp (newest first)
    return allEvents.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }
}
