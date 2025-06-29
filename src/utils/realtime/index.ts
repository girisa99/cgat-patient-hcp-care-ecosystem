
/**
 * Enhanced Real-time System Entry Point
 * Exports all real-time functionality with admin module support
 */

export { realtimeManager } from './RealtimeManager';
export { RealtimeChannelManager } from './RealtimeChannelManager';
export { RealtimeEventHandler } from './RealtimeEventHandler';
export { RealtimeSubscriptionManager } from './RealtimeSubscriptionManager';
export { realtimeModuleRegistry } from './RealtimeModuleRegistry';
export type { RealtimeConfig, RealtimeEvent, RealtimeEventCallback } from './RealtimeTypes';
export type { AdminModuleConfig } from './RealtimeModuleRegistry';

// Enhanced hooks
export { useRealtime, useAutoRealtime, useModuleRealtime } from '../../hooks/useRealtime';
export { useAdminRealtime } from '../../hooks/useAdminRealtime';
