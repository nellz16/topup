import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isLagging: boolean;
}

/**
 * Hook untuk monitoring performa animasi real-time
 * Membantu mendeteksi lag dan memberikan feedback
 */
export const usePerformanceMonitor = (callback?: (metrics: PerformanceMetrics) => void) => {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const measurePerformance = (currentTime: number) => {
      frameCountRef.current++;
      const deltaTime = currentTime - lastTimeRef.current;

      // Calculate FPS every second
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
        const frameTime = deltaTime / frameCountRef.current;
        const isLagging = fps < 30; // Consider lagging if below 30 FPS

        fpsRef.current = fps;

        if (callback) {
          callback({ fps, frameTime, isLagging });
        }

        // Log performance issues
        if (isLagging) {
          console.warn(`Performance Warning: FPS dropped to ${fps}`);
        }

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(measurePerformance);
    };

    animationFrameRef.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [callback]);

  return { currentFPS: fpsRef.current };
};

/**
 * Hook untuk adaptive animation berdasarkan performa device
 */
export const useAdaptiveAnimation = () => {
  const { currentFPS } = usePerformanceMonitor();
  
  const getAnimationConfig = () => {
    if (currentFPS < 30) {
      return {
        duration: 0.1, // Sangat cepat untuk device lemah
        easing: 'ease-out',
        reduceMotion: true
      };
    } else if (currentFPS < 45) {
      return {
        duration: 0.2, // Cepat untuk device menengah
        easing: 'ease-out',
        reduceMotion: false
      };
    } else {
      return {
        duration: 0.3, // Normal untuk device kuat
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        reduceMotion: false
      };
    }
  };

  return { getAnimationConfig, currentFPS };
};