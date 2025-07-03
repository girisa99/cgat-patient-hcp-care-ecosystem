
/**
 * API Change Detection
 */

import { ApiIntegration, ApiLifecycleStage, ApiEventType, ImpactLevel } from '@/utils/api/ApiIntegrationTypes';

export interface ApiChangeEvent {
  id: string;
  integrationId: string;
  eventType: ApiEventType;
  fromStage?: ApiLifecycleStage;
  toStage?: ApiLifecycleStage;
  impactLevel: ImpactLevel;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class ApiChangeDetector {
  private static previousStates: Map<string, ApiIntegration> = new Map();

  static detectChanges(currentIntegrations: ApiIntegration[]): ApiChangeEvent[] {
    const changes: ApiChangeEvent[] = [];

    currentIntegrations.forEach(integration => {
      const previousState = this.previousStates.get(integration.id);
      
      if (!previousState) {
        // New integration detected
        changes.push({
          id: `change_${integration.id}_${Date.now()}`,
          integrationId: integration.id,
          eventType: 'created',
          toStage: integration.status as ApiLifecycleStage,
          impactLevel: 'medium',
          description: `New API integration "${integration.name}" was created`,
          timestamp: new Date().toISOString(),
          metadata: { integration }
        });
      } else {
        // Check for status changes
        if (previousState.status !== integration.status) {
          changes.push({
            id: `change_${integration.id}_${Date.now()}`,
            integrationId: integration.id,
            eventType: 'updated',
            fromStage: previousState.status as ApiLifecycleStage,
            toStage: integration.status as ApiLifecycleStage,
            impactLevel: this.determineImpactLevel(previousState.status, integration.status),
            description: `API integration "${integration.name}" status changed from ${previousState.status} to ${integration.status}`,
            timestamp: new Date().toISOString(),
            metadata: { previousState, currentState: integration }
          });
        }

        // Check for endpoint changes
        if (previousState.endpoints.length !== integration.endpoints.length) {
          changes.push({
            id: `change_${integration.id}_endpoints_${Date.now()}`,
            integrationId: integration.id,
            eventType: 'updated',
            impactLevel: 'high',
            description: `API integration "${integration.name}" endpoints changed (${previousState.endpoints.length} -> ${integration.endpoints.length})`,
            timestamp: new Date().toISOString(),
            metadata: { 
              previousEndpointCount: previousState.endpoints.length,
              currentEndpointCount: integration.endpoints.length
            }
          });
        }
      }

      // Update previous state
      this.previousStates.set(integration.id, { ...integration });
    });

    return changes;
  }

  private static determineImpactLevel(fromStatus: string, toStatus: string): ImpactLevel {
    if (toStatus === 'deprecated') return 'high';
    if (fromStatus === 'draft' && toStatus === 'active') return 'medium';
    if (fromStatus === 'active' && toStatus === 'inactive') return 'high';
    return 'low';
  }

  static getChangeHistory(): ApiChangeEvent[] {
    // In a real implementation, this would fetch from a database
    return [];
  }

  static clearHistory(): void {
    this.previousStates.clear();
  }
}
