/**
 * MCP Field Mapping Service
 * Handles dynamic field mapping, data type transformations, and export to target systems
 */

import { supabase } from '@/integrations/supabase/client';
import { mcpCrmToolsService, MCPToolResult } from './mcpCrmToolsService';

// Field mapping interfaces
export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  isRequired?: boolean;
  dataType?: string;
}

export interface SourceField {
  name: string;
  value: any;
  dataType?: string;
}

export interface TargetField {
  name: string;
  label: string;
  dataType: string;
  isRequired?: boolean;
  isCustom?: boolean;
}

export interface MappedExportData {
  targetField: string;
  value: any;
  sourceField: string;
  transformation?: string;
}

export interface ExportResult {
  success: boolean;
  target: string;
  recordId?: string;
  message?: string;
  error?: string;
  mock?: boolean;
  timestamp: string;
}

// Transformation functions
export function applyTransformation(value: any, transformation: string): any {
  if (value === null || value === undefined) return value;
  
  switch (transformation) {
    case 'uppercase':
      return String(value).toUpperCase();
    case 'lowercase':
      return String(value).toLowerCase();
    case 'trim':
      return String(value).trim();
    case 'capitalize':
      return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
    case 'date_iso':
      try {
        return new Date(value).toISOString();
      } catch {
        return value;
      }
    case 'date_short':
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value;
      }
    case 'number':
      const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      return isNaN(num) ? 0 : num;
    case 'boolean':
      return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
    case 'json_stringify':
      return JSON.stringify(value);
    case 'remove_special':
      return String(value).replace(/[^a-zA-Z0-9\s]/g, '');
    case 'phone_format':
      const digits = String(value).replace(/\D/g, '');
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      return value;
    default:
      return value;
  }
}

// Detect data type from value
export function detectDataType(value: any): string {
  if (value === null || value === undefined) return 'string';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  
  const strValue = String(value);
  
  // Check for date patterns
  if (/^\d{4}-\d{2}-\d{2}/.test(strValue)) return 'date';
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(strValue)) return 'date';
  
  // Check for email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) return 'email';
  
  // Check for phone
  if (/^[\d\s\-\(\)\+]+$/.test(strValue) && strValue.replace(/\D/g, '').length >= 10) return 'phone';
  
  // Check for number
  if (/^-?\d+\.?\d*$/.test(strValue)) return 'number';
  
  return 'string';
}

// Transform source data using field mappings
export function transformDataWithMappings(
  sourceData: Record<string, any>,
  mappings: FieldMapping[]
): MappedExportData[] {
  return mappings.map(mapping => {
    const sourceValue = sourceData[mapping.sourceField];
    const transformedValue = mapping.transformation
      ? applyTransformation(sourceValue, mapping.transformation)
      : sourceValue;
    
    return {
      targetField: mapping.targetField,
      value: transformedValue,
      sourceField: mapping.sourceField,
      transformation: mapping.transformation
    };
  });
}

// Build export payload for target system
export function buildExportPayload(
  mappedData: MappedExportData[],
  targetSystem: string
): Record<string, any> {
  const payload: Record<string, any> = {};
  
  mappedData.forEach(item => {
    // Handle nested field paths (e.g., "address.street")
    if (item.targetField.includes('.')) {
      const parts = item.targetField.split('.');
      let current = payload;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = item.value;
    } else {
      payload[item.targetField] = item.value;
    }
  });
  
  // Add system-specific metadata
  switch (targetSystem) {
    case 'salesforce':
      payload._metadata = { 
        source: 'document_processing',
        timestamp: new Date().toISOString()
      };
      break;
    case 'hubspot':
      // HubSpot expects flat properties
      break;
    case 'veeva':
      payload.source_system__c = 'document_processing';
      break;
  }
  
  return payload;
}

// Validate mappings against target fields
export function validateMappings(
  mappings: FieldMapping[],
  targetFields: TargetField[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields are mapped
  const mappedTargets = new Set(mappings.map(m => m.targetField));
  targetFields
    .filter(f => f.isRequired)
    .forEach(field => {
      if (!mappedTargets.has(field.name)) {
        errors.push(`Required field "${field.label}" is not mapped`);
      }
    });
  
  // Check for duplicate target mappings
  const targetCounts: Record<string, number> = {};
  mappings.forEach(m => {
    targetCounts[m.targetField] = (targetCounts[m.targetField] || 0) + 1;
  });
  Object.entries(targetCounts)
    .filter(([_, count]) => count > 1)
    .forEach(([field]) => {
      errors.push(`Field "${field}" is mapped multiple times`);
    });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Execute export with mappings using proper MCP JSON-RPC protocol
export async function exportWithMappings(
  sourceFields: SourceField[],
  mappings: FieldMapping[],
  customFields: TargetField[],
  targetSystem: string,
  options?: {
    endpoint?: string;
    syncType?: 'create' | 'update' | 'create_or_update';
    documentId?: string;
    sobject?: string;
    objectType?: string;
  }
): Promise<ExportResult> {
  try {
    // Transform data
    const sourceData: Record<string, any> = {};
    sourceFields.forEach(field => {
      sourceData[field.name] = field.value;
    });
    
    const mappedData = transformDataWithMappings(sourceData, mappings);
    const payload = buildExportPayload(mappedData, targetSystem);
    
    // Add custom fields info
    if (customFields.length > 0) {
      payload._customFields = customFields.map(f => f.name);
    }
    
    console.log('[MCP Field Mapping] Exporting to', targetSystem, payload);
    
    // Route to appropriate handler based on target
    let result: MCPToolResult;
    
    if (['salesforce', 'hubspot', 'veeva'].includes(targetSystem)) {
      // Use proper MCP CRM tools with JSON-RPC protocol
      result = await mcpCrmToolsService.exportToCrm(
        targetSystem as 'salesforce' | 'hubspot' | 'veeva',
        payload,
        {
          sobject: options?.sobject,
          objectType: options?.objectType,
          operation: options?.syncType === 'update' ? 'update' : 'create'
        }
      );
    } else {
      // Use legacy mcp-data-sync for other targets (webhook, supabase, etc.)
      const { data, error } = await supabase.functions.invoke('mcp-data-sync', {
        body: {
          target: targetSystem,
          data: payload,
          syncType: options?.syncType || 'create',
          endpoint: options?.endpoint,
          documentId: options?.documentId
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      result = {
        success: true,
        id: data?.recordId,
        message: data?.message || `Successfully exported to ${targetSystem}`
      };
    }
    
    return {
      success: result.success,
      target: targetSystem,
      recordId: result.id,
      message: result.message || `Successfully exported to ${targetSystem}`,
      mock: result.mock,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('[MCP Field Mapping] Export error:', error);
    return {
      success: false,
      target: targetSystem,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Service object for named exports
export const mcpFieldMappingService = {
  applyTransformation,
  detectDataType,
  transformDataWithMappings,
  buildExportPayload,
  exportWithMappings,
  validateMappings
};
