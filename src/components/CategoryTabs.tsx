import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { Star, Grid3X3 } from 'lucide-react';
import { ParsedGameInfo } from '../types/game';

interface CategoryTabsProps {
  products: ParsedGameInfo[];
  onViewAllClick: () => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ products, onViewAllClick }) => {
  const [activeTab, setActiveTab] = useState('Game');
  const categories = ['Game', 'Apps', 'Voucher'];
  
  const filteredProducts = products.filter(p => p.category === activeTab);

  return (
    <div className="px-6 space-y-6">
      {/* Category tabs */}
      <div className="relative">
        <div className="flex bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/50">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`relative flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === category
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {activeTab === category && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg"></div>
              )}
              <span className="relative z-10">{category}s</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.slice(0, 5).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
        
        {/* View all card */}
        <div 
          onClick={onViewAllClick}
          className="group cursor-pointer rounded-3xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex flex-col items-center justify-center aspect-[9/16] text-center p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-slate-600/50"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <Grid3X3 className="text-purple-400 group-hover:text-pink-400 transition-colors" size={28} />
          </div>
          <span className="text-white font-bold text-sm">Lihat Semua</span>
          <span className="text-gray-400 text-xs mt-1">{filteredProducts.length}+ produk</span>
        </div>
      </div>
    </div>
  );
};