export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  avatar?: string;
}

export enum UserRole {
  CLIENT = 'CLIENT',
  ADVISOR = 'ADVISOR',
  DIRECTOR = 'DIRECTOR',
}

export interface Client extends User {
  assignedAdvisorId?: string;
  isBanned: boolean;
}

export interface Advisor extends User {
  specialization?: string;
  clientsCount?: number;
}

export interface Director extends User {
  permissions: string[];
}

export interface BankAccount {
  id: string;
  clientId: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT',
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  createdAt: string;
  balanceAfter: number;
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  STOCK_BUY = 'STOCK_BUY',
  STOCK_SELL = 'STOCK_SELL',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  companyName: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  isAvailable: boolean;
  lastUpdated: string;
}

export interface Order {
  id: string;
  userId: string;
  stockId: string;
  type: OrderType;
  quantity: number;
  price: number;
  status: OrderStatus;
  createdAt: string;
  executedAt?: string;
  accountId: string;
}

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export interface Portfolio {
  userId: string;
  positions: PortfolioPosition[];
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export interface PortfolioPosition {
  stockId: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface Credit {
  id: string;
  clientId: string;
  advisorId: string;
  amount: number;
  interestRate: number;
  durationMonths: number;
  monthlyPayment: number;
  status: CreditStatus;
  approvedAt?: string;
  startDate?: string;
  endDate?: string;
}

export enum CreditStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  DEFAULTED = 'DEFAULTED',
}

export interface Conversation {
  id: string;
  clientId: string;
  advisorId?: string;
  status: ConversationStatus;
  subject: string;
  lastMessageAt: string;
  createdAt: string;
  messages: Message[];
}

export enum ConversationStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  CLOSED = 'CLOSED',
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
