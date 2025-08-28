import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { ProductSection } from '../components/ProductSection';
import { ParsedGameInfo } from '../types/game';

interface SearchPageProps {
  allProducts: ParsedGameInfo[];
}

export const SearchPage: React.FC<SearchPageProps> = ({ allProducts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  
  const categories = ['Semua', 'Game', 'Apps', 'Voucher'];
  
  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedProducts = {
    Game: filteredProducts.filter(p => p.category === 'Game'),
    Apps: filteredProducts.filter(p => p.category === 'Apps'),
    Voucher: filteredProducts.filter(p => p.category === 'Voucher')
  };

  return (
    <div className="p-6 space-y-8">
      {/* Search header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
          Cari Produk
        </h1>
        <p className="text-gray-400">Temukan game, aplikasi, dan voucher favoritmu</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-50"></div>
        <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari game, apps, voucher..."
              className="w-full bg-transparent py-4 pl-14 pr-4 text-white placeholder-gray-400 focus:outline-none"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Filter size={16} />
            {category}
          </button>
        ))}
      </div>

      {/* Results */}
      {searchQuery && (
        <div className="text-center py-4">
          <p className="text-gray-400">
            Menampilkan <span className="text-white font-semibold">{filteredProducts.length}</span> hasil 
            untuk <span className="text-purple-400 font-semibold">"{searchQuery}"</span>
          </p>
        </div>
      )}

      {/* Products by category */}
      <div className="space-y-12">
        {Object.entries(groupedProducts).map(([category, products]) => 
          products.length > 0 && (
            <ProductSection key={category} title={category} products={products} />
          )
        )}
      </div>

      {filteredProducts.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Tidak ada hasil</h3>
          <p className="text-gray-400">Coba gunakan kata kunci lain atau ubah filter kategori</p>
        </div>
      )}
    </div>
  );
};