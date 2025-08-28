import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  cacheHitRate: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
}

interface UsePerformanceMetricsResult {
  metrics: PerformanceMetrics;
  startTiming: (label: string) => () => void;
  recordCacheHit: (hit: boolean) => void;
  recordApiCall: (duration: number) => void;
  recordNetworkRequest: () => void;
  getReport: () => string;
}

export const usePerformanceMetrics = (): UsePerformanceMetricsResult => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    cacheHitRate: 0,
    apiResponseTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0
  });

  const [timings, setTimings] = useState<Map<string, number>>(new Map());
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });
  const [apiCalls, setApiCalls] = useState<number[]>([]);

  // Start timing for a specific operation
  const startTiming = useCallback((label: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setTimings(prev => new Map(prev.set(label, duration)));
      
      // Update specific metrics
      if (label === 'page-load') {
        setMetrics(prev => ({ ...prev, loadTime: duration }));
      } else if (label === 'render') {
        setMetrics(prev => ({ ...prev, renderTime: duration }));
      }
    };
  }, []);

  // Record cache hit/miss
  const recordCacheHit = useCallback((hit: boolean) => {
    setCacheStats(prev => ({
      hits: hit ? prev.hits + 1 : prev.hits,
      misses: hit ? prev.misses : prev.misses + 1
    }));
  }, []);

  // Record API call duration
  const recordApiCall = useCallback((duration: number) => {
    setApiCalls(prev => [...prev.slice(-9), duration]); // Keep last 10 calls
  }, []);

  // Record network request
  const recordNetworkRequest = useCallback(() => {
    setMetrics(prev => ({ ...prev, networkRequests: prev.networkRequests + 1 }));
  }, []);

  // Update metrics based on collected data
  useEffect(() => {
    // Calculate cache hit rate
    const totalCacheRequests = cacheStats.hits + cacheStats.misses;
    const hitRate = totalCacheRequests > 0 ? (cacheStats.hits / totalCacheRequests) * 100 : 0;

    // Calculate average API response time
    const avgApiTime = apiCalls.length > 0 
      ? apiCalls.reduce((sum, time) => sum + time, 0) / apiCalls.length 
      : 0;

    // Get memory usage (if available)
    const memoryUsage = (performance as any).memory 
      ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
      : 0;

    setMetrics(prev => ({
      ...prev,
      cacheHitRate: hitRate,
      apiResponseTime: avgApiTime,
      memoryUsage
    }));
  }, [cacheStats, apiCalls]);

  // Generate performance report
  const getReport = useCallback(() => {
    const report = `
🚀 ZhivLux Performance Report
============================
📊 Load Time: ${metrics.loadTime.toFixed(2)}ms
🎯 Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%
⚡ API Response Time: ${metrics.apiResponseTime.toFixed(2)}ms
🖥️ Render Time: ${metrics.renderTime.toFixed(2)}ms
💾 Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB
🌐 Network Requests: ${metrics.networkRequests}

📈 Performance Grade: ${getPerformanceGrade()}
💡 Recommendations: ${getRecommendations()}
    `.trim();

    return report;
  }, [metrics]);

  const getPerformanceGrade = () => {
    let score = 100;
    
    // Deduct points for slow load time
    if (metrics.loadTime > 3000) score -= 30;
    else if (metrics.loadTime > 2000) score -= 20;
    else if (metrics.loadTime > 1000) score -= 10;
    
    // Deduct points for low cache hit rate
    if (metrics.cacheHitRate < 50) score -= 20;
    else if (metrics.cacheHitRate < 70) score -= 10;
    
    // Deduct points for slow API
    if (metrics.apiResponseTime > 1000) score -= 15;
    else if (metrics.apiResponseTime > 500) score -= 10;
    
    // Deduct points for high memory usage
    if (metrics.memoryUsage > 100) score -= 15;
    else if (metrics.memoryUsage > 50) score -= 10;
    
    if (score >= 90) return 'A+ (Excellent)';
    if (score >= 80) return 'A (Very Good)';
    if (score >= 70) return 'B (Good)';
    if (score >= 60) return 'C (Fair)';
    return 'D (Needs Improvement)';
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (metrics.loadTime > 2000) {
      recommendations.push('Optimize initial load time');
    }
    
    if (metrics.cacheHitRate < 70) {
      recommendations.push('Improve cache strategy');
    }
    
    if (metrics.apiResponseTime > 500) {
      recommendations.push('Optimize API calls');
    }
    
    if (metrics.memoryUsage > 50) {
      recommendations.push('Reduce memory usage');
    }
    
    if (metrics.networkRequests > 20) {
      recommendations.push('Reduce network requests');
    }
    
    return recommendations.length > 0 
      ? recommendations.join(', ')
      : 'Performance is optimal!';
  };

  // Monitor page load performance
  useEffect(() => {
    const handleLoad = () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, loadTime }));
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return {
    metrics,
    startTiming,
    recordCacheHit,
    recordApiCall,
    recordNetworkRequest,
    getReport
  };
};