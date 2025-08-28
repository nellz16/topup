import { useState, useEffect } from 'react';
import { API_CONFIG, getHeaders } from '../utils/api';
import { formatUrlToGameName, parseGameVariants } from '../utils/routing';

interface GameVariant {
  name: string;
  price: number;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  variants?: string;
}

interface UseGameVariantsResult {
  product: Product | null;
  variants: GameVariant[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for fetching game variants by URL slug
 * Provides scalable data fetching with proper error handling
 */
export const useGameVariants = (gameSlug: string): UseGameVariantsResult => {
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<GameVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameVariants = async () => {
      if (!gameSlug) {
        setError('Game slug is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Convert URL slug back to searchable format
        const searchName = formatUrlToGameName(gameSlug);

        // Check if API is configured
        if (!API_CONFIG.XATA_API_KEY || !API_CONFIG.XATA_DB_URL || 
            API_CONFIG.XATA_API_KEY === 'your_xata_api_key_here' ||
            API_CONFIG.XATA_DB_URL === 'https://your-workspace-your-database.xata.sh/db/your-database') {
          
          // Mock data for development/demo
          const mockProducts = [
            { 
              id: '1', 
              name: 'Mobile Legends', 
              imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg', 
              category: 'Game',
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
              variants: JSON.stringify([
                { name: '60 UC', price: 16000, description: 'Basic UC package' },
                { name: '325 UC', price: 80000, description: 'Popular package' },
                { name: '660 UC', price: 160000, description: 'Great value' },
                { name: '1800 UC', price: 400000, description: 'Premium package' }
              ])
            }
          ];

          // Find matching product by name (case-insensitive partial match)
          const matchedProduct = mockProducts.find(p => 
            p.name.toLowerCase().includes(searchName) || 
            searchName.includes(p.name.toLowerCase())
          );

          if (matchedProduct) {
            setProduct(matchedProduct);
            try {
              const parsedVariants = JSON.parse(matchedProduct.variants || '[]');
              setVariants(parsedVariants);
            } catch (parseError) {
              console.error('Error parsing variants:', parseError);
              setVariants([]);
            }
          } else {
            setError('Game not found');
          }
        } else {
          // Real API call
          const response = await fetch(`${API_CONFIG.XATA_DB_URL}/tables/products/query`, {
            method: 'POST',
            headers: getHeaders('xata'),
            body: JSON.stringify({
              filter: {
                $any: [
                  { name: { $iContains: searchName } },
                  { name: { $iContains: gameSlug.replace(/-/g, ' ') } }
                ]
              },
              page: { size: 1 }
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch game data: ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.records && data.records.length > 0) {
            const foundProduct = data.records[0];
            setProduct(foundProduct);
            
            // Parse variants if they exist
            if (foundProduct.variants) {
              try {
                const parsedVariants = parseGameVariants(foundProduct.variants);
                setVariants(Array.isArray(parsedVariants) ? parsedVariants : []);
              } catch (parseError) {
                console.error('Error parsing variants:', parseError);
                setVariants([]);
              }
            } else {
              setVariants([]);
            }
          } else {
            setError('Game not found');
          }
        }
      } catch (err) {
        console.error('Error fetching game variants:', err);
        setError(err instanceof Error ? err.message : 'Failed to load game data');
      } finally {
        setLoading(false);
      }
    };

    fetchGameVariants();
  }, [gameSlug]);

  return { product, variants, loading, error };
};