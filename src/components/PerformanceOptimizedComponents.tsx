import React, { memo, useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useAdaptiveAnimation } from '../hooks/usePerformanceMonitor';

/**
 * Optimized Loading Spinner dengan adaptive animation
 */
export const OptimizedLoadingSpinner: React.FC<{ size?: number }> = memo(({ size = 32 }) => {
  const { getAnimationConfig } = useAdaptiveAnimation();
  const config = getAnimationConfig();

  const spinnerStyle = useMemo(() => ({
    width: size,
    height: size,
    animationDuration: config.reduceMotion ? '0.1s' : `${config.duration * 3}s`,
    willChange: 'transform',
    contain: 'layout style paint'
  }), [size, config]);

  return (
    <div className="flex items-center justify-center">
      <Loader2 
        className="animate-spin text-purple-500" 
        size={size}
        style={spinnerStyle}
      />
    </div>
  );
});

/**
 * Optimized Button dengan hover effects yang performant
 */
interface OptimizedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}

export const OptimizedButton: React.FC<OptimizedButtonProps> = memo(({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = ''
}) => {
  const { getAnimationConfig } = useAdaptiveAnimation();
  const config = getAnimationConfig();

  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  const buttonStyle = useMemo(() => ({
    transition: config.reduceMotion 
      ? 'none' 
      : `transform ${config.duration}s ${config.easing}, box-shadow ${config.duration}s ${config.easing}`,
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    transform: 'translateZ(0)'
  }), [config]);

  const baseClasses = `
    relative px-6 py-3 rounded-xl font-semibold transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:scale-105 active:scale-95
  `;

  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white focus:ring-purple-500',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500'
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={buttonStyle}
    >
      {children}
    </button>
  );
});

/**
 * Optimized Card dengan lazy loading dan intersection observer
 */
interface OptimizedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const OptimizedCard: React.FC<OptimizedCardProps> = memo(({
  children,
  className = '',
  hover = true
}) => {
  const { getAnimationConfig } = useAdaptiveAnimation();
  const config = getAnimationConfig();

  const cardStyle = useMemo(() => ({
    transition: config.reduceMotion 
      ? 'none' 
      : `transform ${config.duration}s ${config.easing}`,
    willChange: hover ? 'transform' : 'auto',
    backfaceVisibility: 'hidden' as const,
    contain: 'layout style paint'
  }), [config, hover]);

  const baseClasses = `
    relative overflow-hidden rounded-2xl border border-slate-700/50
    bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm
  `;

  const hoverClasses = hover 
    ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer' 
    : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      style={cardStyle}
    >
      {children}
    </div>
  );
});

/**
 * Optimized Fade In Animation Component
 */
interface OptimizedFadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const OptimizedFadeIn: React.FC<OptimizedFadeInProps> = memo(({
  children,
  delay = 0,
  className = ''
}) => {
  const { getAnimationConfig } = useAdaptiveAnimation();
  const config = getAnimationConfig();

  const fadeStyle = useMemo(() => ({
    animation: config.reduceMotion 
      ? 'none' 
      : `fadeInUp ${config.duration}s ${config.easing} ${delay}s both`,
    willChange: 'transform, opacity',
    contain: 'layout style paint'
  }), [config, delay]);

  return (
    <div 
      className={`fade-in-optimized ${className}`}
      style={fadeStyle}
    >
      {children}
    </div>
  );
});

// Set display names for better debugging
OptimizedLoadingSpinner.displayName = 'OptimizedLoadingSpinner';
OptimizedButton.displayName = 'OptimizedButton';
OptimizedCard.displayName = 'OptimizedCard';
OptimizedFadeIn.displayName = 'OptimizedFadeIn';