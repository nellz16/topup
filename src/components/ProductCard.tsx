import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp, Zap } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { ParsedGameInfo } from '../types/game';

interface ProductCardProps {
  product: ParsedGameInfo;
  onClick?: () => void; // Optional custom click handler
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const navigate = useNavigate();

  /**
   * Handles product card click with scalable routing
   * Automatically generates proper URLs for any game
   */
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to game detail page using slug
      navigate(`/games/${product.slug}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative rounded-3xl overflow-hidden aspect-[9/16] cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    >
    {/* Background image */}
    <OptimizedImage 
      src={product.image_url} 
      alt={product.name} 
      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" 
      quality={80}
      format="auto"
    />
    
    {/* Gradient overlays */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-transparent to-pink-500/30 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
    
    {/* Popular badge */}
    {product.is_popular && (
      <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg">
        <TrendingUp size={12} />
        <span>Popular</span>
      </div>
    )}
    
    {/* Content */}
    <div className="absolute inset-x-0 bottom-0 p-4">
      <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-bold text-white text-sm leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-1">
            <Star className="text-yellow-400 fill-current" size={12} />
            <span className="text-xs text-gray-300">{product.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-green-400">
            <Zap size={12} />
            <span className="text-xs font-medium">Instan</span>
          </div>
        </div>
      </div>
    </div>
    
    {/* Hover glow effect */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent"></div>
    </div>
    </div>
  );
};