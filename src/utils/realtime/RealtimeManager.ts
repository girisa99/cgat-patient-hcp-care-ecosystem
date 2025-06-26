
/**
 * Automated Real-time Manager
 * Automatically detects modules and applies real-time capabilities
 */

import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { moduleRegistry } from '@/utils/moduleRegistry';

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

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscribers: Map<string, Set<(event: RealtimeEvent) => void>> = new Map();
  private detectedModules: Set<string> = new Set();

  /**
   * Auto-detects all modules and registers real-time capabilities
   */
  async autoDetectAndRegister() {
    console.log('🔄 Auto-detecting modules for real-time capabilities...');
    
    // Get all registered modules
    const modules = moduleRegistry.getAll();
    
    // Auto-detect additional modules from database tables
    const detectedTables = await this.scanDatabaseTables();
    
    // Register real-time for all detected modules
    for (const module of modules) {
      await this.registerModule({
        tableName: module.tableName,
        moduleName: module.moduleName,
        enableInsert: true,
        enableUpdate: true,
        enableDelete: true,
        enableBulkOperations: true
      });
    }

    // Register additional detected tables
    for (const tableName of detectedTables) {
      if (!modules.some(m => m.tableName === tableName)) {
        await this.registerModule({
          tableName,
          moduleName: this.tableToModuleName(tableName),
          enableInsert: true,
          enableUpdate: true,
          enableDelete: true,
          enableBulkOperations: true
        });
      }
    }

    console.log(`✅ Auto-registered ${this.detectedModules.size} modules for real-time updates`);
  }

  /**
   * Scans database tables to auto-detect modules
   */
  private async scanDatabaseTables(): Promise<string[]> {
    try {
      // Get all tables from information_schema
      const { data: tables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .neq('table_name', 'audit_logs'); // Exclude system tables

      return tables?.map(t => t.table_name) || [];
    } catch (error) {
      console.warn('⚠️ Could not scan database tables:', error);
      // Fallback to known tables
      return ['profiles', 'facilities', 'modules', 'user_roles', 'permissions'];
    }
  }

  /**
   * Converts table name to module name (PascalCase)
   */
  private tableToModuleName(tableName: string): string {
    return tableName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Registers a module for real-time updates
   */
  async registerModule(config: RealtimeConfig) {
    const channelName = `realtime_${config.tableName}`;
    
    if (this.channels.has(channelName)) {
      console.log(`⚠️ Channel already exists for ${config.tableName}`);
      return;
    }

    console.log(`🔗 Registering real-time for ${config.moduleName} (${config.tableName})`);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.tableName
        },
        (payload) => this.handleRealtimeEvent(config, payload)
      )
      .subscribe();

    this.channels.set(channelName, channel);
    this.detectedModules.add(config.moduleName);
    
    // Initialize subscribers set
    if (!this.subscribers.has(config.tableName)) {
      this.subscribers.set(config.tableName, new Set());
    }

    console.log(`✅ Real-time registered for ${config.moduleName}`);
  }

  /**
   * Handles incoming real-time events
   */
  private handleRealtimeEvent(config: RealtimeConfig, payload: any) {
    const event: RealtimeEvent = {
      eventType: payload.eventType,
      tableName: config.tableName,
      payload: payload,
      timestamp: new Date().toISOString(),
      userId: payload.new?.user_id || payload.old?.user_id
    };

    console.log(`📡 Real-time event for ${config.moduleName}:`, event.eventType);

    // Notify all subscribers
    const subscribers = this.subscribers.get(config.tableName);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('❌ Error in real-time subscriber:', error);
        }
      });
    }

    // Auto-invalidate related queries
    this.autoInvalidateQueries(config.tableName);
  }

  /**
   * Auto-invalidates related React Query caches
   */
  private autoInvalidateQueries(tableName: string) {
    // This will be enhanced to work with React Query
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
   * Subscribe to real-time events for a specific table
   */
  subscribe(tableName: string, callback: (event: RealtimeEvent) => void) {
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
   * Unregister all channels (cleanup)
   */
  cleanup() {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.subscribers.clear();
    this.detectedModules.clear();
  }

  /**
   * Get all registered modules
   */
  getRegisteredModules(): string[] {
    return Array.from(this.detectedModules);
  }
}

// Global singleton instance
export const realtimeManager = new RealtimeManager();

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  // Auto-detect and register modules when the app loads
  setTimeout(() => {
    realtimeManager.autoDetectAndRegister();
  }, 1000);
}
