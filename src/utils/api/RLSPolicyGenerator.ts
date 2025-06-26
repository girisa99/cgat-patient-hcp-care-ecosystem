
/**
 * RLS Policy Generation Utilities for API Integrations
 */

import { ApiIntegration, RLSPolicy } from './ApiIntegrationTypes';

export class RLSPolicyGenerator {
  static async generateRLSPolicies(integration: ApiIntegration): Promise<RLSPolicy[]> {
    const policies: RLSPolicy[] = [];
    const tables = [...new Set(integration.mappings.map(m => m.targetTable))];
    
    for (const table of tables) {
      policies.push(
        {
          tableName: table,
          policyName: `${integration.name}_select_policy`,
          operation: 'SELECT',
          condition: `integration_id = '${integration.id}'`,
          roles: ['authenticated']
        },
        {
          tableName: table,
          policyName: `${integration.name}_insert_policy`,
          operation: 'INSERT',
          condition: `auth.uid() IS NOT NULL`,
          roles: ['authenticated']
        }
      );
    }
    
    return policies;
  }
}
