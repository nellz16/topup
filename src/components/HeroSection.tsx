import React from 'react';
import { Gamepad2, Zap, Crown, Star } from 'lucide-react';

export const HeroSection: React.FC = () => (
  <div className="relative px-6 py-12 overflow-hidden">
    {/* Animated background */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 rounded-3xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-20 animate-bounce"></div>
    </div>
    
    <div className="relative z-10 text-center space-y-6">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
        <Crown className="text-yellow-400" size={16} />
        <span className="text-sm font-semibold text-purple-200">Premium Gaming Store</span>
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
          Top Up Game
        </h1>
        <h2 className="text-2xl md:text-4xl font-bold text-white">
          Cepat & <span className="text-green-400">Terpercaya</span>
        </h2>
        <p className="text-lg text-gray-300 max-w-md mx-auto leading-relaxed">
          Harga hemat, proses instan, support 24 jam. 
          <span className="text-purple-400 font-semibold"> Ribuan game tersedia!</span>
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center gap-2">
            <Gamepad2 size={20} />
            <span>Top Up Sekarang</span>
          </div>
        </button>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Zap className="text-yellow-400" size={16} />
            <span className="text-gray-300">Proses Instan</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="text-green-400" size={16} />
            <span className="text-gray-300">Rating 4.9</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);