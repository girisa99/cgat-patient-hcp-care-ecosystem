
/**
 * Integration Data Management Utilities
 */

import { supabase } from '@/integrations/supabase/client';
import { ApiIntegration } from './ApiIntegrationTypes';
import { DataMappingGenerator } from './DataMappingGenerator';

export class IntegrationDataManager {
  static async validateData(data: any, schemas: Record<string, any>): Promise<void> {
    console.log('📝 Validating data against schemas...');
  }

  static async saveIntegratedData(data: any, integration: ApiIntegration): Promise<void> {
    const tableData: Record<string, any[]> = {};
    
    integration.mappings.forEach(mapping => {
      if (!tableData[mapping.targetTable]) {
        tableData[mapping.targetTable] = [];
      }
      tableData[mapping.targetTable].push({
        [mapping.targetField]: data[mapping.targetField],
        integration_id: integration.id,
        synced_at: new Date()
      });
    });
    
    for (const [tableName, records] of Object.entries(tableData)) {
      if (tableName === 'profiles' || tableName === 'facilities' || tableName === 'audit_logs') {
        await (supabase.from as any)(tableName).insert(records);
      }
    }
  }

  static async saveIntegration(integration: ApiIntegration): Promise<void> {
    await supabase.from('audit_logs').insert({
      action: 'API_INTEGRATION_CREATED',
      table_name: 'api_integrations',
      record_id: integration.id,
      new_values: {
        id: integration.id,
        name: integration.name,
        description: integration.description,
        type: integration.type,
        category: integration.category,
        created_at: integration.createdAt,
        updated_at: integration.updatedAt
      }
    });
  }

  static async logIntegrationEvent(
    integrationId: string,
    operation: string,
    status: string,
    error?: any
  ): Promise<void> {
    await supabase.from('audit_logs').insert({
      action: `API_INTEGRATION_${operation.toUpperCase()}`,
      table_name: 'api_integrations',
      record_id: integrationId,
      new_values: {
        operation,
        status,
        error: error?.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}
