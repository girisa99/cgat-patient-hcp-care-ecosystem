
/**
 * API Change Detection and Notification System
 * Automatically detects changes in APIs and triggers notifications
 */

import { supabase } from '@/integrations/supabase/client';

interface ApiChange {
  type: 'new_endpoint' | 'modified_endpoint' | 'deprecated_endpoint' | 'new_module' | 'breaking_change';
  api_name: string;
  endpoint?: string;
  module_name?: string;
  changes: string[];
  impact_level: 'low' | 'medium' | 'high';
  migration_required: boolean;
}

interface ApiChangeTrackingRecord {
  id: string;
  type: string;
  api_name: string;
  detected_at: string;
  created_at: string;
}

class ApiChangeDetector {
  private lastScanTimestamp: string | null = null;

  /**
   * Scans for API changes and triggers notifications
   */
  async detectAndNotifyChanges() {
    console.log('🔍 Scanning for API changes...');

    try {
      const changes = await this.scanForChanges();
      
      if (changes.length > 0) {
        console.log(`📊 Detected ${changes.length} API changes`);
        await this.processChanges(changes);
      }

      this.lastScanTimestamp = new Date().toISOString();
      return changes;
    } catch (error) {
      console.error('Error detecting API changes:', error);
      throw error;
    }
  }

  /**
   * Scans database and integration registry for changes
   */
  private async scanForChanges(): Promise<ApiChange[]> {
    const changes: ApiChange[] = [];

    // Check for new modules
    const newModules = await this.detectNewModules();
    changes.push(...newModules);

    return changes;
  }

  /**
   * Detects new modules
   */
  private async detectNewModules(): Promise<ApiChange[]> {
    const changes: ApiChange[] = [];
    
    try {
      const { data: currentModules } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true);

      const { data: trackedModules } = await supabase
        .from('api_change_tracking')
        .select('*')
        .eq('type', 'module');

      const trackedModuleIds = new Set((trackedModules as ApiChangeTrackingRecord[] || []).map(m => m.api_name));

      for (const module of currentModules || []) {
        if (!trackedModuleIds.has(module.id)) {
          changes.push({
            type: 'new_module',
            api_name: module.name,
            module_name: module.name,
            changes: [`New module available: ${module.name}`],
            impact_level: 'low',
            migration_required: false
          });

          // Track this module
          await supabase
            .from('api_change_tracking')
            .insert({
              type: 'module',
              api_name: module.id,
              detected_at: new Date().toISOString()
            });
        }
      }
    } catch (error) {
      console.error('Error detecting new modules:', error);
    }

    return changes;
  }

  /**
   * Processes detected changes and creates notifications
   */
  private async processChanges(changes: ApiChange[]) {
    for (const change of changes) {
      await this.createDeveloperNotifications(change);
    }
  }

  /**
   * Creates notifications for registered developers
   */
  private async createDeveloperNotifications(change: ApiChange) {
    try {
      // Get all approved developers
      const { data: developers } = await supabase
        .from('developer_applications')
        .select('user_id')
        .eq('status', 'approved');

      if (!developers) return;

      const notificationTitle = this.getNotificationTitle(change);
      const notificationMessage = this.getNotificationMessage(change);

      // Create notifications for all developers
      const notifications = developers.map(dev => ({
        user_id: dev.user_id,
        title: notificationTitle,
        message: notificationMessage,
        type: this.getNotificationType(change.type),
        metadata: {
          api_name: change.api_name,
          affected_modules: change.module_name ? [change.module_name] : undefined,
          impact_level: change.impact_level
        },
        is_read: false
      }));

      await supabase
        .from('developer_notifications')
        .insert(notifications);

      console.log(`📨 Created ${notifications.length} notifications for API change: ${change.api_name}`);
    } catch (error) {
      console.error('Error creating developer notifications:', error);
    }
  }

  private getNotificationTitle(change: ApiChange): string {
    switch (change.type) {
      case 'new_endpoint':
        return `New Endpoint Available: ${change.api_name}`;
      case 'new_module':
        return `New Module Available: ${change.api_name}`;
      case 'modified_endpoint':
        return `API Update: ${change.api_name}`;
      case 'deprecated_endpoint':
        return `Deprecation Notice: ${change.api_name}`;
      case 'breaking_change':
        return `🚨 Breaking Change: ${change.api_name}`;
      default:
        return `API Update: ${change.api_name}`;
    }
  }

  private getNotificationMessage(change: ApiChange): string {
    const changesList = change.changes.join(', ');
    let message = `Changes detected in ${change.api_name}: ${changesList}`;
    
    if (change.migration_required) {
      message += ' Migration may be required.';
    }
    
    return message;
  }

  private getNotificationType(changeType: string): string {
    switch (changeType) {
      case 'new_endpoint':
      case 'new_module':
        return 'new_api';
      case 'breaking_change':
        return 'breaking_change';
      default:
        return 'feature_update';
    }
  }
}

export const apiChangeDetector = new ApiChangeDetector();

// Auto-scan every 30 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiChangeDetector.detectAndNotifyChanges().catch(console.error);
  }, 30 * 60 * 1000);
}
