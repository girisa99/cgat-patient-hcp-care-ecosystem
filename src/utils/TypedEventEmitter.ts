import { EventEmitter } from 'events';

/**
 * TypedEventEmitter
 *
 * Utility wrapper around Node.js `EventEmitter` that preserves generic event maps.
 * Node's type definitions already support generics, so we simply re-export a
 * subclass with a more memorable name.
 */
export class TypedEventEmitter<Events extends Record<keyof any, any[]>> extends EventEmitter<Events> {}