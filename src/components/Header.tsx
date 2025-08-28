import React from 'react';
import { Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="relative bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-6 overflow-hidden">
    {/* Animated background elements */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-10 right-0 w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-lg animate-bounce"></div>
      <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
    </div>
    
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="text-white" size={24} />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl blur opacity-30 animate-pulse"></div>
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">ZhivLux</h1>
          <p className="text-sm text-purple-200 font-medium">Gaming Store</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
        <span className="text-sm text-green-300 font-semibold">Online</span>
      </div>
    </div>
  </header>
  );
};