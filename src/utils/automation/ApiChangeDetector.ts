
/**
 * Enhanced API Change Detection and Notification System
 * Works with the new API integration registry system
 */

import { supabase } from '@/integrations/supabase/client';
import { apiIntegrationManager } from '@/utils/api/ApiIntegrationManager';
import { ApiDirection, ApiLifecycleStage, ImpactLevel, ApiEventType } from '@/utils/api/ApiIntegrationTypes';

interface ApiChange {
  type: 'new_endpoint' | 'modified_endpoint' | 'deprecated_endpoint' | 'new_module' | 'breaking_change' | 'new_integration';
  api_name: string;
  direction?: ApiDirection;
  lifecycle_stage?: ApiLifecycleStage;
  endpoint?: string;
  module_name?: string;
  changes: string[];
  impact_level: ImpactLevel;
  migration_required: boolean;
  impact_assessment?: Record<string, any>;
  migration_notes?: string;
}

interface ApiChangeTrackingRecord {
  id: string;
  type: string;
  api_name: string;
  direction: ApiDirection | null;
  lifecycle_stage: ApiLifecycleStage | null;
  impact_assessment: Record<string, any> | null;
  migration_notes: string | null;
  detected_at: string;
  created_at: string;
}

class ApiChangeDetector {
  private lastScanTimestamp: string | null = null;

  /**
   * Scans for API changes and triggers notifications
   */
  async detectAndNotifyChanges() {
    console.log('🔍 Scanning for API changes with enhanced detection...');

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
   * Enhanced scanning for changes using the new registry system
   */
  private async scanForChanges(): Promise<ApiChange[]> {
    const changes: ApiChange[] = [];

    // Check for new integrations in registry
    const newIntegrations = await this.detectNewIntegrations();
    changes.push(...newIntegrations);

    // Check for new modules (legacy support)
    const newModules = await this.detectNewModules();
    changes.push(...newModules);

    // Check for lifecycle stage changes
    const lifecycleChanges = await this.detectLifecycleChanges();
    changes.push(...lifecycleChanges);

    return changes;
  }

  /**
   * Detects new API integrations in the registry
   */
  private async detectNewIntegrations(): Promise<ApiChange[]> {
    const changes: ApiChange[] = [];
    
    try {
      const { data: currentIntegrations } = await supabase
        .from('api_integration_registry')
        .select('*')
        .eq('status', 'active');

      const { data: trackedIntegrations } = await supabase
        .from('api_change_tracking')
        .select('*')
        .eq('type', 'integration');

      const trackedIntegrationIds = new Set((trackedIntegrations as ApiChangeTrackingRecord[] || []).map(t => t.api_name));

      for (const integration of currentIntegrations || []) {
        if (!trackedIntegrationIds.has(integration.id)) {
          changes.push({
            type: 'new_integration',
            api_name: integration.name,
            direction: integration.direction as ApiDirection,
            lifecycle_stage: integration.lifecycle_stage as ApiLifecycleStage,
            changes: [
              `New ${integration.direction} API integration: ${integration.name}`,
              `Type: ${integration.type}`,
              `Purpose: ${integration.purpose}`,
              `Category: ${integration.category}`,
              `Lifecycle Stage: ${integration.lifecycle_stage}`
            ],
            impact_level: this.calculateImpactLevel(integration),
            migration_required: integration.lifecycle_stage === 'production',
            impact_assessment: {
              endpoints_count: integration.endpoints_count,
              rls_policies_count: integration.rls_policies_count,
              data_mappings_count: integration.data_mappings_count,
              category: integration.category,
              type: integration.type
            },
            migration_notes: integration.lifecycle_stage === 'production' 
              ? 'This API is in production and may require integration updates.'
              : undefined
          });

          // Track this integration
          await supabase
            .from('api_change_tracking')
            .insert({
              type: 'integration',
              api_name: integration.id,
              direction: integration.direction as ApiDirection,
              lifecycle_stage: integration.lifecycle_stage as ApiLifecycleStage,
              impact_assessment: {
                endpoints_count: integration.endpoints_count,
                category: integration.category,
                type: integration.type
              },
              detected_at: new Date().toISOString()
            });
        }
      }
    } catch (error) {
      console.error('Error detecting new integrations:', error);
    }

    return changes;
  }

  /**
   * Detects lifecycle stage changes
   */
  private async detectLifecycleChanges(): Promise<ApiChange[]> {
    const changes: ApiChange[] = [];
    
    try {
      // Get recent lifecycle events that might indicate breaking changes
      const { data: recentEvents } = await supabase
        .from('api_lifecycle_events')
        .select(`
          *,
          api_integration_registry (
            name,
            direction,
            lifecycle_stage,
            category
          )
        `)
        .in('event_type', ['version_released', 'breaking_change', 'deprecated'])
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false });

      for (const event of recentEvents || []) {
        if (event.impact_level === 'high' || event.impact_level === 'critical' || event.requires_migration) {
          const registry = event.api_integration_registry as any;
          changes.push({
            type: event.event_type === 'breaking_change' ? 'breaking_change' : 'modified_endpoint',
            api_name: registry?.name || 'Unknown API',
            direction: registry?.direction as ApiDirection,
            lifecycle_stage: registry?.lifecycle_stage as ApiLifecycleStage,
            changes: [event.description],
            impact_level: event.impact_level as ImpactLevel,
            migration_required: event.requires_migration,
            impact_assessment: event.metadata as Record<string, any>,
            migration_notes: event.migration_instructions
          });
        }
      }
    } catch (error) {
      console.error('Error detecting lifecycle changes:', error);
    }

    return changes;
  }

  /**
   * Legacy method: Detects new modules
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
              direction: 'inbound' as ApiDirection,
              lifecycle_stage: 'production' as ApiLifecycleStage,
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
   * Calculate impact level based on integration characteristics
   */
  private calculateImpactLevel(integration: any): ImpactLevel {
    if (integration.lifecycle_stage === 'production' && integration.type === 'external') {
      return 'high';
    }
    if (integration.endpoints_count > 10 || integration.category === 'healthcare') {
      return 'medium';
    }
    return 'low';
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
          direction: change.direction,
          lifecycle_stage: change.lifecycle_stage,
          affected_modules: change.module_name ? [change.module_name] : undefined,
          impact_level: change.impact_level,
          migration_required: change.migration_required,
          impact_assessment: change.impact_assessment
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
      case 'new_integration':
        return `🆕 New ${change.direction} API: ${change.api_name}`;
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
    
    if (change.direction) {
      message += ` (${change.direction})`;
    }
    
    if (change.lifecycle_stage) {
      message += ` [${change.lifecycle_stage}]`;
    }
    
    if (change.migration_required) {
      message += ' Migration may be required.';
    }

    if (change.migration_notes) {
      message += ` Note: ${change.migration_notes}`;
    }
    
    return message;
  }

  private getNotificationType(changeType: string): string {
    switch (changeType) {
      case 'new_endpoint':
      case 'new_module':
      case 'new_integration':
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
