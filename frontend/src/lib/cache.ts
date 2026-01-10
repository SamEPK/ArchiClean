import { getCachedData, setCachedData } from './redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  revalidate?: number; // Revalidation time for Next.js
  tags?: string[]; // Cache tags for invalidation
}

/**
 * Fetch data with Redis caching fallback
 * If Redis is not available, uses Next.js native caching
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = 3600, revalidate, tags = [] } = options;

  // Try to get from Redis cache first
  const cachedData = await getCachedData<T>(key);
  if (cachedData !== null) {
    console.log(`Cache hit (Redis): ${key}`);
    return cachedData;
  }

  // If not in Redis, fetch fresh data
  console.log(`Cache miss: ${key}`);
  const data = await fetcher();

  // Store in Redis cache (async, don't await)
  setCachedData(key, data, ttl).catch((err) =>
    console.error('Failed to cache data:', err)
  );

  return data;
}

/**
 * Create a cache key from parameters
 */
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join(':');
  return `${prefix}:${sortedParams}`;
}

/**
 * API fetch with caching
 */
export async function cachedApiFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheOptions: CacheOptions = {}
): Promise<T> {
  const cacheKey = createCacheKey('api', { url, method: options.method || 'GET' });

  return fetchWithCache<T>(
    cacheKey,
    async () => {
      const response = await fetch(url, {
        ...options,
        next: {
          revalidate: cacheOptions.revalidate,
          tags: cacheOptions.tags,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return response.json();
    },
    cacheOptions
  );
}

/**
 * User data cache utilities
 */
export const userCache = {
  getKey: (userId: string) => `user:${userId}`,
  getAccountsKey: (userId: string) => `user:${userId}:accounts`,
  getTransactionsKey: (userId: string, page: number = 1) =>
    `user:${userId}:transactions:page:${page}`,
  getPortfolioKey: (userId: string) => `user:${userId}:portfolio`,
};

/**
 * Market data cache utilities
 */
export const marketCache = {
  getStocksKey: () => 'market:stocks',
  getStockKey: (symbol: string) => `market:stock:${symbol}`,
  getStockPriceKey: (symbol: string) => `market:stock:${symbol}:price`,
};

/**
 * Cache invalidation patterns
 */
export const cachePatterns = {
  user: (userId: string) => `user:${userId}:*`,
  userAccounts: (userId: string) => `user:${userId}:accounts*`,
  userTransactions: (userId: string) => `user:${userId}:transactions*`,
  market: () => 'market:*',
  all: () => '*',
};
