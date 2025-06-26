
/**
 * Handles real-time events and notifications
 */

import { RealtimeConfig, RealtimeEvent, RealtimeEventCallback } from './RealtimeTypes';

export class RealtimeEventHandler {
  private subscribers: Map<string, Set<RealtimeEventCallback>> = new Map();

  /**
   * Processes incoming real-time events
   */
  handleRealtimeEvent(config: RealtimeConfig, payload: any) {
    const event: RealtimeEvent = {
      eventType: payload.eventType,
      tableName: config.tableName,
      payload: payload,
      timestamp: new Date().toISOString(),
      userId: payload.new?.user_id || payload.old?.user_id
    };

    console.log(`📡 Real-time event for ${config.moduleName}:`, event.eventType);

    // Notify all subscribers for this table
    this.notifySubscribers(config.tableName, event);

    // Auto-invalidate related queries
    this.autoInvalidateQueries(config.tableName);
  }

  /**
   * Notify all subscribers for a table
   */
  private notifySubscribers(tableName: string, event: RealtimeEvent) {
    const subscribers = this.subscribers.get(tableName);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('❌ Error in real-time subscriber:', error);
        }
      });
    }
  }

  /**
   * Auto-invalidates related React Query caches
   */
  private autoInvalidateQueries(tableName: string) {
    const queryKeys = [
      tableName,
      `${tableName}-list`,
      `${tableName}-search`,
      'users', // Always invalidate users if any table changes
      'dashboard' // Always refresh dashboard
    ];

    // Dispatch custom event for query invalidation
    window.dispatchEvent(new CustomEvent('realtime-invalidate', {
      detail: { queryKeys, tableName }
    }));
  }

  /**
   * Add a subscriber for a table
   */
  addSubscriber(tableName: string, callback: RealtimeEventCallback): () => void {
    if (!this.subscribers.has(tableName)) {
      this.subscribers.set(tableName, new Set());
    }
    
    this.subscribers.get(tableName)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(tableName)?.delete(callback);
    };
  }

  /**
   * Remove all subscribers for a table
   */
  removeSubscribers(tableName: string) {
    this.subscribers.delete(tableName);
  }

  /**
   * Get subscriber statistics
   */
  getSubscriberStats() {
    const stats: Record<string, number> = {};
    this.subscribers.forEach((subscribers, tableName) => {
      stats[tableName] = subscribers.size;
    });
    return stats;
  }

  /**
   * Cleanup all subscribers
   */
  cleanup() {
    this.subscribers.clear();
  }
}
