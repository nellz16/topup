import React from 'react';
import { Twitter, Youtube, Instagram, Facebook, Send, Zap, Shield, Clock } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="relative mt-16 overflow-hidden">
    {/* Background with gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-blue-900/30 to-transparent rounded-full blur-3xl"></div>
    </div>
    
    <div className="relative px-6 pt-12 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
              <Zap className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-black text-white">ZhivLux</h2>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Platform top up game terpercaya dengan proses instan, harga bersahabat, dan support 24/7. 
            Melayani ribuan game populer dengan sistem keamanan terdepan.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Zap className="text-green-400" size={24} />
            </div>
            <h3 className="font-bold text-white mb-2">Proses Instan</h3>
            <p className="text-sm text-gray-400">Top up langsung masuk dalam hitungan detik</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Shield className="text-blue-400" size={24} />
            </div>
            <h3 className="font-bold text-white mb-2">100% Aman</h3>
            <p className="text-sm text-gray-400">Transaksi terlindungi dengan enkripsi tingkat bank</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Clock className="text-purple-400" size={24} />
            </div>
            <h3 className="font-bold text-white mb-2">Support 24/7</h3>
            <p className="text-sm text-gray-400">Tim customer service siap membantu kapan saja</p>
          </div>
        </div>

        {/* Links and Social */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-white mb-4">Panduan</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-purple-400 transition-colors">Cara Top Up</a>
              <a href="#" className="block text-gray-400 hover:text-purple-400 transition-colors">Metode Pembayaran</a>
              <a href="#" className="block text-gray-400 hover:text-purple-400 transition-colors">FAQ</a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4">Ikuti Kami</h3>
            <div className="flex gap-4">
              {[
                { icon: Twitter, color: 'hover:text-blue-400' },
                { icon: Youtube, color: 'hover:text-red-400' },
                { icon: Instagram, color: 'hover:text-pink-400' },
                { icon: Facebook, color: 'hover:text-blue-500' },
                { icon: Send, color: 'hover:text-cyan-400' },
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className={`w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-gray-400 transition-all hover:scale-110 ${social.color}`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-700/50 text-center">
          <p className="text-sm text-gray-500">
            © 2025 ZhivLux Store. All rights reserved. All trademarks are the property of their respective owners.
          </p>
        </div>
      </div>
    </div>
  </footer>
);