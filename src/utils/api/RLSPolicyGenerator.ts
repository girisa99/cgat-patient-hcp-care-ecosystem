
/**
 * RLS Policy Generation for API Integrations
 */

import { ApiRlsPolicy } from './ApiIntegrationTypes';

export class RLSPolicyGenerator {
  static generateBasicUserPolicy(tableName: string): ApiRlsPolicy {
    return {
      id: `${tableName}_user_policy`,
      table: tableName,
      policy: `Users can manage their own ${tableName} records`,
      description: `Allow users to create, read, update, and delete their own ${tableName} records`,
      policyName: `${tableName}_user_access`,
      operation: 'ALL',
      tableName: tableName,
      condition: 'user_id = auth.uid()',
      roles: ['authenticated']
    };
  }

  static generateAdminPolicy(tableName: string): ApiRlsPolicy {
    return {
      id: `${tableName}_admin_policy`,
      table: tableName,
      policy: `Admins can manage all ${tableName} records`,
      description: `Allow administrators to manage all ${tableName} records`,
      policyName: `${tableName}_admin_access`,
      operation: 'ALL',
      tableName: tableName,
      condition: 'has_role(auth.uid(), \'superAdmin\')',
      roles: ['superAdmin', 'onboardingTeam']
    };
  }

  static generateReadOnlyPolicy(tableName: string): ApiRlsPolicy {
    return {
      id: `${tableName}_readonly_policy`,
      table: tableName,
      policy: `Public read access to ${tableName}`,
      description: `Allow public read-only access to ${tableName} records`,
      policyName: `${tableName}_public_read`,
      operation: 'SELECT',
      tableName: tableName,
      condition: 'true',
      roles: ['public', 'authenticated']
    };
  }
}
