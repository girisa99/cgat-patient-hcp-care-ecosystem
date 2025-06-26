
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
