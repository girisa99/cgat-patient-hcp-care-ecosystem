
/**
 * Schema Analysis Utilities - Enhanced Implementation
 */

import { supabase } from '@/integrations/supabase/client';

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default?: any;
}

export interface SchemaAnalysis {
  tableName: string;
  columns: ColumnInfo[];
  suggestedModuleName: string;
  suggestedRequiredFields: string[];
  suggestedOptionalFields: string[];
  hasCreatedAt: boolean;
  hasUpdatedAt: boolean;
  hasStatus: boolean;
  hasId: boolean;
  hasNameField: boolean;
  hasUserReference: boolean;
  hasEmail: boolean;
  recordCount?: number;
}

/**
 * Get actual table information using a safer approach
 */
export const analyzeTable = async (tableName: string): Promise<SchemaAnalysis | null> => {
  try {
    console.log(`🔍 Analyzing table: ${tableName}`);
    
    // Use RPC call to get table info through the existing edge function
    const { data: tableInfo, error } = await supabase.functions.invoke('get-table-info', {
      body: { tableName }
    });

    if (error) {
      console.error(`Error fetching table info for ${tableName}:`, error);
      return null;
    }

    if (!tableInfo || !tableInfo.columns) {
      console.log(`No table info found for: ${tableName}`);
      return null;
    }

    const columnInfos: ColumnInfo[] = tableInfo.columns.map((col: any) => ({
      name: col.column_name || col.name,
      type: col.data_type || col.type,
      nullable: col.is_nullable === 'YES' || col.nullable === true,
      default: col.column_default || col.default
    }));

    const hasId = columnInfos.some(col => col.name === 'id');
    const hasCreatedAt = columnInfos.some(col => col.name === 'created_at');
    const hasUpdatedAt = columnInfos.some(col => col.name === 'updated_at');
    const hasStatus = columnInfos.some(col => col.name.includes('status') || col.name === 'is_active');
    const hasNameField = columnInfos.some(col => col.name === 'name' || col.name === 'title' || col.name.includes('name'));
    const hasUserReference = columnInfos.some(col => col.name === 'user_id' || col.name === 'created_by' || col.name === 'assigned_by');
    const hasEmail = columnInfos.some(col => col.name === 'email');

    // Get record count to assess table usage
    let recordCount = 0;
    try {
      const { count } = await supabase
        .from(tableName as any)
        .select('*', { count: 'exact', head: true });
      recordCount = count || 0;
    } catch (e) {
      console.log(`Could not get record count for ${tableName}`);
    }

    // Determine required vs optional fields with enhanced logic
    const requiredFields = columnInfos
      .filter(col => !col.nullable && 
        col.name !== 'id' && 
        !col.name.includes('created_at') && 
        !col.name.includes('updated_at') &&
        col.default === null)
      .map(col => col.name);

    const optionalFields = columnInfos
      .filter(col => col.nullable && col.name !== 'id')
      .map(col => col.name);

    const analysis: SchemaAnalysis = {
      tableName,
      columns: columnInfos,
      suggestedModuleName: toPascalCase(tableName),
      suggestedRequiredFields: requiredFields,
      suggestedOptionalFields: optionalFields,
      hasCreatedAt,
      hasUpdatedAt,
      hasStatus,
      hasId,
      hasNameField,
      hasUserReference,
      hasEmail,
      recordCount
    };

    console.log(`✅ Successfully analyzed table ${tableName}:`, analysis);
    return analysis;

  } catch (error) {
    console.error(`Failed to analyze table ${tableName}:`, error);
    return null;
  }
};

export const calculateConfidence = (analysis: SchemaAnalysis): number => {
  let confidence = 0.3; // Lower base confidence
  
  // Core database structure indicators
  if (analysis.hasId) confidence += 0.15;
  if (analysis.hasCreatedAt) confidence += 0.1;
  if (analysis.hasUpdatedAt) confidence += 0.05;
  
  // Business logic indicators
  if (analysis.hasNameField) confidence += 0.15; // Name field is very important
  if (analysis.suggestedRequiredFields.length > 0) confidence += 0.1;
  if (analysis.hasStatus) confidence += 0.1;
  if (analysis.hasUserReference) confidence += 0.1; // User association indicates business use
  
  // Data quality indicators
  if (analysis.recordCount && analysis.recordCount > 0) confidence += 0.1; // Has actual data
  if (analysis.hasEmail) confidence += 0.05; // Email suggests user-facing
  
  // Column count assessment
  const columnCount = analysis.columns.length;
  if (columnCount >= 5 && columnCount <= 15) confidence += 0.1; // Good range for business entities
  else if (columnCount > 15) confidence -= 0.05; // Too complex might be system table
  else if (columnCount < 3) confidence -= 0.1; // Too simple might be lookup table
  
  // Business entity name patterns
  const businessPatterns = ['user', 'customer', 'patient', 'order', 'product', 'facility', 'module', 'role', 'permission'];
  const tableLower = analysis.tableName.toLowerCase();
  if (businessPatterns.some(pattern => tableLower.includes(pattern))) {
    confidence += 0.1;
  }
  
  // System table penalties
  const systemPatterns = ['log', 'audit', 'temp', 'cache', 'session', 'token', 'key'];
  if (systemPatterns.some(pattern => tableLower.includes(pattern))) {
    confidence -= 0.15;
  }
  
  return Math.max(0.2, Math.min(confidence, 1.0)); // Keep between 20% and 100%
};

export const toPascalCase = (str: string): string => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};
