
/**
 * RLS Policy Generation Utilities for API Integrations
 */

import { ApiIntegration, ApiRlsPolicy } from './ApiIntegrationTypes';

export class RLSPolicyGenerator {
  static async generateRLSPolicies(integration: ApiIntegration): Promise<ApiRlsPolicy[]> {
    const policies: ApiRlsPolicy[] = [];
    const tables = [...new Set(integration.mappings.map(m => m.targetTable))];
    
    for (const table of tables) {
      policies.push(
        {
          table: table,
          policy: `${integration.name}_select_policy`,
          type: 'SELECT',
          policyName: `${integration.name}_select_policy`,
          operation: 'SELECT',
          tableName: table,
          condition: `integration_id = '${integration.id}'`,
          roles: ['authenticated']
        },
        {
          table: table,
          policy: `${integration.name}_insert_policy`,
          type: 'INSERT',
          policyName: `${integration.name}_insert_policy`,
          operation: 'INSERT',
          tableName: table,
          condition: `auth.uid() IS NOT NULL`,
          roles: ['authenticated']
        }
      );
    }
    
    return policies;
  }
}
