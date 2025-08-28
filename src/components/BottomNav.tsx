import React from 'react';
import { Home, Search, Receipt, Package, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { name: 'Beranda', icon: Home, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Cari', icon: Search, gradient: 'from-purple-500 to-pink-500' },
    { name: 'Harga', icon: Receipt, gradient: 'from-green-500 to-emerald-500' },
    { name: 'Lacak', icon: Package, gradient: 'from-orange-500 to-red-500' },
    { name: 'Masuk', icon: User, gradient: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50">
      <div className="flex justify-around px-2 py-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`relative flex flex-col items-center justify-center w-full py-3 rounded-xl transition-all duration-300 ${
              activeTab === item.name ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {/* Active background */}
            {activeTab === item.name && (
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-10 rounded-xl`}></div>
            )}
            
            {/* Icon container */}
            <div className={`relative p-2 rounded-xl transition-all duration-300 ${
              activeTab === item.name ? `bg-gradient-to-r ${item.gradient}` : ''
            }`}>
              <item.icon size={20} />
            </div>
            
            <span className="text-xs font-medium mt-1">{item.name}</span>
            
            {/* Active indicator */}
            {activeTab === item.name && (
              <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r ${item.gradient} rounded-full`}></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};