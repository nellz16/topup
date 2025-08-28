/**
 * Cache Manager for ZhivLux Gaming Store
 * Handles Redis caching operations with fallback mechanisms
 */

import { API_CONFIG, getHeaders } from './api';

export interface CacheConfig {
  key: string;
  ttl: number; // Time to live in seconds
  version?: string;
}

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  version: string;
  ttl: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private isRedisAvailable: boolean = false;
  private localCache: Map<string, CacheItem> = new Map();

  private constructor() {
    this.checkRedisAvailability();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Check if Redis/Upstash is available
   */
  private async checkRedisAvailability(): Promise<void> {
    try {
      if (!API_CONFIG.UPSTASH_URL || !API_CONFIG.UPSTASH_TOKEN || 
          API_CONFIG.UPSTASH_URL === 'https://your-redis-url.upstash.io') {
        this.isRedisAvailable = false;
        console.warn('🔧 Redis/Upstash not configured, using local cache fallback');
        return;
      }

      const response = await fetch(`${API_CONFIG.UPSTASH_URL}/ping`, {
        headers: getHeaders('upstash')
      });

      this.isRedisAvailable = response.ok;
      
      if (this.isRedisAvailable) {
        console.log('✅ Redis cache connected successfully');
      } else {
        console.warn('⚠️ Redis connection failed, using local cache fallback');
      }
    } catch (error) {
      this.isRedisAvailable = false;
      console.warn('⚠️ Redis connection error, using local cache fallback:', error);
    }
  }

  /**
   * Set cache item
   */
  async set<T>(config: CacheConfig, data: T): Promise<boolean> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version: config.version || '1.0',
        ttl: config.ttl
      };

      if (this.isRedisAvailable) {
        // Store in Redis
        const response = await fetch(`${API_CONFIG.UPSTASH_URL}/setex/${config.key}/${config.ttl}`, {
          method: 'POST',
          headers: getHeaders('upstash'),
          body: JSON.stringify(cacheItem)
        });

        if (response.ok) {
          // Also store in local cache as backup
          this.localCache.set(config.key, cacheItem);
          return true;
        }
      }

      // Fallback to local cache
      this.localCache.set(config.key, cacheItem);
      
      // Clean up expired local cache items
      this.cleanupLocalCache();
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Get cache item
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.isRedisAvailable) {
        // Try Redis first
        const response = await fetch(`${API_CONFIG.UPSTASH_URL}/get/${key}`, {
          headers: getHeaders('upstash')
        });

        if (response.ok) {
          const result = await response.json();
          if (result.result) {
            const cacheItem: CacheItem<T> = JSON.parse(result.result);
            
            // Check if cache is still valid
            const now = Date.now();
            const age = (now - cacheItem.timestamp) / 1000; // in seconds
            
            if (age < cacheItem.ttl) {
              // Also update local cache
              this.localCache.set(key, cacheItem);
              return cacheItem.data;
            } else {
              // Cache expired, remove it
              this.delete(key);
              return null;
            }
          }
        }
      }

      // Fallback to local cache
      const localItem = this.localCache.get(key);
      if (localItem) {
        const now = Date.now();
        const age = (now - localItem.timestamp) / 1000;
        
        if (age < localItem.ttl) {
          return localItem.data;
        } else {
          // Local cache expired
          this.localCache.delete(key);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete cache item
   */
  async delete(key: string): Promise<boolean> {
    try {
      let success = true;

      if (this.isRedisAvailable) {
        const response = await fetch(`${API_CONFIG.UPSTASH_URL}/del/${key}`, {
          headers: getHeaders('upstash')
        });
        success = response.ok;
      }

      // Also remove from local cache
      this.localCache.delete(key);
      
      return success;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Check if cache exists and is valid
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (this.isRedisAvailable) {
        const response = await fetch(`${API_CONFIG.UPSTASH_URL}/exists/${key}`, {
          headers: getHeaders('upstash')
        });

        if (response.ok) {
          const result = await response.json();
          return result.result === 1;
        }
      }

      // Check local cache
      const localItem = this.localCache.get(key);
      if (localItem) {
        const now = Date.now();
        const age = (now - localItem.timestamp) / 1000;
        return age < localItem.ttl;
      }

      return false;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get multiple cache items
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (this.isRedisAvailable && keys.length > 1) {
        const response = await fetch(`${API_CONFIG.UPSTASH_URL}/mget/${keys.join('/')}`, {
          headers: getHeaders('upstash')
        });

        if (response.ok) {
          const result = await response.json();
          return result.result.map((item: string | null) => {
            if (!item) return null;
            try {
              const cacheItem: CacheItem<T> = JSON.parse(item);
              const now = Date.now();
              const age = (now - cacheItem.timestamp) / 1000;
              return age < cacheItem.ttl ? cacheItem.data : null;
            } catch {
              return null;
            }
          });
        }
      }

      // Fallback: get items individually
      const results = await Promise.all(keys.map(key => this.get<T>(key)));
      return results;
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple cache items
   */
  async mset<T>(items: Array<{ config: CacheConfig; data: T }>): Promise<boolean> {
    try {
      if (this.isRedisAvailable && items.length > 1) {
        const cacheData: string[] = [];
        
        items.forEach(({ config, data }) => {
          const cacheItem: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            version: config.version || '1.0',
            ttl: config.ttl
          };
          
          cacheData.push(config.key, JSON.stringify(cacheItem));
        });

        const response = await fetch(`${API_CONFIG.UPSTASH_URL}/mset`, {
          method: 'POST',
          headers: getHeaders('upstash'),
          body: JSON.stringify(cacheData)
        });

        if (response.ok) {
          // Set TTL for each key
          const ttlPromises = items.map(({ config }) =>
            fetch(`${API_CONFIG.UPSTASH_URL}/expire/${config.key}/${config.ttl}`, {
              headers: getHeaders('upstash')
            })
          );
          
          await Promise.all(ttlPromises);
          return true;
        }
      }

      // Fallback: set items individually
      const results = await Promise.all(
        items.map(({ config, data }) => this.set(config, data))
      );
      
      return results.every(result => result);
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      if (this.isRedisAvailable) {
        // Note: This would require FLUSHDB command which might not be available in Upstash
        // For now, we'll just clear local cache
      }

      this.localCache.clear();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      isRedisAvailable: this.isRedisAvailable,
      localCacheSize: this.localCache.size,
      localCacheKeys: Array.from(this.localCache.keys())
    };
  }

  /**
   * Clean up expired local cache items
   */
  private cleanupLocalCache(): void {
    const now = Date.now();
    
    for (const [key, item] of this.localCache.entries()) {
      const age = (now - item.timestamp) / 1000;
      if (age >= item.ttl) {
        this.localCache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Cache key constants
export const CACHE_KEYS = {
  PRODUCTS: 'zhivlux:products:v1',
  BANNERS: 'zhivlux:banners:v1',
  CATEGORIES: 'zhivlux:categories:v1',
  POPULAR_PRODUCTS: 'zhivlux:popular:v1',
  USER_PROFILE: (userId: string) => `zhivlux:user:${userId}:v1`,
  GAME_VARIANTS: (gameId: string) => `zhivlux:variants:${gameId}:v1`
};

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  PRODUCTS: 600,      // 10 minutes
  BANNERS: 300,       // 5 minutes
  CATEGORIES: 1800,   // 30 minutes
  POPULAR_PRODUCTS: 600, // 10 minutes
  USER_PROFILE: 3600, // 1 hour
  GAME_VARIANTS: 1800 // 30 minutes
};