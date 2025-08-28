/**
 * Animation Optimization Utilities
 * Kumpulan utility functions untuk mengoptimalkan animasi
 */

// 1. Debounced animation trigger
export const debounceAnimation = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 2. Intersection Observer untuk lazy animations
export const createLazyAnimationObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// 3. Animation frame scheduler
export class AnimationScheduler {
  private queue: Array<() => void> = [];
  private isRunning = false;

  add(callback: () => void) {
    this.queue.push(callback);
    if (!this.isRunning) {
      this.process();
    }
  }

  private process() {
    this.isRunning = true;
    
    const processFrame = () => {
      const startTime = performance.now();
      
      // Process callbacks until we hit 16ms budget (60fps)
      while (this.queue.length > 0 && (performance.now() - startTime) < 16) {
        const callback = this.queue.shift();
        if (callback) callback();
      }
      
      if (this.queue.length > 0) {
        requestAnimationFrame(processFrame);
      } else {
        this.isRunning = false;
      }
    };
    
    requestAnimationFrame(processFrame);
  }
}

// 4. CSS Animation Controller
export class CSSAnimationController {
  private element: HTMLElement;
  private originalTransition: string;

  constructor(element: HTMLElement) {
    this.element = element;
    this.originalTransition = element.style.transition;
  }

  // Disable animations temporarily
  disableAnimations() {
    this.element.style.transition = 'none';
    this.element.style.animation = 'none';
  }

  // Re-enable animations
  enableAnimations() {
    this.element.style.transition = this.originalTransition;
    this.element.style.animation = '';
  }

  // Apply optimized transform
  optimizedTransform(x: number, y: number, scale: number = 1) {
    this.element.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }
}

// 5. Performance-aware animation helper
export const createPerformantAnimation = (
  element: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions = {}
) => {
  // Check if device supports hardware acceleration
  const supportsHardwareAcceleration = 'transform' in element.style;
  
  if (!supportsHardwareAcceleration) {
    // Fallback for older devices
    options.duration = Math.min(options.duration as number || 300, 150);
  }

  // Add will-change for better performance
  element.style.willChange = 'transform, opacity';
  
  const animation = element.animate(keyframes, {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards',
    ...options
  });

  // Clean up will-change after animation
  animation.addEventListener('finish', () => {
    element.style.willChange = 'auto';
  });

  return animation;
};

// 6. Batch DOM updates
export class DOMBatcher {
  private readCallbacks: Array<() => void> = [];
  private writeCallbacks: Array<() => void> = [];
  private scheduled = false;

  read(callback: () => void) {
    this.readCallbacks.push(callback);
    this.schedule();
  }

  write(callback: () => void) {
    this.writeCallbacks.push(callback);
    this.schedule();
  }

  private schedule() {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      // Execute all reads first
      this.readCallbacks.forEach(callback => callback());
      this.readCallbacks = [];

      // Then execute all writes
      this.writeCallbacks.forEach(callback => callback());
      this.writeCallbacks = [];

      this.scheduled = false;
    });
  }
}

// 7. Device capability detector
export const getDeviceCapabilities = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  return {
    hardwareAcceleration: !!gl,
    devicePixelRatio: window.devicePixelRatio || 1,
    maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0,
    isLowEndDevice: navigator.hardwareConcurrency <= 2 || 
                    (navigator as any).deviceMemory <= 2,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };
};

// 8. Animation performance profiler
export class AnimationProfiler {
  private startTime: number = 0;
  private frameCount: number = 0;
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  start() {
    this.startTime = performance.now();
    this.frameCount = 0;
    console.time(`Animation: ${this.name}`);
  }

  frame() {
    this.frameCount++;
  }

  end() {
    const duration = performance.now() - this.startTime;
    const avgFrameTime = duration / this.frameCount;
    const fps = 1000 / avgFrameTime;
    
    console.timeEnd(`Animation: ${this.name}`);
    console.log(`${this.name} Performance:`, {
      duration: `${duration.toFixed(2)}ms`,
      frames: this.frameCount,
      avgFrameTime: `${avgFrameTime.toFixed(2)}ms`,
      fps: fps.toFixed(1)
    });

    if (fps < 30) {
      console.warn(`⚠️ ${this.name} is running below 30 FPS!`);
    }
  }
}