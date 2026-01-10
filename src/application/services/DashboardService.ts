import { Injectable, Inject } from '@nestjs/common';
import { IClientRepository } from '@domain/repositories/IClientRepository';
import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { ICreditRepository } from '@domain/repositories/ICreditRepository';
import { EVENT_STORE, EventStore, DomainEvent } from '@domain/events/DomainEvent';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(EVENT_STORE) private eventStore: any,
    @Inject('IClientRepository') private clientRepo: IClientRepository,
    @Inject('IBankAccountRepository') private accountRepo: IBankAccountRepository,
    @Inject('IOrderRepository') private orderRepo: IOrderRepository,
    @Inject('ICreditRepository') private creditRepo: ICreditRepository,
  ) {}

  async rebuildStateFromEvents(streamId: string) {
    try {
      const events = await this.eventStore.load(streamId);

      if (!events || events.length === 0) {
        return {
          success: false,
          message: 'No events found for this stream',
          streamId,
          eventsCount: 0,
          before: {},
          after: {},
        };
      }

      let state: any = {};
      const before = {};

      events.forEach((event: DomainEvent) => {
        switch (event.type) {
          case 'CreditGranted':
            state = {
              ...event.data,
              status: 'ACTIVE',
              eventType: 'CreditGranted',
            };
            break;

          case 'ConversationAssigned':
            state = {
              ...event.data,
              status: 'ASSIGNED',
              eventType: 'ConversationAssigned',
            };
            break;

          case 'OrderExecuted':
          case 'OrderPlaced':
            state = {
              ...event.data,
              status: 'EXECUTED',
              eventType: event.type,
            };
            break;

          case 'FundsTransferred':
            state = {
              ...event.data,
              status: 'COMPLETED',
              eventType: 'FundsTransferred',
            };
            break;

          case 'AccountCreated':
            state = {
              ...event.data,
              status: 'ACTIVE',
              eventType: 'AccountCreated',
            };
            break;

          default:
            state = {
              ...state,
              ...event.data,
              lastEventType: event.type,
            };
        }
      });

      return {
        success: true,
        streamId,
        eventsCount: events.length,
        before,
        after: state,
        events: events.map((e: DomainEvent) => ({
          type: e.type,
          timestamp: e.occurredAt,
          version: e.version,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to rebuild state',
        streamId,
        eventsCount: 0,
        before: {},
        after: {},
      };
    }
  }

  async getAggregatedClientProfile(clientId: string) {
    try {
      const client = await this.clientRepo.findById(clientId);
      if (!client) {
        return {
          success: false,
          message: 'Client not found',
        };
      }

      const accounts = await this.accountRepo.findByClientId(clientId);
      const credits = await this.creditRepo.findByUserId(clientId);
      const orders = await this.orderRepo.findByUserId(clientId);

      const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
      const totalCredits = credits.reduce((sum: number, credit: any) => sum + credit.amount, 0);

      return {
        success: true,
        client: {
          id: client.id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber,
          isEmailConfirmed: client.isEmailConfirmed,
          isBanned: client.isBanned,
        },
        accounts: accounts.map((acc: any) => ({
          id: acc.id,
          iban: acc.iban,
          accountName: acc.accountName,
          balance: acc.balance,
          currency: acc.currency,
          isActive: acc.isActive,
          createdAt: acc.createdAt,
        })),
        credits: credits.map((credit: any) => ({
          id: credit.id,
          amount: credit.amount,
          annualRate: credit.annualRate,
          insuranceRate: credit.insuranceRate,
          durationMonths: credit.durationMonths,
          monthlyPayment: credit.monthlyPayment,
          remainingAmount: credit.remainingAmount,
          status: credit.status,
        })),
        orders: orders.map((order: any) => ({
          id: order.id,
          stockSymbol: order.stockId,
          quantity: order.quantity,
          orderType: order.type,
          status: order.status,
          executedPrice: order.price,
          createdAt: order.createdAt,
        })),
        summary: {
          totalBalance,
          totalCredits,
          accountsCount: accounts.length,
          creditsCount: credits.length,
          ordersCount: orders.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get client profile',
      };
    }
  }

  async getAllClients() {
    try {
      const clients = await this.clientRepo.findAll();

      const clientsWithBalances = await Promise.all(
        clients.map(async (client) => {
          const accounts = await this.accountRepo.findByClientId(client.id);
          const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);

          return {
            id: client.id,
            email: client.email,
            firstName: client.firstName,
            lastName: client.lastName,
            phoneNumber: client.phoneNumber,
            totalBalance,
            accountsCount: accounts.length,
            isEmailConfirmed: client.isEmailConfirmed,
            isBanned: client.isBanned,
          };
        })
      );

      return {
        success: true,
        count: clientsWithBalances.length,
        clients: clientsWithBalances,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get clients',
        clients: [],
      };
    }
  }

  async getEventTimeline(streamId?: string) {
    try {
      let events;

      if (streamId) {
        events = await this.eventStore.load(streamId);
      } else {
        events = await this.eventStore.getAllEvents();
      }

      return {
        success: true,
        count: events.length,
        streamId: streamId || 'all',
        events: events.map((event: DomainEvent) => ({
          type: event.type,
          streamId: event.streamId,
          version: event.version,
          timestamp: event.occurredAt,
          data: event.data,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get event timeline',
        events: [],
      };
    }
  }
}
