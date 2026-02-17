/**
 * Dynamic Field Mapping Service
 * Fully flexible mapping for any document type with variable fields
 * Supports CSV, JSON, and API/middleware export
 */

import { supabase } from '@/integrations/supabase/client';

export interface DynamicSourceField {
  name: string;
  value: any;
  type: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone' | 'unknown';
  source: 'ocr' | 'nlp' | 'manual';
}

export interface DynamicTargetField {
  name: string;
  type: string;
  required: boolean;
  label: string;
  isCustom?: boolean;
  apiPath?: string; // For nested API structures
}

export interface DynamicFieldMapping {
  sourceField: string;
  targetField: string;
  transformation: TransformationType;
  skip: boolean;
  createCustom: boolean;
  customFieldName?: string;
  dataType?: string;
}

export type TransformationType = 
  | 'none' 
  | 'uppercase' 
  | 'lowercase' 
  | 'trim' 
  | 'date_iso' 
  | 'date_us' 
  | 'date_eu'
  | 'number' 
  | 'integer'
  | 'boolean' 
  | 'array'
  | 'json_stringify';

export type ExportFormat = 'json' | 'csv' | 'xml' | 'form-data';

export interface ExportConfig {
  format: ExportFormat;
  target: 'salesforce' | 'hubspot' | 'veeva' | 'supabase' | 'webhook' | 'api' | 'middleware';
  endpoint?: string;
  headers?: Record<string, string>;
  authType?: 'bearer' | 'api_key' | 'basic' | 'oauth2' | 'none';
  apiKey?: string;
  syncType: 'create' | 'update' | 'upsert';
  batchSize?: number;
  webhookUrl?: string;
}

export interface MappingTemplate {
  id: string;
  name: string;
  documentType: string;
  targetSystem: string;
  mappings: DynamicFieldMapping[];
  createdAt: string;
}

/**
 * Detect data type from value
 */
export function detectFieldType(value: any): DynamicSourceField['type'] {
  if (value === null || value === undefined) return 'unknown';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  
  const str = String(value).trim();
  
  // Date patterns
  if (/^\d{4}-\d{2}-\d{2}/.test(str) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(str)) {
    return 'date';
  }
  
  // Number
  if (/^-?\d+\.?\d*$/.test(str)) return 'number';
  
  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return 'email';
  
  // Phone
  if (/^[\d\s\-\+\(\)]{10,}$/.test(str)) return 'phone';
  
  return 'string';
}

/**
 * Convert extracted data to dynamic source fields
 */
export function extractToSourceFields(
  extractedData: Record<string, any>,
  extractionSources?: Record<string, 'ocr' | 'nlp' | 'manual'>
): DynamicSourceField[] {
  const fields: DynamicSourceField[] = [];
  
  for (const [name, value] of Object.entries(extractedData)) {
    if (value !== null && value !== undefined && value !== '') {
      fields.push({
        name,
        value,
        type: detectFieldType(value),
        source: extractionSources?.[name] || 'nlp'
      });
    }
  }
  
  return fields;
}

/**
 * Apply transformation to value
 */
export function applyTransformation(value: any, transformation: TransformationType): any {
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
        return new Date(strValue).toISOString();
      } catch {
        return strValue;
      }
      
    case 'date_us':
      try {
        const d = new Date(strValue);
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      } catch {
        return strValue;
      }
      
    case 'date_eu':
      try {
        const d = new Date(strValue);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      } catch {
        return strValue;
      }
      
    case 'number':
      const num = parseFloat(strValue.replace(/[^\d.-]/g, ''));
      return isNaN(num) ? 0 : num;
      
    case 'integer':
      const int = parseInt(strValue.replace(/[^\d-]/g, ''), 10);
      return isNaN(int) ? 0 : int;
      
    case 'boolean':
      const lower = strValue.toLowerCase();
      return ['true', 'yes', '1', 'on', 'y'].includes(lower);
      
    case 'array':
      return strValue.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
      
    case 'json_stringify':
      return JSON.stringify(value);
      
    case 'none':
    default:
      return value;
  }
}

