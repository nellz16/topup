import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, getHeaders } from '../utils/api';

interface PreloadedData {
  products: any[];
  banners: any[];
  categories: string[];
  popularProducts: any[];
}

interface UseDataPreloaderResult {
  isLoading: boolean;
  progress: number;
  error: string | null;
  data: PreloadedData | null;
  retryLoading: () => void;
  timeoutReason: string | null;
}

const CACHE_KEYS = {
  PRODUCTS: 'zhivlux:products',
  BANNERS: 'zhivlux:banners',
  CATEGORIES: 'zhivlux:categories',
  POPULAR_PRODUCTS: 'zhivlux:popular_products',
  CACHE_TIMESTAMP: 'zhivlux:cache_timestamp'
};

const CACHE_TTL = {
  PRODUCTS: 600, // 10 minutes
  BANNERS: 300,  // 5 minutes
  CATEGORIES: 1800, // 30 minutes
  POPULAR_PRODUCTS: 600 // 10 minutes
};

export const useDataPreloader = (): UseDataPreloaderResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PreloadedData | null>(null);
  const [timeoutReason, setTimeoutReason] = useState<string | null>(null);

  const updateProgress = useCallback((newProgress: number) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
  }, []);

  // Check if cache is valid
  const isCacheValid = useCallback(async (): Promise<boolean> => {
    try {
      if (!API_CONFIG.UPSTASH_URL || !API_CONFIG.UPSTASH_TOKEN || 
          API_CONFIG.UPSTASH_URL === 'https://your-redis-url.upstash.io') {
        return false;
      }

      const response = await fetch(`${API_CONFIG.UPSTASH_URL}/get/${CACHE_KEYS.CACHE_TIMESTAMP}`, {
        headers: getHeaders('upstash')
      });

      if (!response.ok) return false;

      const result = await response.json();
      if (!result.result) return false;

      const cacheTime = parseInt(result.result);
      const now = Date.now();
      const timeDiff = (now - cacheTime) / 1000; // in seconds

      // Cache is valid if less than 5 minutes old
      return timeDiff < 300;
    } catch (error) {
      console.warn('Cache validation failed:', error);
      return false;
    }
  }, []);

  // Load data from cache
  const loadFromCache = useCallback(async (): Promise<PreloadedData | null> => {
    try {
      if (!API_CONFIG.UPSTASH_URL || !API_CONFIG.UPSTASH_TOKEN) {
        return null;
      }

      const cacheKeys = Object.values(CACHE_KEYS).filter(key => key !== CACHE_KEYS.CACHE_TIMESTAMP);
      const response = await fetch(`${API_CONFIG.UPSTASH_URL}/mget/${cacheKeys.join('/')}`, {
        headers: getHeaders('upstash')
      });

      if (!response.ok) throw new Error('Cache fetch failed');

      const result = await response.json();
      const [products, banners, categories, popularProducts] = result.result;

      if (!products || !banners) return null;

      return {
        products: JSON.parse(products),
        banners: JSON.parse(banners),
        categories: categories ? JSON.parse(categories) : [],
        popularProducts: popularProducts ? JSON.parse(popularProducts) : []
      };
    } catch (error) {
      console.warn('Failed to load from cache:', error);
      return null;
    }
  }, []);

  // Save data to cache
  const saveToCache = useCallback(async (preloadedData: PreloadedData): Promise<void> => {
    try {
      if (!API_CONFIG.UPSTASH_URL || !API_CONFIG.UPSTASH_TOKEN) {
        return;
      }

      const cacheData = [
        CACHE_KEYS.PRODUCTS, JSON.stringify(preloadedData.products),
        CACHE_KEYS.BANNERS, JSON.stringify(preloadedData.banners),
        CACHE_KEYS.CATEGORIES, JSON.stringify(preloadedData.categories),
        CACHE_KEYS.POPULAR_PRODUCTS, JSON.stringify(preloadedData.popularProducts),
        CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString()
      ];

      await fetch(`${API_CONFIG.UPSTASH_URL}/mset`, {
        method: 'POST',
        headers: getHeaders('upstash'),
        body: JSON.stringify(cacheData)
      });

      // Set TTL for each key
      const ttlPromises = [
        fetch(`${API_CONFIG.UPSTASH_URL}/expire/${CACHE_KEYS.PRODUCTS}/${CACHE_TTL.PRODUCTS}`, { headers: getHeaders('upstash') }),
        fetch(`${API_CONFIG.UPSTASH_URL}/expire/${CACHE_KEYS.BANNERS}/${CACHE_TTL.BANNERS}`, { headers: getHeaders('upstash') }),
        fetch(`${API_CONFIG.UPSTASH_URL}/expire/${CACHE_KEYS.CATEGORIES}/${CACHE_TTL.CATEGORIES}`, { headers: getHeaders('upstash') }),
        fetch(`${API_CONFIG.UPSTASH_URL}/expire/${CACHE_KEYS.POPULAR_PRODUCTS}/${CACHE_TTL.POPULAR_PRODUCTS}`, { headers: getHeaders('upstash') })
      ];

      await Promise.all(ttlPromises);
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }, []);

  // Load data from database
  const loadFromDatabase = useCallback(async (): Promise<PreloadedData> => {
    const isApiConfigured = API_CONFIG.XATA_API_KEY && 
                           API_CONFIG.XATA_DB_URL && 
                           API_CONFIG.XATA_API_KEY !== 'your_xata_api_key_here' &&
                           !API_CONFIG.XATA_DB_URL.includes('your-workspace');

    if (!isApiConfigured) {
      // Mock data for demo
      const mockData: PreloadedData = {
        products: [
          { 
            id: '1', 
            name: 'Mobile Legends', 
            imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg', 
            category: 'Game', 
            isPopular: true,
            variants: JSON.stringify([
              { name: '86 Diamonds', price: 20000, description: 'Basic diamond package' },
              { name: '172 Diamonds', price: 40000, description: 'Popular choice' },
              { name: '257 Diamonds', price: 60000, description: 'Great value' },
              { name: '344 Diamonds', price: 80000, description: 'Best seller' },
              { name: '429 Diamonds', price: 100000, description: 'Premium package' }
            ])
          },
          { 
            id: '2', 
            name: 'Free Fire', 
            imageUrl: 'https://images.pexels.com/photos/1293261/pexels-photo-1293261.jpeg', 
            category: 'Game', 
            isPopular: true,
            variants: JSON.stringify([
              { name: '100 Diamonds', price: 15000, description: 'Starter pack' },
              { name: '210 Diamonds', price: 30000, description: 'Popular choice' },
              { name: '355 Diamonds', price: 50000, description: 'Great deal' },
              { name: '720 Diamonds', price: 100000, description: 'Best value' }
            ])
          },
          { 
            id: '3', 
            name: 'PUBG Mobile', 
            imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg', 
            category: 'Game',
            isPopular: false,
            variants: JSON.stringify([
              { name: '60 UC', price: 16000, description: 'Basic UC package' },
              { name: '325 UC', price: 80000, description: 'Popular package' },
              { name: '660 UC', price: 160000, description: 'Great value' },
              { name: '1800 UC', price: 400000, description: 'Premium package' }
            ])
          },
          { 
            id: '4', 
            name: 'Genshin Impact', 
            imageUrl: 'https://images.pexels.com/photos/1293261/pexels-photo-1293261.jpeg', 
            category: 'Game',
            isPopular: false,
            variants: JSON.stringify([
              { name: '60 Genesis Crystals', price: 16000, description: 'Basic crystal package' },
              { name: '300 Genesis Crystals', price: 79000, description: 'Popular package' },
              { name: '980 Genesis Crystals', price: 249000, description: 'Great value' },
              { name: '1980 Genesis Crystals', price: 479000, description: 'Premium package' }
            ])
          },
          { 
            id: '5', 
            name: 'Valorant', 
            imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg', 
            category: 'Game',
            isPopular: false,
            variants: JSON.stringify([
              { name: '475 VP', price: 50000, description: 'Basic VP package' },
              { name: '1000 VP', price: 100000, description: 'Popular package' },
              { name: '2050 VP', price: 200000, description: 'Great value' },
              { name: '3650 VP', price: 350000, description: 'Premium package' }
            ])
          },
          { 
            id: '6', 
            name: 'Steam Wallet', 
            imageUrl: 'https://images.pexels.com/photos/1293261/pexels-photo-1293261.jpeg', 
            category: 'Voucher',
            isPopular: true,
            variants: JSON.stringify([
              { name: 'IDR 20,000', price: 22000, description: 'Basic wallet' },
              { name: 'IDR 45,000', price: 47000, description: 'Popular choice' },
              { name: 'IDR 90,000', price: 92000, description: 'Great value' },
              { name: 'IDR 250,000', price: 252000, description: 'Premium wallet' }
            ])
          },
          { 
            id: '7', 
            name: 'Roblox', 
            imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg', 
            category: 'Game',
            isPopular: true,
            variants: JSON.stringify([
              {
                method: 'gamepass',
                name: 'Via Gamepass',
                description: 'Top up melalui gamepass Roblox (lebih aman)',
                packages: [
                  { name: '80 Robux', price: 15000, description: 'Paket starter' },
                  { name: '400 Robux', price: 70000, description: 'Paket populer' },
                  { name: '800 Robux', price: 135000, description: 'Paket hemat' },
                  { name: '1700 Robux', price: 270000, description: 'Paket value' },
                  { name: '4500 Robux', price: 675000, description: 'Paket premium' },
                  { name: '10000 Robux', price: 1350000, description: 'Paket ultimate' }
                ]
              },
              {
                method: 'login',
                name: 'Via Login',
                description: 'Top up langsung ke akun (proses lebih cepat)',
                packages: [
                  { name: '80 Robux', price: 12000, description: 'Paket starter - harga lebih murah' },
                  { name: '400 Robux', price: 58000, description: 'Paket populer - harga lebih murah' },
                  { name: '800 Robux', price: 115000, description: 'Paket hemat - harga lebih murah' },
                  { name: '1700 Robux', price: 230000, description: 'Paket value - harga lebih murah' },
                  { name: '4500 Robux', price: 575000, description: 'Paket premium - harga lebih murah' },
                  { name: '10000 Robux', price: 1150000, description: 'Paket ultimate - harga lebih murah' }
                ]
              }
            ])
          }
        ],
        banners: [
          { id: '1', imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg', isActive: true },
          { id: '2', imageUrl: 'https://images.pexels.com/photos/1293261/pexels-photo-1293261.jpeg', isActive: true }
        ],
        categories: ['Game', 'Apps', 'Voucher'],
        popularProducts: []
      };
      
      mockData.popularProducts = mockData.products.filter(p => p.isPopular);
      return mockData;
    }

    // Real database queries
    const [productsResponse, bannersResponse] = await Promise.all([
      fetch(`${API_CONFIG.XATA_DB_URL}/tables/products/query`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify({ page: { size: 100 } })
      }),
      fetch(`${API_CONFIG.XATA_DB_URL}/tables/banners/query`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify({ filter: { isActive: true } })
      })
    ]);

    if (!productsResponse.ok) throw new Error(`Products fetch failed: ${productsResponse.statusText}`);
    if (!bannersResponse.ok) throw new Error(`Banners fetch failed: ${bannersResponse.statusText}`);

    const productsResult = await productsResponse.json();
    const bannersResult = await bannersResponse.json();

    const products = productsResult.records;
    const banners = bannersResult.records;
    const categories = [...new Set(products.map((p: any) => p.category))];
    const popularProducts = products.filter((p: any) => p.isPopular);

    return {
      products,
      banners,
      categories,
      popularProducts
    };
  }, []);

  const preloadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      updateProgress(0);
      setTimeoutReason(null);
      updateProgress(10);
      
      const cacheValid = await isCacheValid();
      
      if (cacheValid) {
        updateProgress(20);
        
        const cachedData = await loadFromCache();
        if (cachedData) {
          setData(cachedData);
          updateProgress(100);
          
          setTimeout(() => setIsLoading(false), 500);
          return;
        }
      }

      updateProgress(15);

      updateProgress(25);

      const preloadedData = await loadFromDatabase();
      
      updateProgress(50);
      
      updateProgress(60);
      
      updateProgress(70);
      
      updateProgress(75);
      
      updateProgress(80);
      
      updateProgress(85);
      
      updateProgress(90);

      await saveToCache(preloadedData);
      updateProgress(95);

      setData(preloadedData);
      updateProgress(100);

      setTimeout(() => setIsLoading(false), 800);

    } catch (err) {
      console.error('Data preloading failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      
      // Fallback to mock data
      const mockData: PreloadedData = {
        products: [
          { 
            id: '1', 
            name: 'Mobile Legends', 
            imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg', 
            category: 'Game', 
            isPopular: true,
            variants: JSON.stringify([
              { name: '86 Diamonds', price: 20000 },
              { name: '172 Diamonds', price: 40000 }
            ])
          },
          { 
            id: '2', 
            name: 'Free Fire', 
            imageUrl: 'https://images.pexels.com/photos/1293261/pexels-photo-1293261.jpeg', 
            category: 'Game', 
            isPopular: true,
            variants: JSON.stringify([
              { name: '100 Diamonds', price: 15000 },
              { name: '210 Diamonds', price: 30000 }
            ])
          }
        ],
        banners: [
          { id: '1', imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg', isActive: true }
        ],
        categories: ['Game'],
        popularProducts: []
      };
      
      setData(mockData);
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [updateProgress, isCacheValid, loadFromCache, loadFromDatabase, saveToCache]);

  const retryLoading = useCallback(() => {
    setProgress(0);
    setError(null);
    setTimeoutReason(null);
    preloadData();
  }, [preloadData]);

  useEffect(() => {
    preloadData();
  }, [preloadData]);

  // Timeout mechanism - force complete after 10 seconds
  useEffect(() => {
    if (!isLoading) return;

    const timeoutId = setTimeout(() => {
      if (isLoading && progress < 100) {
        // Determine timeout reason based on progress
        let reason = '';
        if (progress < 20) {
          reason = 'Koneksi ke cache server lambat';
        } else if (progress < 60) {
          reason = 'Database membutuhkan waktu lebih lama untuk merespon';
        } else if (progress < 90) {
          reason = 'Proses caching memakan waktu lebih lama';
        } else {
          reason = 'Finalisasi data membutuhkan waktu ekstra';
        }
        
        setTimeoutReason(reason);
        setProgress(100);
        setTimeout(() => setIsLoading(false), 1000);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading, progress]);

  return {
    isLoading,
    progress,
    error,
    data,
    retryLoading,
    timeoutReason
  };
};