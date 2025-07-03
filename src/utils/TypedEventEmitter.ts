
/**
 * TypedEventEmitter
 * Browser-compatible event emitter using native EventTarget
 */

export interface EventsMap {
  [event: string | symbol]: readonly unknown[];
}

// Browser-compatible EventEmitter using EventTarget
export class TypedEventEmitter<E extends EventsMap> extends EventTarget {
  private eventMap = new Map<keyof E, Set<(...args: any[]) => void>>();

  on<K extends keyof E>(event: K, listener: (...args: E[K]) => void): this {
    if (!this.eventMap.has(event)) {
      this.eventMap.set(event, new Set());
    }
    this.eventMap.get(event)!.add(listener);
    
    // Add native event listener for compatibility
    this.addEventListener(event as string, (e: any) => {
      if (e.detail) {
        listener(...e.detail);
      }
    });
    
    return this;
  }

  once<K extends keyof E>(event: K, listener: (...args: E[K]) => void): this {
    const onceListener = (...args: E[K]) => {
      listener(...args);
      this.off(event, onceListener);
    };
    return this.on(event, onceListener);
  }

  emit<K extends keyof E>(event: K, ...args: E[K]): boolean {
    const listeners = this.eventMap.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
    
    // Dispatch native event for compatibility
    this.dispatchEvent(new CustomEvent(event as string, { detail: args }));
    
    return listeners ? listeners.size > 0 : false;
  }

  off<K extends keyof E>(event: K, listener: (...args: E[K]) => void): this {
    const listeners = this.eventMap.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventMap.delete(event);
      }
    }
    return this;
  }

  removeAllListeners(): this {
    this.eventMap.clear();
    return this;
  }
}
