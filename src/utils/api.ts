// API Configuration and utilities
export const API_CONFIG = {
  XATA_API_KEY: import.meta.env.VITE_XATA_API_KEY || 'your_xata_api_key_here',
  XATA_DB_URL: import.meta.env.VITE_XATA_DB_URL || 'https://your-workspace-your-database.xata.sh/db/your-database',
  UPSTASH_URL: import.meta.env.VITE_UPSTASH_URL || 'https://your-redis-url.upstash.io',
  UPSTASH_TOKEN: import.meta.env.VITE_UPSTASH_TOKEN || 'your-upstash-token',
};

export const getHeaders = (type: 'xata' | 'upstash') => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (type === 'xata') {
    headers['Authorization'] = `Bearer ${API_CONFIG.XATA_API_KEY}`;
  } else if (type === 'upstash') {
    headers['Authorization'] = `Bearer ${API_CONFIG.UPSTASH_TOKEN}`;
  }

  return headers;
};

// Xata specific utilities
export const createXataRecord = async (table: string, data: any) => {
  try {
    const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/${table}/data`, {
      method: 'POST',
      headers: getHeaders('xata'),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create record in ${table}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error creating record in ${table}:`, error);
    throw error;
  }
};

export const queryXataTable = async (table: string, filter: any = {}, options: any = {}) => {
  try {
    const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/${table}/query`, {
      method: 'POST',
      headers: getHeaders('xata'),
      body: JSON.stringify({
        filter,
        ...options
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to query ${table}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error querying ${table}:`, error);
    throw error;
  }
};

export const formatCurrency = (amount: number): string => 
  new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(amount);