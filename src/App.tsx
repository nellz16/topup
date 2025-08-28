import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ImageKitProvider } from './components/OptimizedImage';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BannerCarousel } from './components/BannerCarousel';
import { ProductSection } from './components/ProductSection';
import { CategoryTabs } from './components/CategoryTabs';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { ChatButton } from './components/ChatButton';
import { SearchPage } from './pages/SearchPage';
import { PriceListPage } from './pages/PriceListPage';
import { TrackPage } from './pages/TrackPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { GameDetailPage } from './pages/GameDetailPage';
import { AdminPanel } from './pages/AdminPanel';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGameData, usePopularGames } from './hooks/useGameData';
import './styles/animations.css';

interface User {
  id: string;
  username: string;
  email: string;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-slate-700 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-400 font-medium">Memuat data...</p>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
      <Loader2 className="text-red-400" size={32} />
    </div>
    <h2 className="text-xl font-bold text-white mb-2">Gagal Memuat Data</h2>
    <p className="text-red-400 max-w-md">{message}</p>
    <button 
      onClick={() => window.location.reload()} 
      className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
    >
      Muat Ulang
    </button>
  </div>
);

/**
 * Main App Component with Dynamic Routing
 * Implements scalable routing system for game products
 */
const AppContent: React.FC = () => {
  const [bottomNavTab, setBottomNavTab] = useState('Beranda');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Use real game data from Xata
  const { games, loading, error } = useGameData({ status: 'active' });
  const { popularGames } = usePopularGames(8);

  // Mock banners for now (can be moved to database later)
  const banners = [
    { id: '1', imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg' },
    { id: '2', imageUrl: 'https://images.pexels.com/photos/1293261/pexels-photo-1293261.jpeg' }
  ];

  const handleLoginSuccess = (userData: User) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const renderMainContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;

    switch (bottomNavTab) {
      case 'Beranda':
        return (
          <div className="space-y-12">
            <HeroSection />
            <BannerCarousel images={banners} />
            <ProductSection 
              title="🔥 Produk Populer" 
              products={popularGames.length > 0 ? popularGames : games.slice(0, 8)} 
            />
            <CategoryTabs 
              products={games} 
              onViewAllClick={() => setBottomNavTab('Cari')} 
            />
          </div>
        );
      case 'Cari': 
        return <SearchPage allProducts={games} />;
      case 'Harga': 
        return <PriceListPage allProducts={games} onBuyClick={() => {}} />;
      case 'Lacak': 
        return <TrackPage />;
      case 'Masuk': 
        return currentUser ? (
          <ProfilePage user={currentUser} onLogout={handleLogout} />
        ) : (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        );
      default: 
        return null;
    }
  };

  return (
    <Routes>
      {/* Main app routes */}
      <Route path="/" element={
        <div className="bg-slate-900 min-h-screen font-sans text-white relative overflow-hidden">
          {/* Global background effects */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-900/10 to-pink-900/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-900/10 to-blue-900/10 rounded-full blur-3xl"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <Header />
            
            <main className="pb-20">
              {renderMainContent()}
            </main>

            <Footer />
            <ChatButton />
            <BottomNav activeTab={bottomNavTab} setActiveTab={setBottomNavTab} />
          </div>
        </div>
      } />
      
      {/* Dynamic game detail route */}
      <Route path="/games/:gameName" element={<GameDetailPage />} />
      
      {/* Admin panel route */}
      <Route path="/adminpanel" element={<AdminPanel />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Root App Component with Router Provider
 * Enables dynamic routing throughout the application
 */
export default function App() {
  return (
    <ImageKitProvider>
      <Router>
        <AppContent />
        
        {/* Global styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --animation-speed: 0.3s;
            }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            .animate-fade-in { 
              animation: fadeIn var(--animation-speed) ease-in-out; 
            }
            @keyframes fadeIn { 
              from { opacity: 0; transform: translateY(-10px); } 
              to { opacity: 1; transform: translateY(0); } 
            }
            .line-clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            /* Performance optimizations */
            * {
              backface-visibility: hidden;
            }
            .hardware-accelerated {
              will-change: transform, opacity;
              transform: translateZ(0);
              contain: layout style paint;
            }
          `
        }} />
      </Router>
    </ImageKitProvider>
  );
}