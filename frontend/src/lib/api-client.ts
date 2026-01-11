import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 60000; // 1 minute

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.cache = new Map();

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  private getCacheKey(url: string, params?: any): string {
    return `${url}:${JSON.stringify(params || {})}`;
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig & { useCache?: boolean }
  ): Promise<T> {
    const { useCache = false, ...axiosConfig } = config || {};
    const cacheKey = this.getCacheKey(url, axiosConfig.params);

    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    const response = await this.client.get<T>(url, axiosConfig);
    
    if (useCache) {
      this.setCachedData(cacheKey, response.data);
    }

    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    this.clearCache(); // Invalidate cache on mutations
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    this.clearCache();
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    this.clearCache();
    return response.data;
  }

  // Auth methods
  async login(email: string, password: string, role: string): Promise<any> {
    const endpoints: Record<string, string> = {
      CLIENT: '/clients/login',
      ADVISOR: '/advisors/login',
      DIRECTOR: '/director/login',
    };

    const response = await this.post(endpoints[role] || endpoints.CLIENT, {
      email,
      password,
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async register(data: any): Promise<any> {
    const response = await this.post('/clients/register', data);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  logout(): void {
    this.clearToken();
    this.clearCache();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Client Dashboard methods
  async getClientAccounts(clientId: string): Promise<any> {
    return this.get(`/clients/${clientId}/accounts`, { useCache: true });
  }

  async getClientTransactions(clientId: string, limit: number = 10): Promise<any> {
    return this.get(`/transactions/history/${clientId}?limit=${limit}`, { useCache: true });
  }

  async getClientPortfolio(clientId: string): Promise<any> {
    return this.get(`/portfolio/${clientId}`, { useCache: false });
  }

  async getStocks(): Promise<any> {
    return this.get('/stocks', { useCache: true });
  }

  // Transaction methods
  async deposit(accountId: string, amount: number, description?: string): Promise<any> {
    return this.post('/transactions/deposit', { accountId, amount, description: description || 'Dépôt' });
  }

  async withdraw(accountId: string, amount: number, description?: string): Promise<any> {
    return this.post('/transactions/withdraw', { accountId, amount, description: description || 'Retrait' });
  }

  async transfer(fromAccountId: string, toAccountId: string, amount: number, description?: string): Promise<any> {
    return this.post('/transactions/transfer', { fromAccountId, toAccountId, amount, description: description || 'Virement' });
  }

  // Bank account methods
  async createBankAccount(clientId: string, accountName: string, initialBalance?: number, currency?: string): Promise<any> {
    const data: any = { accountName };
    if (initialBalance && initialBalance > 0) {
      data.initialBalance = initialBalance;
    }
    if (currency) {
      data.currency = currency;
    }
    return this.post(`/clients/${clientId}/accounts`, data);
  }

  // Messaging methods
  async getClientConversations(clientId: string): Promise<any> {
    return this.get(`/conversations/client/${clientId}`, { useCache: true });
  }

  async getConversationMessages(conversationId: string): Promise<any> {
    return this.get(`/conversations/${conversationId}/messages`, { useCache: false });
  }

  async sendMessage(conversationId: string, content: string, senderId: string): Promise<any> {
    return this.post(`/conversations/${conversationId}/messages`, { content, senderId });
  }

  async startConversation(clientId: string, subject: string, initialMessage: string): Promise<any> {
    return this.post('/conversations', { clientId, subject, initialMessage });
  }

  // Stock/Portfolio methods
  async getAvailableStocks(): Promise<any> {
    return this.get('/stocks/available', { useCache: true });
  }

  async getStock(stockId: string): Promise<any> {
    return this.get(`/stocks/${stockId}`, { useCache: true });
  }

  async placeOrder(userId: string, accountId: string, stockId: string, type: 'BUY' | 'SELL', quantity: number, price: number): Promise<any> {
    return this.post('/orders', { userId, accountId, stockId, type, quantity, price });
  }

  async executeOrder(orderId: string, executionPrice: number): Promise<any> {
    return this.post(`/orders/${orderId}/execute`, { executionPrice });
  }

  async getMyOrders(userId: string): Promise<any> {
    return this.get(`/orders/my/${userId}`, { useCache: false });
  }

  async getStockPrice(stockId: string): Promise<any> {
    return this.get(`/orders/stock/${stockId}/price`, { useCache: false });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
