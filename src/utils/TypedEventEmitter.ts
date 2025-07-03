import { EventEmitter } from 'eventemitter3';

/**
 * TypedEventEmitter
 *
 * Utility wrapper around browser-compatible `EventEmitter` that preserves generic event maps.
 * Uses eventemitter3 for cross-platform compatibility.
 */
export interface EventsMap {
  [event: string | symbol]: readonly unknown[];
}

// Wrapper that preserves the runtime behaviour of Node.js EventEmitter but
// provides strict typing for each event signature.
export class TypedEventEmitter<E extends EventsMap> extends EventEmitter {
  on<K extends keyof E>(event: K, listener: (...args: E[K]) => void): this {
    return super.on(event as string | symbol, listener as (...args: unknown[]) => void);
  }

  once<K extends keyof E>(event: K, listener: (...args: E[K]) => void): this {
    return super.once(event as string | symbol, listener as (...args: unknown[]) => void);
  }

  emit<K extends keyof E>(event: K, ...args: E[K]): boolean {
    return super.emit(event as string | symbol, ...(Array.from(args) as unknown[]));
  }
}