import { EventEmitter } from 'events';

/**
 * TypedEventEmitter
 *
 * Utility wrapper around Node.js `EventEmitter` that preserves generic event maps.
 * Node's type definitions already support generics, so we simply re-export a
 * subclass with a more memorable name.
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