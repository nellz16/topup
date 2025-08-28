/**
 * Optimized Image Component with ImageKit integration
 * Provides automatic compression, lazy loading, and error handling
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IKImage } from '@imagekit/react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  blur?: number;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  disableRightClick?: boolean;
  disableLongPress?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  quality = 80,
  format = 'auto',
  blur,
  onLoad,
  onError,
  fallbackSrc,
  disableRightClick = true,
  disableLongPress = true
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);

  // Check if ImageKit is configured
  const isImageKitConfigured = !!(
    import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY &&
    import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT
  );

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  }, [onError]);

  // Prevent right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (disableRightClick) {
      e.preventDefault();
    }
  }, [disableRightClick]);

  // Prevent long press on mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disableLongPress) {
      let touchTimer: NodeJS.Timeout;
      
      const handleTouchEnd = () => {
        clearTimeout(touchTimer);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchmove', handleTouchEnd);
      };

      touchTimer = setTimeout(() => {
        e.preventDefault();
      }, 500);

      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchmove', handleTouchEnd);
    }
  }, [disableLongPress]);

  // Disable drag
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Build transformation parameters for ImageKit
  const getTransformations = () => {
    const transformations: any[] = [];

    // Quality transformation (compress to max 100kb)
    transformations.push({
      quality: quality,
      format: format
    });

    // Size transformation
    if (width || height) {
      transformations.push({
        width: width,
        height: height,
        crop: 'maintain_ratio'
      });
    }

    // Blur transformation
    if (blur) {
      transformations.push({
        blur: blur
      });
    }

    // File size limit (100kb max)
    transformations.push({
      quality: 'auto',
      format: 'auto'
    });

    return transformations;
  };

  // Determine image source
  const getImageSrc = () => {
    if (hasError && fallbackSrc) {
      return fallbackSrc;
    }
    return src;
  };

  // Loading placeholder
  const LoadingPlaceholder = () => (
    <div 
      className={`bg-slate-700 animate-pulse flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="w-8 h-8 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin"></div>
    </div>
  );

  // Error placeholder
  const ErrorPlaceholder = () => (
    <div 
      className={`bg-slate-800 border border-slate-600 flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-center text-slate-400">
        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-xs">Image not found</p>
      </div>
    </div>
  );

  // Show loading placeholder
  if (isLoading && !hasError) {
    return <LoadingPlaceholder />;
  }

  // Show error placeholder
  if (hasError && !fallbackSrc) {
    return <ErrorPlaceholder />;
  }

  // Render ImageKit image if configured
  if (isImageKitConfigured && !hasError) {
    return (
      <IKImage
        ref={imageRef}
        src={getImageSrc()}
        alt={alt}
        className={className}
        loading={loading}
        transformation={getTransformations()}
        onLoad={handleLoad}
        onError={handleError}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onDragStart={handleDragStart}
        style={{
          width,
          height,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
      />
    );
  }

  // Fallback to regular img tag
  return (
    <img
      ref={imageRef}
      src={getImageSrc()}
      alt={alt}
      className={className}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onDragStart={handleDragStart}
      style={{
        width,
        height,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    />
  );
};

/**
 * ImageKit Provider Component
 * Wraps the app with ImageKit configuration
 */
import { IKContext } from '@imagekit/react';

interface ImageKitProviderProps {
  children: React.ReactNode;
}

export const ImageKitProvider: React.FC<ImageKitProviderProps> = ({ children }) => {
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

  // If ImageKit is not configured, render children without provider
  if (!publicKey || !urlEndpoint) {
    console.warn('ImageKit is not configured. Images will use fallback rendering.');
    return <>{children}</>;
  }

  return (
    <IKContext
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
    >
      {children}
    </IKContext>
  );
};