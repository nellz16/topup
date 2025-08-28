import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface LoadingScreenProps {
  isVisible: boolean;
  onLoadingComplete: () => void;
  progress: number;
  error?: string;
  timeoutReason?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isVisible,
  onLoadingComplete,
  progress,
  error,
  timeoutReason
}) => {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'loading' | 'exit'>('enter');

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('loading');
    } else {
      setAnimationPhase('exit');
      // Delay untuk animasi exit
      const timer = setTimeout(onLoadingComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onLoadingComplete]);

  if (!isVisible && animationPhase === 'exit') {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
      animationPhase === 'exit' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    }`}>
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-6 max-w-sm mx-auto px-6">
        {/* Logo and Brand */}
        <div className="space-y-4">
          <div className="relative mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <Zap className="text-white" size={32} />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-3xl blur opacity-30 animate-pulse"></div>
          </div>
          
          <div>
            <h1 className="text-4xl font-black text-white mb-2">ZhivLux</h1>
            <p className="text-purple-300 font-medium">Gaming Store</p>
          </div>
        </div>

        {/* Loading Content */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Sedang Memuat...</h2>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="absolute -top-6 right-0 text-sm font-bold text-purple-400">
              {Math.round(progress)}%
            </div>
          </div>

          {/* Error or Timeout Message */}
          {(error || timeoutReason) && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="text-yellow-400 text-sm">
                {timeoutReason ? (
                  <>
                    <div className="font-semibold mb-1">Loading memakan waktu lebih lama</div>
                    <div className="text-xs text-yellow-300">{timeoutReason}</div>
                  </>
                ) : (
                  <div className="font-semibold">{error}</div>
                )}
              </div>
            </div>
          )}

          {/* Simple loading indicator */}
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};