/**
 * Transform source data using dynamic mappings
 */
export function transformWithMappings(
  sourceFields: DynamicSourceField[],
  mappings: DynamicFieldMapping[]
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const mapping of mappings) {
    if (mapping.skip || !mapping.targetField) continue;
    
    const sourceField = sourceFields.find(f => f.name === mapping.sourceField);
    if (!sourceField) continue;
    
    const transformedValue = applyTransformation(
      sourceField.value, 
      mapping.transformation || 'none'
    );
    
    // Handle nested paths (e.g., "properties.firstname" for HubSpot)
    if (mapping.targetField.includes('.')) {
      const parts = mapping.targetField.split('.');
      let current = result;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = transformedValue;
    } else {
      result[mapping.targetField] = transformedValue;
    }
  }
  
  return result;
}

/**
 * Convert data to CSV format
 */
export function toCSV(
  data: Record<string, any>[], 
  includeHeaders: boolean = true
): string {
  if (data.length === 0) return '';
  
  // Get all unique keys across all records
  const allKeys = [...new Set(data.flatMap(d => Object.keys(d)))];
  
  const escapeCSV = (val: any): string => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const lines: string[] = [];
  
  if (includeHeaders) {
    lines.push(allKeys.join(','));
  }
  
  for (const record of data) {
    const values = allKeys.map(key => escapeCSV(record[key]));
    lines.push(values.join(','));
  }
  
  return lines.join('\n');
}

/**
 * Convert data to JSON format (pretty or compact)
 */
export function toJSON(data: any, pretty: boolean = true): string {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Export data in specified format
 */
export async function exportData(
  sourceFields: DynamicSourceField[],
  mappings: DynamicFieldMapping[],
  customFields: DynamicTargetField[],
  config: ExportConfig
): Promise<{
  success: boolean;
  format: ExportFormat;
  data: string | Record<string, any>;
  recordCount: number;
  mappedFields: number;
  customFieldsCreated: string[];
  error?: string;
}> {
  try {
    // Transform data using mappings
    const transformedData = transformWithMappings(sourceFields, mappings);
    const activeMappings = mappings.filter(m => m.targetField && !m.skip);
    
    if (activeMappings.length === 0) {
      return {
        success: false,
        format: config.format,
        data: {},
        recordCount: 0,
        mappedFields: 0,
        customFieldsCreated: [],
        error: 'No fields mapped for export'
      };
    }
    
    let exportedData: string | Record<string, any>;
    
    switch (config.format) {
      case 'csv':
        exportedData = toCSV([transformedData]);
        break;
        
      case 'json':
        exportedData = transformedData;
        break;
        
      case 'xml':
        exportedData = objectToXML(transformedData, 'record');
        break;
        
      case 'form-data':
        exportedData = transformedData;
        break;
        
      default:
        exportedData = transformedData;
    }
    
    // Push to target if specified
    if (config.target !== 'supabase' && config.endpoint) {
      await pushToTarget(exportedData, config);
    }
    
    // Store locally for audit
    await storeExportRecord(sourceFields, mappings, customFields, config, transformedData);
    
    return {
      success: true,
      format: config.format,
      data: exportedData,
      recordCount: 1,
      mappedFields: activeMappings.length,
      customFieldsCreated: customFields.map(cf => cf.name)
    };
    
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      format: config.format,
      data: {},
      recordCount: 0,
      mappedFields: 0,
      customFieldsCreated: [],
      error: error instanceof Error ? error.message : 'Export failed'
    };
  }
}

/**
 * Convert object to simple XML
 */
