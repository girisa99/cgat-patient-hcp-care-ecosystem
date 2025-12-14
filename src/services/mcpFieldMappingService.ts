/**
 * MCP Field Mapping Service
 * Handles dynamic field mapping, data type transformations, and export to target systems
 */

import { supabase } from '@/integrations/supabase/client';
import type { FieldMapping, TargetField, SourceField } from '@/components/document-processing/FieldMappingDialog';

export interface MappedExportData {
  targetField: string;
  value: any;
  originalField: string;
  transformation: string;
  dataType: string;
}

export interface ExportResult {
  success: boolean;
  target: string;
  recordsProcessed: number;
  mappedFields: number;
  customFieldsCreated: string[];
  error?: string;
  syncedAt: string;
}

/**
 * Apply data type transformation to a value
 */
export function applyTransformation(value: any, transformation: string): any {
  if (value === null || value === undefined) return value;
  
  const strValue = String(value);
  
  switch (transformation) {
    case 'uppercase':
      return strValue.toUpperCase();
      
    case 'lowercase':
      return strValue.toLowerCase();
      
    case 'trim':
      return strValue.trim();
      
    case 'date_iso':
      try {
        const date = new Date(strValue);
        return isNaN(date.getTime()) ? strValue : date.toISOString();
      } catch {
        return strValue;
      }
      
    case 'number':
      const num = parseFloat(strValue.replace(/[^\d.-]/g, ''));
      return isNaN(num) ? 0 : num;
      
    case 'boolean':
      const lower = strValue.toLowerCase();
      return ['true', 'yes', '1', 'on'].includes(lower);
      
    case 'none':
    default:
      return value;
  }
}

/**
 * Detect the data type of a value
 */
export function detectDataType(value: any): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (value instanceof Date) return 'date';
  
  const str = String(value);
  
  // Check for date patterns
  if (/^\d{4}-\d{2}-\d{2}/.test(str) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(str)) {
    return 'date';
  }
  
  // Check for number
  if (/^-?\d+\.?\d*$/.test(str)) {
    return 'number';
  }
  
  // Check for email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
    return 'email';
  }
  
  // Check for phone
  if (/^[\d\s\-\+\(\)]{10,}$/.test(str)) {
    return 'phone';
  }
  
  return 'string';
}

/**
 * Transform source data using field mappings
 */
export function transformDataWithMappings(
  sourceData: Record<string, any>,
  mappings: FieldMapping[]
): MappedExportData[] {
  const result: MappedExportData[] = [];
  
  for (const mapping of mappings) {
    if (mapping.skip || !mapping.targetField) continue;
    
    const value = sourceData[mapping.sourceField];
    const transformedValue = applyTransformation(value, mapping.transformation || 'none');
    
    result.push({
      targetField: mapping.targetField,
      value: transformedValue,
      originalField: mapping.sourceField,
      transformation: mapping.transformation || 'none',
      dataType: detectDataType(transformedValue)
    });
  }
  
  return result;
}

/**
 * Build export payload in target system format
 */
export function buildExportPayload(
  mappedData: MappedExportData[],
  targetSystem: string
): Record<string, any> {
  const payload: Record<string, any> = {};
  
  for (const field of mappedData) {
    // Apply system-specific formatting
    switch (targetSystem) {
      case 'salesforce':
        // Salesforce uses object format
        payload[field.targetField] = field.value;
        break;
        
      case 'hubspot':
        // HubSpot uses properties wrapper
        if (!payload.properties) payload.properties = {};
        payload.properties[field.targetField] = field.value;
        break;
        
      case 'veeva':
        // Veeva uses similar to Salesforce
        payload[field.targetField] = field.value;
        break;
        
      default:
        // Generic format
        payload[field.targetField] = field.value;
    }
  }
  
  return payload;
}

/**
 * Export data to target system via MCP SDK
 */
