import React from 'react';
import { ProductCard } from './ProductCard';
import { ParsedGameInfo } from '../types/game';

interface ProductSectionProps {
  title: string;
  products: ParsedGameInfo[];
}

export const ProductSection: React.FC<ProductSectionProps> = ({ title, products }) => (
  <div className="px-6 space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
        {title}
      </h2>
      <button className="text-sm text-purple-400 hover:text-purple-300 font-semibold">
        Lihat Semua
      </button>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
);