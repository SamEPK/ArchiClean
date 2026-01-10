# ArchiClean - Architecture & Patterns Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture Layers](#architecture-layers)
- [Event Sourcing](#event-sourcing)
- [CQRS Pattern](#cqrs-pattern)
- [Repository Singleton Pattern](#repository-singleton-pattern)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)

---

## 🎯 Overview

**ArchiClean** is a banking application built with **Clean Architecture**, **CQRS**, and **Event Sourcing** patterns. The system supports:

- ✅ Client banking operations (accounts, transactions, savings)
- ✅ Stock trading and portfolio management
- ✅ Credit management by advisors
- ✅ Real-time messaging (client ↔ advisor)
- ✅ Complete audit trail via Event Sourcing
- ✅ Dual framework support (NestJS & Fastify)

---

## 🏛️ Architecture Layers

The application follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACE LAYER                          │
│  ┌──────────────────┐          ┌──────────────────┐        │
│  │   NestJS API     │          │   Fastify API    │        │
│  │   Port: 3000     │          │   Port: 3001     │        │
│  │   /clients       │          │   /api/clients   │        │
│  │   /transactions  │          │   /api/transactions       │
│  │   /stocks        │          │   /api/stocks    │        │
│  └────────┬─────────┘          └────────┬─────────┘        │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
            ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Use Cases                          │  │
│  │  • RegisterClientUseCase                             │  │
│  │  • TransferFundsUseCase                              │  │
│  │  • PlaceStockOrderUseCase                            │  │
│  │  • GrantCreditUseCase                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  CQRS Layer                           │  │
│  │  ┌─────────────────┐      ┌─────────────────┐       │  │
│  │  │   Commands      │      │    Queries       │       │  │
│  │  │ (Write Model)   │      │  (Read Model)    │       │  │
│  │  │                 │      │                  │       │  │
│  │  │ • GrantCredit   │      │ • GetClientCredits│      │  │
│  │  │ • PlaceOrder    │      │ • GetPortfolio   │       │  │
│  │  │ • TransferFunds │      │ • ListConversations      │  │
│  │  └────────┬────────┘      └────────┬─────────┘       │  │
│  │           │                        │                  │  │
│  │           ▼                        ▼                  │  │
│  │    ┌──────────┐             ┌──────────┐            │  │
│  │    │CommandBus│             │QueryBus  │            │  │
│  │    └──────────┘             └──────────┘            │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Entities                            │  │
│  │  • Client        • BankAccount    • Transaction      │  │
│  │  • Stock         • Order          • SavingsAccount   │  │
│  │  • Credit        • Message        • User             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Repository Interfaces                    │  │
│  │  • IClientRepository                                 │  │
│  │  • IBankAccountRepository                            │  │
│  │  • ITransactionRepository                            │  │
│  │  • IStockRepository                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Domain Events                        │  │
│  │  • AccountCreated                                    │  │
│  │  • FundsTransferred                                  │  │
│  │  • OrderExecuted                                     │  │
│  │  • CreditGranted                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Repository Implementations                 │  │
│  │  ┌────────────────────┐    ┌────────────────────┐   │  │
│  │  │  In-Memory Repos   │    │ Persistent Repos   │   │  │
│  │  │  • Orders          │    │ • Clients (file)   │   │  │
│  │  │  • Stocks          │    │ • Advisors (file)  │   │  │
│  │  │  • Transactions    │    │ • Messages (file)  │   │  │
│  │  └────────────────────┘    └────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Event Store                         │  │
│  │  • InMemoryEventStore                                │  │
│  │  • Optimistic concurrency control                    │  │
│  │  • Event replay capability                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              External Services                        │  │
│  │  • EmailService      • HashService (bcrypt)          │  │
│  │  • NotificationService                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Rule

**All dependencies point INWARD**:
- **Interface** depends on **Application**
- **Application** depends on **Domain**
- **Infrastructure** implements **Domain** interfaces
- **Domain** has NO dependencies (pure business logic)

---

## 🔄 Event Sourcing

Event Sourcing captures **all state changes** as immutable domain events. This provides:
- ✅ Complete audit trail
- ✅ State reconstruction from events
- ✅ Time-travel debugging
- ✅ Regulatory compliance

### Event Store Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    EventStore                            │
│                                                           │
│  streams = {                                             │
│    "account-123": [                                      │
│      { id, streamId, version, type: "AccountCreated" }, │
│      { id, streamId, version, type: "FundsDeposited" }, │
│      { id, streamId, version, type: "FundsWithdrawn" }  │
│    ],                                                     │
│    "transfer-456": [                                     │
│      { id, streamId, version, type: "FundsTransferred" }│
│    ],                                                     │
│    "order-789": [                                        │
│      { id, streamId, version, type: "OrderPlaced" },    │
│      { id, streamId, version, type: "OrderExecuted" }   │
│    ]                                                      │
│  }                                                        │
└──────────────────────────────────────────────────────────┘
```

### Domain Events

| Event Type | Stream ID | Data Captured |
|------------|-----------|---------------|
| **AccountCreated** | `account-{id}` | accountId, clientId, iban, balance, createdAt |
| **FundsTransferred** | `transfer-{txId}` | fromAccountId, toAccountId, amount, status |
| **OrderExecuted** | `order-{orderId}` | userId, stockId, type, quantity, price, executedAt |
| **SavingsInterestApplied** | `savings-{id}` | savingsAccountId, previousBalance, interestAmount, newBalance |
| **CreditGranted** | `credit-{id}` | clientId, amount, annualRate, durationMonths |
| **OrderPlaced** | `order-{id}` | userId, stockId, type, quantity, price |
| **ConversationAssigned** | `conversation-{id}` | conversationId, advisorId, assignedAt |
| **AdvisorReplied** | `conversation-{id}` | conversationId, advisorId, content, repliedAt |

### Event Structure

```typescript
interface DomainEvent<T = any> {
  id: string;                    // Unique event ID
  streamId: string;              // Event stream (e.g., "account-123")
  version: number;               // Optimistic concurrency control
  type: string;                  // Event type (e.g., "AccountCreated")
  occurredAt: Date;              // Event timestamp
  data: T;                       // Event-specific payload
  metadata?: Record<string, any>; // Optional metadata
}
```

### Event Flow Example

```
┌────────────────────────────────────────────────────────┐
│  1. User Action: Transfer €100 from A to B            │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  2. Command: TransferFundsCommand                      │
│     { fromAccountId: "A", toAccountId: "B",           │
│       amount: 100, description: "Payment" }            │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  3. Command Handler Executes:                          │
│     • Validates accounts exist                         │
│     • Checks balance                                   │
│     • Debits account A                                 │
│     • Credits account B                                │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  4. Create Domain Event:                               │
│     {                                                   │
│       id: "evt-uuid",                                  │
│       streamId: "transfer-txn-123",                    │
│       version: 0,                                      │
│       type: "FundsTransferred",                        │
│       occurredAt: "2026-01-08T06:00:00Z",             │
│       data: {                                          │
│         transactionId: "txn-123",                      │
│         fromAccountId: "A",                            │
│         toAccountId: "B",                              │
│         amount: 100,                                   │
│         status: "COMPLETED"                            │
│       }                                                 │
│     }                                                   │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  5. EventStore.append(event)                           │
│     • Checks version for concurrency                   │
│     • Appends to stream                                │
│     • Event persisted immutably                        │
└────────────────────────────────────────────────────────┘
```

### State Reconstruction

```typescript
// Rebuild account state from events
const events = await eventStore.load("account-123");

let accountState = { balance: 0 };

events.forEach(event => {
  switch (event.type) {
    case 'AccountCreated':
      accountState = { ...event.data, balance: 0 };
      break;
    case 'FundsDeposited':
      accountState.balance += event.data.amount;
      break;
    case 'FundsWithdrawn':
      accountState.balance -= event.data.amount;
      break;
  }
});

// accountState now reflects current state from events
```

---

## ⚡ CQRS Pattern

**CQRS (Command Query Responsibility Segregation)** separates **write operations** (Commands) from **read operations** (Queries).

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT REQUEST                         │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
       WRITE PATH                    READ PATH
             │                            │
             ▼                            ▼
    ┌─────────────────┐         ┌─────────────────┐
    │   COMMAND       │         │    QUERY        │
    │                 │         │                 │
    │ • GrantCredit   │         │ • GetCredits    │
    │ • PlaceOrder    │         │ • GetPortfolio  │
    │ • TransferFunds │         │ • ListConversations
    └────────┬────────┘         └────────┬────────┘
             │                            │
             ▼                            ▼
    ┌─────────────────┐         ┌─────────────────┐
    │  CommandBus     │         │   QueryBus      │
    └────────┬────────┘         └────────┬────────┘
             │                            │
             ▼                            ▼
    ┌─────────────────┐         ┌─────────────────┐
    │CommandHandler   │         │  QueryHandler   │
    │                 │         │                 │
    │ • Execute       │         │ • Direct query  │
    │   Use Case      │         │   repository    │
    │ • Modify state  │         │ • No state      │
    │ • Emit events   │         │   modification  │
    └────────┬────────┘         └────────┬────────┘
             │                            │
             ▼                            ▼
    ┌─────────────────┐         ┌─────────────────┐
    │   EventStore    │         │   Read Model    │
    │ (Append event)  │         │  (Query data)   │
    └─────────────────┘         └─────────────────┘
```

### Commands (Write Model)

Commands modify system state:

| Command | Purpose | Emits Event |
|---------|---------|-------------|
| **GrantCreditCommand** | Grant credit to client | CreditGranted |
| **PlaceStockOrderCommand** | Place buy/sell order | OrderPlaced |
| **TransferFundsCommand** | Transfer between accounts | FundsTransferred |
| **AssignConversationCommand** | Assign advisor to conversation | ConversationAssigned |
| **ReplyToConversationCommand** | Advisor replies to client | AdvisorReplied |

**Command Flow:**

```typescript
// 1. Controller receives request
@Post('credits')
async grantCredit(@Body() dto: GrantCreditDto) {
  // 2. Create command
  const command = new GrantCreditCommand(
    dto.clientId,
    dto.amount,
    dto.annualRate,
    dto.insuranceRate,
    dto.durationMonths
  );

  // 3. Execute via CommandBus
  const result = await this.commandBus.execute(command);

  return { success: true, credit: result };
}

// 4. Command Handler processes
@CommandHandler(GrantCreditCommand)
export class GrantCreditHandler {
  async execute(command: GrantCreditCommand) {
    // Execute business logic
    const credit = await this.grantCreditUseCase.execute(...);

    // Create domain event
    const event: DomainEvent = {
      id: uuidv4(),
      streamId: `credit-${credit.id}`,
      version: 0,
      type: 'CreditGranted',
      occurredAt: new Date(),
      data: { creditId: credit.id, clientId, amount, ... }
    };

    // Append to event store
    await this.eventStore.append(event);

    return credit;
  }
}
```

### Queries (Read Model)

Queries retrieve data without modifying state:

| Query | Purpose | Returns |
|-------|---------|---------|
| **GetClientCreditsQuery** | Get client's credits | Credit[] |
| **GetClientPortfolioQuery** | Get aggregated portfolio | Portfolio |
| **ListOpenConversationsQuery** | List open conversations | Conversation[] |

**Query Flow:**

```typescript
// 1. Controller receives request
@Get('clients/:clientId/credits')
async getCredits(@Param('clientId') clientId: string) {
  // 2. Create query
  const query = new GetClientCreditsQuery(clientId);

  // 3. Execute via QueryBus
  const credits = await this.queryBus.execute(query);

  return { success: true, credits };
}

// 4. Query Handler processes
@QueryHandler(GetClientCreditsQuery)
export class GetClientCreditsHandler {
  async execute(query: GetClientCreditsQuery) {
    // Direct repository query - no state modification
    return this.creditRepository.findByClientId(query.clientId);
  }
}
```

### Benefits of CQRS

✅ **Scalability**: Read and write models can scale independently
✅ **Performance**: Optimized read models for queries
✅ **Separation**: Clear distinction between commands and queries
✅ **Flexibility**: Different storage strategies for reads/writes
✅ **Maintainability**: Easier to understand and modify

---

## 🔒 Repository Singleton Pattern

**Critical for data consistency**: All modules share **single instances** of repositories.

### Problem Without Singletons

```
❌ WRONG - Multiple instances cause data isolation:

OrderModule creates:     StockModule creates:
  - new OrderRepo()        - new StockRepo()
  - new StockRepo()        ✗ Different instance!

Result: Stocks created in StockModule are invisible to OrderModule
```

### Solution: RepositoriesModule

```typescript
// src/interface/nestjs/modules/repositories.module.ts

// 1. Create SINGLETON instances
const clientRepository = new PersistentClientRepository();
const bankAccountRepository = new InMemoryBankAccountRepository();
const stockRepository = new InMemoryStockRepository();
const orderRepository = new InMemoryOrderRepository();
// ... more repositories

@Module({
  providers: [
    {
      provide: CLIENT_REPOSITORY,
      useValue: clientRepository,  // ✅ Same instance everywhere
    },
    {
      provide: STOCK_REPOSITORY,
      useValue: stockRepository,   // ✅ Shared across modules
    },
    // ... more providers
  ],
  exports: [
    CLIENT_REPOSITORY,
    STOCK_REPOSITORY,
    // ... all repository tokens
  ],
})
export class RepositoriesModule {}
```

### Usage in Modules

```typescript
// All modules import RepositoriesModule

@Module({
  imports: [RepositoriesModule],  // ✅ Get singleton repositories
  providers: [
    {
      provide: PlaceStockOrderUseCase,
      useFactory: (orderRepo, stockRepo, accountRepo, txRepo) =>
        new PlaceStockOrderUseCase(orderRepo, stockRepo, accountRepo, txRepo),
      inject: [
        ORDER_REPOSITORY,     // ✅ Singleton
        STOCK_REPOSITORY,     // ✅ Singleton
        BANK_ACCOUNT_REPOSITORY,  // ✅ Singleton
        TRANSACTION_REPOSITORY    // ✅ Singleton
      ],
    },
  ],
})
export class OrderModule {}
```

### Repository Types

| Repository | Type | Storage | Use Case |
|------------|------|---------|----------|
| **ClientRepository** | Persistent | File (data/clients.json) | User accounts |
| **AdvisorRepository** | Persistent | File (data/advisors.json) | Advisor accounts |
| **MessageRepository** | Persistent | File (data/messages.json) | Chat messages |
| **BankAccountRepository** | In-Memory | Map | Banking operations |
| **TransactionRepository** | In-Memory | Map | Transaction history |
| **StockRepository** | In-Memory | Map | Stock catalog |
| **OrderRepository** | In-Memory | Map | Stock orders |

---

## 🛠️ Tech Stack

### Backend Frameworks
- **NestJS** (Port 3000) - Express adapter
- **Fastify** (Port 3001) - Standalone server

### Core Libraries
- **TypeScript** - Type safety
- **@nestjs/cqrs** - CQRS implementation
- **Socket.io** - Real-time WebSocket communication
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **uuid** - Unique ID generation
- **node-cron** - Scheduled tasks (daily interest)

### Architecture Patterns
- ✅ Clean Architecture (4 layers)
- ✅ CQRS (Command/Query separation)
- ✅ Event Sourcing (immutable event log)
- ✅ Repository Pattern (data access abstraction)
- ✅ Dependency Injection
- ✅ Use Case Pattern

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Running the Application

**NestJS (Port 3000):**
```bash
npm run dev
# or
npm run dev:nestjs
```

**Fastify (Port 3001):**
```bash
npm run dev:fastify
```

### Test Accounts

**Clients:**
- `client1@test.com` / `password123` (Sophie Laurent)
- `client2@test.com` / `password123` (Thomas Dubois)

**Advisors:**
- `conseiller1@banque.com` / `password123` (Jean Conseiller)

**Directors:**
- `directeur@avenir.com` / `DirecteurSecure123!` (Jean Dupont)

### Access Points

- **NestJS API**: http://localhost:3000
- **Fastify API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3000/api-docs
- **Client Dashboard**: http://localhost:3000/client-dashboard.html
- **Advisor Dashboard**: http://localhost:3000/advisor-dashboard.html
- **Director Dashboard**: http://localhost:3000/director-dashboard.html

---

## 📡 API Endpoints

### NestJS (Port 3000)

#### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

#### Clients
- `POST /clients/register` - Register client
- `POST /clients/login` - Client login
- `GET /clients` - List all clients
- `GET /clients/:clientId/accounts` - Get client accounts
- `POST /clients/:clientId/accounts` - Create bank account

#### Transactions
- `POST /transactions/transfer` - Transfer funds
- `POST /transactions/deposit` - Deposit funds
- `POST /transactions/withdraw` - Withdraw funds
- `GET /transactions/history/:clientId` - Transaction history

#### Stocks & Orders
- `GET /stocks` - List all stocks
- `GET /stocks/available` - Available stocks
- `POST /orders` - Place stock order
- `POST /orders/:id/execute` - Execute order
- `GET /orders/client/:clientId` - Client orders

#### Savings
- `POST /savings` - Create savings account
- `GET /savings/client/:clientId` - Client savings accounts
- `POST /savings/apply-interest` - Apply interest

#### Advisors (CQRS)
- `POST /advisors/credits` - Grant credit (Command)
- `GET /advisors/clients/:clientId/credits` - Get credits (Query)
- `GET /advisors/conversations/open` - List conversations (Query)
- `POST /advisors/conversations/:id/assign` - Assign conversation (Command)

### Fastify (Port 3001)

**All routes prefixed with `/api`**

Example:
- `POST /api/transactions/transfer`
- `GET /api/stocks`
- `POST /api/orders`

---

## 🎯 Key Features Demonstration

### 1. Transaction Balance Validation

```typescript
// BankAccount.ts - Domain entity enforces business rules
public withdraw(amount: number): void {
  if (amount > this.balance) {
    throw new Error('Insufficient balance');  // ✅ Validation
  }
  this.balance -= amount;
}
```

### 2. Event Sourcing in Action

```typescript
// After transfer completes, event is stored:
const event: DomainEvent = {
  id: 'evt-123',
  streamId: 'transfer-txn-456',
  version: 0,
  type: 'FundsTransferred',
  occurredAt: new Date(),
  data: {
    fromAccountId: 'acc-A',
    toAccountId: 'acc-B',
    amount: 100,
    status: 'COMPLETED'
  }
};
await eventStore.append(event);  // Immutable audit trail
```

### 3. CQRS Command Execution

```typescript
// Grant credit via CQRS
const command = new GrantCreditCommand(clientId, 5000, 3.5, 0.5, 12);
const credit = await commandBus.execute(command);
// → Executes business logic
// → Emits CreditGranted event
// → Returns result
```

### 4. Repository Singleton Consistency

```typescript
// All modules share the same stock repository
OrderModule → STOCK_REPOSITORY (singleton)
StockModule → STOCK_REPOSITORY (same instance)
// ✅ Stocks are visible across all modules
```

---

## 📊 System Statistics

- **Domain Entities**: 15+ (Client, BankAccount, Stock, Order, Transaction, etc.)
- **Use Cases**: 40+ business operations
- **API Endpoints**: 70+ routes
- **Domain Events**: 8 event types
- **CQRS Commands**: 6 commands
- **CQRS Queries**: 3 queries
- **Repositories**: 12 repositories (6 persistent, 6 in-memory)

---

## 📝 Best Practices

### Clean Architecture
✅ Domain layer has NO external dependencies
✅ Use cases orchestrate business logic
✅ Infrastructure implements domain interfaces
✅ All dependencies point INWARD

### Event Sourcing
✅ Events are immutable (never modified)
✅ Use meaningful event names (past tense: "CreditGranted")
✅ Include all relevant data in event payload
✅ Implement optimistic concurrency control

### CQRS
✅ Commands modify state, queries don't
✅ Separate read and write models
✅ Use CommandBus and QueryBus for routing
✅ Emit domain events after successful commands

### Repository Pattern
✅ Always use singleton instances
✅ Define interfaces in Domain layer
✅ Implement in Infrastructure layer
✅ Inject via dependency injection

---

## 🔍 Troubleshooting

### Issue: Transactions allow amounts > balance
**Cause**: Validation IS implemented in BankAccount.withdraw()
**Check**: Ensure singleton BankAccountRepository is used
**Verify**: Check if account balance is being properly updated

### Issue: Stocks not found when placing orders
**Cause**: OrderModule and StockModule use different repository instances
**Fix**: Both modules must import RepositoriesModule for singleton

### Issue: Transaction history not found
**Endpoint**: `GET /transactions/history/:clientId`
**NestJS**: Port 3000
**Fastify**: Port 3001 with `/api` prefix

---

## 📚 Further Reading

- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Fastify Documentation](https://www.fastify.io/)

---

**Built with Clean Architecture, CQRS, and Event Sourcing** 🚀