function objectToXML(obj: Record<string, any>, rootName: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>`;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      xml += `\n  <${key}>${objectToXML(value, '')}</${key}>`;
    } else {
      xml += `\n  <${key}>${escapeXML(String(value ?? ''))}</${key}>`;
    }
  }
  
  xml += `\n</${rootName}>`;
  return xml;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Push data to external target (API, webhook, middleware)
 */
async function pushToTarget(
  data: string | Record<string, any>,
  config: ExportConfig
): Promise<void> {
  const { data: result, error } = await supabase.functions.invoke('mcp-data-sync', {
    body: {
      target: config.target,
      endpoint: config.endpoint,
      format: config.format,
      data: typeof data === 'string' ? JSON.parse(data) : data,
      headers: config.headers,
      authType: config.authType,
      syncType: config.syncType
    }
  });
  
  if (error) throw error;
  if (!result?.success) throw new Error(result?.error || 'Push failed');
}

/**
 * Store export record for audit trail
 */
async function storeExportRecord(
  sourceFields: DynamicSourceField[],
  mappings: DynamicFieldMapping[],
  customFields: DynamicTargetField[],
  config: ExportConfig,
  transformedData: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('document_exports' as any).insert({
      target_system: config.target,
      format: config.format,
      endpoint: config.endpoint,
      source_fields: sourceFields.map(f => ({ name: f.name, type: f.type })),
      mapped_fields: mappings.filter(m => !m.skip && m.targetField).map(m => ({
        source: m.sourceField,
        target: m.targetField,
        transformation: m.transformation
      })),
      custom_fields_created: customFields.map(cf => cf.name),
      exported_data: transformedData,
      exported_at: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Could not store export record:', error);
  }
}

/**
 * Fetch target system schema dynamically
 */
export async function fetchTargetSchema(
  targetSystem: string,
  endpoint?: string
): Promise<DynamicTargetField[]> {
  try {
    // Try to fetch from edge function (would call actual CRM APIs)
    const { data, error } = await supabase.functions.invoke('fetch-crm-schema', {
      body: { targetSystem, endpoint }
    });
    
    if (!error && data?.schema) {
      return data.schema;
    }
  } catch {
    // Fall back to stored schemas
  }
  
  // Return empty - UI will allow user to create all fields as custom
  return [];
}

/**
 * Save mapping template for reuse
 */
export async function saveMappingTemplate(
  template: Omit<MappingTemplate, 'id' | 'createdAt'>
): Promise<string> {
  const id = crypto.randomUUID();
  const stored = localStorage.getItem('mappingTemplates') || '[]';
  const templates: MappingTemplate[] = JSON.parse(stored);
  
  templates.push({
    ...template,
    id,
    createdAt: new Date().toISOString()
  });
  
  localStorage.setItem('mappingTemplates', JSON.stringify(templates));
  return id;
}

/**
 * Get saved mapping templates
 */
export function getMappingTemplates(documentType?: string): MappingTemplate[] {
  const stored = localStorage.getItem('mappingTemplates') || '[]';
  const templates: MappingTemplate[] = JSON.parse(stored);
  
  if (documentType) {
    return templates.filter(t => t.documentType === documentType);
  }
  
  return templates;
}

/**
 * Download data as file
 */
export function downloadAsFile(
  data: string | Record<string, any>,
  filename: string,
  format: ExportFormat
): void {
  let content: string;
  let mimeType: string;
  
  switch (format) {
    case 'csv':
      content = typeof data === 'string' ? data : toCSV([data]);
      mimeType = 'text/csv';
      break;
      
    case 'json':
      content = typeof data === 'string' ? data : toJSON(data);
      mimeType = 'application/json';
      break;
      
    case 'xml':
      content = typeof data === 'string' ? data : objectToXML(data, 'export');
      mimeType = 'application/xml';
      break;
      
    default:
      content = typeof data === 'string' ? data : JSON.stringify(data);
      mimeType = 'application/octet-stream';
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const dynamicFieldMappingService = {
  detectFieldType,
  extractToSourceFields,
  applyTransformation,
  transformWithMappings,
  toCSV,
  toJSON,
  exportData,
  fetchTargetSchema,
  saveMappingTemplate,
  getMappingTemplates,
  downloadAsFile
};