export async function exportWithMappings(
  sourceFields: SourceField[],
  mappings: FieldMapping[],
  customFields: TargetField[],
  targetSystem: string,
  options: {
    endpoint?: string;
    syncType?: 'create' | 'update' | 'create_or_update';
    documentId?: string;
  } = {}
): Promise<ExportResult> {
  try {
    console.log(`📤 Exporting to ${targetSystem} with ${mappings.length} mappings`);
    
    // Build source data object
    const sourceData: Record<string, any> = {};
    for (const field of sourceFields) {
      sourceData[field.name] = field.value;
    }
    
    // Transform data using mappings
    const mappedData = transformDataWithMappings(sourceData, mappings);
    
    if (mappedData.length === 0) {
      return {
        success: false,
        target: targetSystem,
        recordsProcessed: 0,
        mappedFields: 0,
        customFieldsCreated: [],
        error: 'No fields mapped for export',
        syncedAt: new Date().toISOString()
      };
    }
    
    // Build export payload
    const payload = buildExportPayload(mappedData, targetSystem);
    
    // Add metadata
    const exportRecord = {
      target: targetSystem,
      data: [payload],
      format: 'json',
      syncType: options.syncType || 'create',
      endpoint: options.endpoint,
      customFields: customFields.map(cf => cf.name),
      mappingMetadata: {
        totalSourceFields: sourceFields.length,
        mappedFields: mappedData.length,
        skippedFields: mappings.filter(m => m.skip).length,
        customFieldsCreated: customFields.length,
        transformations: mappedData.filter(m => m.transformation !== 'none').length
      }
    };
    
    // Call MCP data sync edge function
    const { data, error } = await supabase.functions.invoke('mcp-data-sync', {
      body: exportRecord
    });
    
    if (error) throw error;
    
    // Log export for audit trail
    await logExport(targetSystem, mappedData, customFields, options.documentId);
    
    return {
      success: data?.success ?? true,
      target: targetSystem,
      recordsProcessed: 1,
      mappedFields: mappedData.length,
      customFieldsCreated: customFields.map(cf => cf.name),
      syncedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      target: targetSystem,
      recordsProcessed: 0,
      mappedFields: 0,
      customFieldsCreated: [],
      error: error instanceof Error ? error.message : 'Export failed',
      syncedAt: new Date().toISOString()
    };
  }
}

/**
 * Log export for audit trail
 */
async function logExport(
  target: string,
  mappedData: MappedExportData[],
  customFields: TargetField[],
  documentId?: string
): Promise<void> {
  try {
    await supabase.from('document_exports' as any).insert({
      document_id: documentId,
      target_system: target,
      mapped_fields: mappedData.map(m => ({
        source: m.originalField,
        target: m.targetField,
        transformation: m.transformation
      })),
      custom_fields_created: customFields.map(cf => cf.name),
      exported_at: new Date().toISOString()
    });
  } catch (error) {
    // Silently fail if audit table doesn't exist
    console.warn('Could not log export:', error);
  }
}

/**
 * Validate mappings before export
 */
export function validateMappings(
  mappings: FieldMapping[],
  targetFields: TargetField[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const mappedTargets = new Set<string>();
  
  // Check for required fields
  const requiredFields = targetFields.filter(tf => tf.required);
  for (const required of requiredFields) {
    const isMapped = mappings.some(m => m.targetField === required.name && !m.skip);
    if (!isMapped) {
      errors.push(`Required field "${required.label}" is not mapped`);
    }
  }
  
  // Check for duplicate target mappings
  for (const mapping of mappings) {
    if (mapping.skip || !mapping.targetField) continue;
    
    if (mappedTargets.has(mapping.targetField)) {
      errors.push(`Field "${mapping.targetField}" is mapped multiple times`);
    }
    mappedTargets.add(mapping.targetField);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export const mcpFieldMappingService = {
  applyTransformation,
  detectDataType,
  transformDataWithMappings,
  buildExportPayload,
  exportWithMappings,
  validateMappings
};
