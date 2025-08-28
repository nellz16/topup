import React, { useState } from 'react';
import { formatCurrency } from '../utils/api';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { ParsedGameInfo } from '../types/game';

interface PriceListPageProps {
  allProducts: ParsedGameInfo[];
  onBuyClick: (product: ParsedGameInfo) => void;
}

export const PriceListPage: React.FC<PriceListPageProps> = ({ allProducts, onBuyClick }) => {
  const productsWithVariants = allProducts.filter(p => p.variants);
  const [selectedProductId, setSelectedProductId] = useState<string>(productsWithVariants[0]?.id || '');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  
  const selectedProduct = productsWithVariants.find(p => p.id === selectedProductId);
  let variants: Array<{ name: string; price: number }> = [];
  let isRoblox = false;
  let robloxMethods: any[] = [];
  
  if (selectedProduct && selectedProduct.variants) {
    try {
      const parsedVariants = JSON.parse(selectedProduct.variants);
      
      // Check if this is Roblox with dual methods
      if (Array.isArray(parsedVariants) && parsedVariants[0]?.method) {
        isRoblox = true;
        robloxMethods = parsedVariants;
        
        // If no method selected, default to first method
        if (!selectedMethod && robloxMethods.length > 0) {
          setSelectedMethod(robloxMethods[0].method);
        }
        
        // Get variants from selected method
        const selectedMethodData = robloxMethods.find(m => m.method === selectedMethod);
        variants = selectedMethodData?.packages || [];
      } else {
        // Regular game variants
        variants = Array.isArray(parsedVariants) ? parsedVariants : [];
      }
    } catch (e) {
      console.error("Failed to parse variants:", e);
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
          Daftar Harga
        </h1>
        <p className="text-gray-400">Harga transparan, tidak ada biaya tersembunyi</p>
      </div>

      {/* Product selector */}
      <div className="relative">
        <select
          value={selectedProductId}
          onChange={(e) => {
            setSelectedProductId(e.target.value);
            setSelectedMethod(''); // Reset method when product changes
          }}
          className="w-full bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer"
        >
          {productsWithVariants.map(p => (
            <option key={p.id} value={p.id} className="bg-slate-800">
              {p.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Roblox Method Selector */}
      {isRoblox && robloxMethods.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm"></div>
          
          <div className="relative p-6">
            <h3 className="text-xl font-bold text-white mb-4">Pilih Metode Top Up</h3>
            
            <div className="grid gap-3">
              {robloxMethods.map((method, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedMethod(method.method)}
                  className={`relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 ${
                    selectedMethod === method.method
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700/50 hover:border-blue-500/50 bg-slate-800/30'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white">{method.name}</h4>
                        <p className="text-sm text-gray-400">{method.description}</p>
                      </div>
                      {selectedMethod === method.method && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Price table */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm"></div>
        
        <div className="relative">
          {/* Table header */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-6 py-4 border-b border-slate-700/50">
            <div className="grid grid-cols-3 gap-4 font-bold text-white">
              <div>{isRoblox ? 'Paket Robux' : 'Paket'}</div>
              <div className="text-center">Harga</div>
              <div className="text-right">Action</div>
            </div>
          </div>

          {/* Table body */}
          <div className="divide-y divide-slate-700/50">
            {variants.map((variant, index) => (
              <div key={index} className="px-6 py-5 hover:bg-slate-700/20 transition-colors group">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                      <Star className="text-purple-400" size={16} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{variant.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Zap className="text-green-400" size={12} />
                        <span className="text-xs text-green-400">
                          {isRoblox ? (selectedMethod === 'gamepass' ? 'Lebih Aman' : 'Lebih Murah') : 'Proses Instan'}
                        </span>
                      </div>
                      {variant.description && (
                        <p className="text-xs text-gray-400 mt-1">{variant.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                      {formatCurrency(variant.price)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <button
                      onClick={() => onBuyClick(selectedProduct!)}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <ShoppingCart size={16} />
                      Beli
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {variants.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-gray-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {isRoblox ? 'Pilih metode terlebih dahulu' : 'Tidak ada varian'}
          </h3>
          <p className="text-gray-400">
            {isRoblox ? 'Silakan pilih metode top up di atas' : 'Produk ini belum memiliki varian harga'}
          </p>
        </div>
      )}
    </div>
  );
};