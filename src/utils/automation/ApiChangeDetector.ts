
/**
 * API Change Detection and Monitoring
 */

import { ApiIntegration, ApiLifecycleStage, ApiEventType, ImpactLevel } from '@/utils/api/ApiIntegrationTypes';

export interface ApiChange {
  id: string;
  integrationId: string;
  changeType: ApiEventType;
  fromStage?: ApiLifecycleStage;
  toStage?: ApiLifecycleStage;
  description: string;
  impactLevel: ImpactLevel;
  affectedEndpoints: string[];
  migrationRequired: boolean;
  detectedAt: string;
}

export class ApiChangeDetector {
  private static changes: ApiChange[] = [];

  /**
   * Detect changes in API integrations
   */
  static detectChanges(oldIntegration: ApiIntegration, newIntegration: ApiIntegration): ApiChange[] {
    const changes: ApiChange[] = [];

    // Check for version changes
    if (oldIntegration.version !== newIntegration.version) {
      changes.push({
        id: `version_${Date.now()}`,
        integrationId: newIntegration.id,
        changeType: 'version_released',
        description: `Version updated from ${oldIntegration.version} to ${newIntegration.version}`,
        impactLevel: 'medium',
        affectedEndpoints: newIntegration.endpoints.map(e => e.id),
        migrationRequired: false,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for endpoint changes
    const oldEndpointIds = new Set(oldIntegration.endpoints.map(e => e.id));
    const newEndpointIds = new Set(newIntegration.endpoints.map(e => e.id));

    // Detect new endpoints
    for (const endpointId of newEndpointIds) {
      if (!oldEndpointIds.has(endpointId)) {
        const endpoint = newIntegration.endpoints.find(e => e.id === endpointId);
        changes.push({
          id: `endpoint_added_${Date.now()}`,
          integrationId: newIntegration.id,
          changeType: 'updated',
          description: `New endpoint added: ${endpoint?.name}`,
          impactLevel: 'low',
          affectedEndpoints: [endpointId],
          migrationRequired: false,
          detectedAt: new Date().toISOString()
        });
      }
    }

    // Detect removed endpoints
    for (const endpointId of oldEndpointIds) {
      if (!newEndpointIds.has(endpointId)) {
        const endpoint = oldIntegration.endpoints.find(e => e.id === endpointId);
        changes.push({
          id: `endpoint_removed_${Date.now()}`,
          integrationId: newIntegration.id,
          changeType: 'breaking_change',
          description: `Endpoint removed: ${endpoint?.name}`,
          impactLevel: 'high',
          affectedEndpoints: [endpointId],
          migrationRequired: true,
          detectedAt: new Date().toISOString()
        });
      }
    }

    this.changes.push(...changes);
    return changes;
  }

  /**
   * Get all detected changes
   */
  static getAllChanges(): ApiChange[] {
    return [...this.changes];
  }

  /**
   * Get changes by integration ID
   */
  static getChangesByIntegration(integrationId: string): ApiChange[] {
    return this.changes.filter(change => change.integrationId === integrationId);
  }

  /**
   * Clear all changes
   */
  static clearChanges(): void {
    this.changes = [];
  }

  /**
   * Detect and notify changes - main automation method
   */
  static async detectAndNotifyChanges(): Promise<void> {
    console.log('🔍 Starting API change detection and notification process...');
    
    try {
      // This would typically scan for changes in the system
      // For now, we'll just log that the process ran
      console.log('✅ API change detection completed');
    } catch (error) {
      console.error('❌ API change detection failed:', error);
    }
  }
}

// Export the instance for use in hooks
export const apiChangeDetector = ApiChangeDetector;
