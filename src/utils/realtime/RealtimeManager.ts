
/**
 * Main Real-time Manager
 * Coordinates all real-time functionality
 */

import { RealtimeChannelManager } from './RealtimeChannelManager';
import { RealtimeEventHandler } from './RealtimeEventHandler';
import { RealtimeSubscriptionManager } from './RealtimeSubscriptionManager';
import { RealtimeConfig, RealtimeEvent, RealtimeEventCallback } from './RealtimeTypes';

export class RealtimeManager {
  private channelManager: RealtimeChannelManager;
  private eventHandler: RealtimeEventHandler;
  private subscriptionManager: RealtimeSubscriptionManager;
  private static instance: RealtimeManager;

  constructor() {
    this.channelManager = new RealtimeChannelManager();
    this.eventHandler = new RealtimeEventHandler();
    this.subscriptionManager = new RealtimeSubscriptionManager();
  }

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  /**
   * Auto-detects all modules and registers real-time capabilities
   */
  async autoDetectAndRegister() {
    console.log('🔄 Auto-detecting modules for real-time capabilities...');
    
    const configs = await this.subscriptionManager.detectModulesForRealtime();
    
    // Register real-time for all detected modules
    for (const config of configs) {
      await this.registerModule(config);
    }

    // Ensure critical tables are registered for real-time
    await this.ensureCriticalTablesRegistered();

    console.log(`✅ Auto-registered ${this.subscriptionManager.getDetectedModules().length} modules for real-time updates`);
  }

  /**
   * Ensures critical tables like user_roles and roles have real-time enabled
   */
  private async ensureCriticalTablesRegistered() {
    const criticalTables = [
      {
        tableName: 'user_roles',
        moduleName: 'UserRoles',
        enableInsert: true,
        enableUpdate: true,
        enableDelete: true,
        enableBulkOperations: true
      },
      {
        tableName: 'roles',
        moduleName: 'Roles', 
        enableInsert: true,
        enableUpdate: true,
        enableDelete: true,
        enableBulkOperations: true
      }
    ];

    for (const config of criticalTables) {
      if (!this.subscriptionManager.getDetectedModules().includes(config.moduleName)) {
        await this.registerModule(config);
      }
    }
  }

  /**
   * Registers a module for real-time updates
   */
  async registerModule(config: RealtimeConfig) {
    console.log(`🔗 Registering real-time for ${config.moduleName} (${config.tableName})`);

    // Create channel with event handler
    this.channelManager.createChannel(config, (config, payload) => {
      this.eventHandler.handleRealtimeEvent(config, payload);
    });

    // Track the detected module
    this.subscriptionManager.trackDetectedModule(config.moduleName);
    
    console.log(`✅ Real-time registered for ${config.moduleName}`);
  }

  /**
   * Subscribe to real-time events for a specific table
   */
  subscribe(tableName: string, callback: RealtimeEventCallback): () => void {
    return this.eventHandler.addSubscriber(tableName, callback);
  }

  /**
   * Unregister all channels (cleanup)
   */
  cleanup() {
    this.channelManager.cleanup();
    this.eventHandler.cleanup();
    this.subscriptionManager.clearDetectedModules();
  }

  /**
   * Get all registered modules
   */
  getRegisteredModules(): string[] {
    return this.subscriptionManager.getDetectedModules();
  }

  /**
   * Get comprehensive status
   */
  getStatus() {
    return {
      channels: this.channelManager.getStats(),
      subscribers: this.eventHandler.getSubscriberStats(),
      detection: this.subscriptionManager.getDetectionStats()
    };
  }
}

// Global singleton instance
export const realtimeManager = RealtimeManager.getInstance();

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  // Auto-detect and register modules when the app loads
  setTimeout(() => {
    realtimeManager.autoDetectAndRegister();
  }, 1000);
}
