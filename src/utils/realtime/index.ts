
/**
 * Realtime System - Main Export File
 */

// Export main classes
export { RealtimeManager, realtimeManager } from './RealtimeManager';
export { RealtimeChannelManager } from './RealtimeChannelManager';
export { RealtimeEventHandler } from './RealtimeEventHandler';
export { RealtimeSubscriptionManager } from './RealtimeSubscriptionManager';
export { RealtimeModuleRegistry, realtimeModuleRegistry } from './RealtimeModuleRegistry';

// Export types
export type {
  RealtimeEvent,
  RealtimeSubscription,
  RealtimeChannel,
  RealtimeConfig,
  RealtimeStatus,
  RealtimeEventCallback
} from './RealtimeTypes';

// Export main hook
export { useRealtime } from '../../hooks/useRealtime';

// Initialize global realtime manager
export const globalRealtimeManager = realtimeManager;
