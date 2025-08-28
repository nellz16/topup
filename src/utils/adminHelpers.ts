/**
 * Admin Panel Helper Functions
 * Utilities for admin operations and data management
 */

import { API_CONFIG, getHeaders } from './api';

export interface AdminStats {
  totalProducts: number;
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  popularProducts: number;
}

export interface ProductFormData {
  name: string;
  imageUrl: string;
  category: string;
  isPopular: boolean;
  description: string;
  variants: string;
}

/**
 * Validate product form data
 */
export const validateProductForm = (data: ProductFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.name.trim()) {
    errors.push('Nama produk wajib diisi');
  }
  
  if (!data.imageUrl.trim()) {
    errors.push('URL gambar wajib diisi');
  } else if (!isValidUrl(data.imageUrl)) {
    errors.push('URL gambar tidak valid');
  }
  
  if (!data.category.trim()) {
    errors.push('Kategori wajib dipilih');
  }
  
  if (!data.variants.trim()) {
    errors.push('Variants wajib diisi');
  } else {
    try {
      const parsed = JSON.parse(data.variants);
      if (!Array.isArray(parsed)) {
        errors.push('Variants harus berupa array JSON');
      } else {
        // Validate each variant
        parsed.forEach((variant, index) => {
          if (!variant.name || typeof variant.name !== 'string') {
            errors.push(`Variant ${index + 1}: name wajib diisi`);
          }
          if (!variant.price || typeof variant.price !== 'number') {
            errors.push(`Variant ${index + 1}: price harus berupa angka`);
          }
        });
      }
    } catch (e) {
      errors.push('Format JSON variants tidak valid');
    }
  }
  
  return errors;
};

/**
 * Check if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Format variants for display in admin table
 */
export const formatVariantsForDisplay = (variants: string): string => {
  try {
    const parsed = JSON.parse(variants);
    if (Array.isArray(parsed)) {
      return `${parsed.length} variants`;
    }
    return 'Invalid format';
  } catch {
    return 'Parse error';
  }
};

/**
 * Get admin statistics
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    if (!API_CONFIG.XATA_API_KEY || API_CONFIG.XATA_API_KEY === 'your_xata_api_key_here') {
      // Mock stats for demo
      return {
        totalProducts: 6,
        totalUsers: 150,
        totalTransactions: 45,
        totalRevenue: 2500000,
        popularProducts: 3
      };
    }

    const [productsRes, usersRes, transactionsRes] = await Promise.all([
      fetch(`${API_CONFIG.XATA_DB_URL}/tables/products/aggregate`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify({
          aggs: {
            total: { count: '*' },
            popular: { count: '*', filter: { isPopular: true } }
          }
        })
      }),
      fetch(`${API_CONFIG.XATA_DB_URL}/tables/users/aggregate`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify({
          aggs: { total: { count: '*' } }
        })
      }),
      fetch(`${API_CONFIG.XATA_DB_URL}/tables/transactions/aggregate`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify({
          aggs: {
            total: { count: '*' },
            revenue: { sum: 'amount', filter: { status: 'Success' } }
          }
        })
      })
    ]);

    const [productsData, usersData, transactionsData] = await Promise.all([
      productsRes.json(),
      usersRes.json(),
      transactionsRes.json()
    ]);

    return {
      totalProducts: productsData.aggs.total || 0,
      totalUsers: usersData.aggs.total || 0,
      totalTransactions: transactionsData.aggs.total || 0,
      totalRevenue: transactionsData.aggs.revenue || 0,
      popularProducts: productsData.aggs.popular || 0
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalProducts: 0,
      totalUsers: 0,
      totalTransactions: 0,
      totalRevenue: 0,
      popularProducts: 0
    };
  }
};

/**
 * Export products data for backup
 */
export const exportProductsData = async (): Promise<string> => {
  try {
    if (!API_CONFIG.XATA_API_KEY || API_CONFIG.XATA_API_KEY === 'your_xata_api_key_here') {
      return JSON.stringify([], null, 2);
    }

    const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/products/query`, {
      method: 'POST',
      headers: getHeaders('xata'),
      body: JSON.stringify({ page: { size: 1000 } })
    });

    if (!response.ok) throw new Error('Export failed');

    const data = await response.json();
    return JSON.stringify(data.records, null, 2);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

/**
 * Import products data from JSON
 */
export const importProductsData = async (jsonData: string): Promise<void> => {
  try {
    const products = JSON.parse(jsonData);
    
    if (!Array.isArray(products)) {
      throw new Error('Data harus berupa array');
    }

    if (!API_CONFIG.XATA_API_KEY || API_CONFIG.XATA_API_KEY === 'your_xata_api_key_here') {
      console.log('Mock import:', products);
      return;
    }

    // Validate each product
    for (const product of products) {
      const errors = validateProductForm(product);
      if (errors.length > 0) {
        throw new Error(`Invalid product data: ${errors.join(', ')}`);
      }
    }

    // Import products one by one
    for (const product of products) {
      const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/products/data`, {
        method: 'POST',
        headers: getHeaders('xata'),
        body: JSON.stringify(product)
      });

      if (!response.ok) {
        throw new Error(`Failed to import product: ${product.name}`);
      }
    }
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
};

/**
 * Generate sample product data
 */
export const generateSampleProducts = (): ProductFormData[] => {
  return [
    {
      name: 'Mobile Legends',
      imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
      category: 'Game',
      isPopular: true,
      description: 'MOBA 5v5 terpopuler di Indonesia',
      variants: JSON.stringify([
        { name: '86 Diamonds', price: 20000, description: 'Basic diamond package' },
        { name: '172 Diamonds', price: 40000, description: 'Popular choice' },
        { name: '257 Diamonds', price: 60000, description: 'Great value' }
      ])
    },
    {
      name: 'Free Fire',
      imageUrl: 'https://images.pexels.com/photos/1293261/pexels-photo-1293261.jpeg',
      category: 'Game',
      isPopular: true,
      description: 'Battle royale game dengan gameplay cepat',
      variants: JSON.stringify([
        { name: '100 Diamonds', price: 15000, description: 'Starter pack' },
        { name: '210 Diamonds', price: 30000, description: 'Popular choice' },
        { name: '355 Diamonds', price: 50000, description: 'Great deal' }
      ])
    }
  ];
};

/**
 * Validate admin credentials
 */
export const validateAdminCredentials = (username: string, password: string): boolean => {
  return username === 'admin' && password === 'zhivlux2025';
};

/**
 * Log admin activity
 */
export const logAdminActivity = (action: string, details: any = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details,
    userAgent: navigator.userAgent
  };
  
  console.log('Admin Activity:', logEntry);
  
  // In production, send to logging service
  // await sendToLoggingService(logEntry);
};