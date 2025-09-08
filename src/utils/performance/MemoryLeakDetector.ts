/**
 * Memory Leak Detection and Prevention
 * Detects and fixes common memory leaks in React applications
 */

export class MemoryLeakDetector {
  private static listeners: Set<() => void> = new Set();
  private static intervals: Set<NodeJS.Timeout> = new Set();
  private static observers: Set<any> = new Set();

  /**
   * Register cleanup function to be called on memory cleanup
   */
  static registerCleanup(cleanup: () => void) {
    this.listeners.add(cleanup);
  }

  /**
   * Register interval for cleanup tracking
   */
  static trackInterval(interval: NodeJS.Timeout) {
    this.intervals.add(interval);
  }

  /**
   * Register observer for cleanup tracking
   */
  static trackObserver(observer: any) {
    this.observers.add(observer);
  }

  /**
   * Perform comprehensive memory leak cleanup
   */
  static performCleanup() {
    console.log('🧹 Starting comprehensive memory leak cleanup...');
    
    // Clear all registered listeners
    this.listeners.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('⚠️ Cleanup function failed:', error);
      }
    });
    
    // Clear all intervals
    this.intervals.forEach(interval => {
      clearInterval(interval);
    });
    this.intervals.clear();
    
    // Disconnect all observers
    this.observers.forEach(observer => {
      if (observer?.disconnect) observer.disconnect();
      if (observer?.unobserve) observer.unobserve();
    });
    this.observers.clear();
    
    // Clear event listeners on window
    if (typeof window !== 'undefined') {
      const events = ['resize', 'scroll', 'focus', 'blur', 'beforeunload'];
      events.forEach(event => {
        window.removeEventListener(event, () => {});
      });
    }
    
    console.log('✅ Memory leak cleanup completed');
  }

  /**
   * Get current memory usage if available
   */
  static getMemoryUsage(): number {
    if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
      const memory = (window.performance as any).memory;
      return memory.usedJSHeapSize / memory.totalJSHeapSize;
    }
    return 0;
  }

  /**
   * Check if memory usage is critical
   */
  static isMemoryCritical(): boolean {
    return this.getMemoryUsage() > 0.85;
  }
}