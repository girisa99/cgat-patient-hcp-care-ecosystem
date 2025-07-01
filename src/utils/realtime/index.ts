
/**
 * Realtime System - Main Export File
 */

// Export main classes
export { RealtimeManager } from './RealtimeManager';
export { RealtimeChannelManager } from './RealtimeChannelManager';
export { RealtimeEventHandler } from './RealtimeEventHandler';
export { RealtimeSubscriptionManager } from './RealtimeSubscriptionManager';
export { RealtimeModuleRegistry } from './RealtimeModuleRegistry';

// Export types
export type {
  RealtimeEvent,
  RealtimeSubscription,
  RealtimeChannel,
  RealtimeConfig,
  RealtimeStatus
} from './RealtimeTypes';

// Export main hook (remove the non-existent ones)
export { useRealtime } from '../../hooks/useRealtime';

// Initialize global realtime manager
export const globalRealtimeManager = RealtimeManager.getInstance();
