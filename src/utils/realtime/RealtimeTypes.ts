
/**
 * Type definitions for the Real-time system
 */

export interface RealtimeConfig {
  tableName: string;
  moduleName: string;
  enableInsert?: boolean;
  enableUpdate?: boolean;
  enableDelete?: boolean;
  enableBulkOperations?: boolean;
  customFilters?: Record<string, any>;
}

export interface RealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | 'BULK_OPERATION';
  tableName: string;
  payload: any;
  timestamp: string;
  userId?: string;
}

export type RealtimeEventCallback = (event: RealtimeEvent) => void;

export interface RealtimeSubscription {
  id: string;
  tableName: string;
  callback: RealtimeEventCallback;
  isActive: boolean;
}

export interface RealtimeChannel {
  id: string;
  name: string;
  tableName: string;
  isConnected: boolean;
  subscriberCount: number;
}

export interface RealtimeStatus {
  isConnected: boolean;
  activeChannels: number;
  totalSubscribers: number;
  lastActivity: string;
}
