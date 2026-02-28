// Système de cache pour les APIs
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum cache size
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private defaultTTL = 30000; // 30 seconds
  private maxSize = 100;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanup(): void {
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    // Remove oldest entries if cache is too large
    if (this.cache.size > this.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, entries.length - this.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  async get<T>(url: string, options?: RequestInit & { ttl?: number }): Promise<T> {
    const key = this.generateKey(url, options);
    const ttl = options?.ttl || this.defaultTTL;

    // Check cache first
    const cached = this.cache.get(key);
    if (cached && !this.isExpired(cached)) {
      console.log(`📋 Cache hit for ${url}`);
      return cached.data;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      console.log(`⏳ Request already pending for ${url}`);
      return this.pendingRequests.get(key)!;
    }

    // Make new request
    const requestPromise = this.makeRequest<T>(url, options, key, ttl);
    this.pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  private async makeRequest<T>(
    url: string, 
    options?: RequestInit, 
    key?: string, 
    ttl?: number
  ): Promise<T> {
    try {
      console.log(`🔄 Making request to ${url}`);
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the result
      if (key && ttl) {
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl
        });
        this.cleanup();
      }

      return data;
    } catch (error) {
      console.error(`❌ Request failed for ${url}:`, error);
      throw error;
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
    this.cleanup();
  }

  getSync<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && !this.isExpired(entry)) {
      return entry.data;
    }
    return null;
  }

  invalidate(pattern?: string): void {
    if (pattern) {
      // Remove entries matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
    console.log(`🗑️ Cache invalidated${pattern ? ` for pattern: ${pattern}` : ''}`);
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // TODO: Implement hit rate tracking
    };
  }
}

// Instance globale du cache
export const apiCache = new ApiCache({
  ttl: 30000, // 30 seconds
  maxSize: 100
});

// Fonctions utilitaires pour les APIs courantes
export const cachedFetch = {
  get: <T>(url: string, options?: RequestInit & { ttl?: number }) => 
    apiCache.get<T>(url, { ...options, method: 'GET' }),
  
  post: <T>(url: string, body?: any, options?: RequestInit & { ttl?: number }) => 
    apiCache.get<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
  
  put: <T>(url: string, body?: any, options?: RequestInit & { ttl?: number }) => 
    apiCache.get<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  
  delete: <T>(url: string, options?: RequestInit & { ttl?: number }) => 
    apiCache.get<T>(url, { ...options, method: 'DELETE' })
};

// Hooks pour React
export const useApiCache = () => {
  return {
    invalidate: apiCache.invalidate.bind(apiCache),
    getStats: apiCache.getStats.bind(apiCache),
    clear: () => apiCache.invalidate()
  };
};
