import React, { useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp, Zap } from 'lucide-react';
import { generateGameUrl } from '../utils/routing';
import { debounceAnimation } from '../utils/animationOptimizer';

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  isPopular?: boolean;
}

interface OptimizedProductCardProps {
  product: Product;
  onClick?: () => void;
}

/**
 * Optimized Product Card dengan animasi yang performant
 * Menggunakan CSS transforms dan hardware acceleration
 */
export const OptimizedProductCard: React.FC<OptimizedProductCardProps> = memo(({ product, onClick }) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);

  // Debounced hover handler untuk mencegah animasi berlebihan
  const debouncedHover = useCallback(
    debounceAnimation((isHovering: boolean) => {
      if (!cardRef.current || isAnimatingRef.current) return;
      
      isAnimatingRef.current = true;
      
      if (isHovering) {
        cardRef.current.style.transform = 'translateY(-4px) scale(1.02)';
      } else {
        cardRef.current.style.transform = 'translateY(0) scale(1)';
      }
      
      // Reset animation flag after transition
      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 200);
    }, 50),
    []
  );

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      try {
        const gameUrl = generateGameUrl(product.name);
        navigate(gameUrl);
      } catch (error) {
        console.error('Error generating game URL:', error);
        if (onClick) onClick();
      }
    }
  }, [onClick, product.name, navigate]);

  const handleMouseEnter = useCallback(() => {
    debouncedHover(true);
  }, [debouncedHover]);

  const handleMouseLeave = useCallback(() => {
    debouncedHover(false);
  }, [debouncedHover]);

  return (
    <div 
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-3xl overflow-hidden aspect-[9/16] cursor-pointer will-change-transform"
      style={{
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)' // Force hardware acceleration
      }}
    >
      {/* Background image dengan lazy loading */}
      <img 
        src={product.imageUrl} 
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        style={{
          transition: 'transform 0.3s ease-out',
          willChange: 'transform'
        }}
      />
      
      {/* Static gradient overlays - tidak perlu animasi */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      
      {/* Popular badge - static positioning */}
      {product.isPopular && (
        <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg">
          <TrendingUp size={12} />
          <span>Popular</span>
        </div>
      )}
      
      {/* Content - optimized positioning */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="transform-gpu">
          <h3 className="font-bold text-white text-sm leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="text-yellow-400 fill-current" size={12} />
              <span className="text-xs text-gray-300">4.8</span>
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <Zap size={12} />
              <span className="text-xs font-medium">Instan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';