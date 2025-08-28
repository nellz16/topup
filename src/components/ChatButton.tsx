import React from 'react';
import { MessageCircle } from 'lucide-react';

export const ChatButton: React.FC = () => (
  <a
    href="https://wa.me/6288289895705"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-32 right-6 z-50 group"
    aria-label="Chat on WhatsApp"
  >
    <div className="relative">
      {/* Animated rings */}
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-30"></div>
      <div className="absolute inset-2 bg-green-500 rounded-full animate-pulse opacity-50"></div>
      
      {/* Main button */}
      <div className="relative w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
        <MessageCircle className="text-white" size={28} />
      </div>
      
      {/* Tooltip */}
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
        Chat Admin
        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-black/80"></div>
      </div>
    </div>
  </a>
);