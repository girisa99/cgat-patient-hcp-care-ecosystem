
/**
 * Schema Analysis Utilities - Real Implementation
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
}

/**
 * Get actual table information from the database
 */
export const analyzeTable = async (tableName: string): Promise<SchemaAnalysis | null> => {
  try {
    console.log(`🔍 Analyzing real table: ${tableName}`);
    
    // Get table structure from information_schema
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);

    if (error) {
      console.error(`Error fetching table info for ${tableName}:`, error);
      return null;
    }

    if (!columns || columns.length === 0) {
      console.log(`No columns found for table: ${tableName}`);
      return null;
    }

    const columnInfos: ColumnInfo[] = columns.map(col => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === 'YES',
      default: col.column_default
    }));

    const hasId = columnInfos.some(col => col.name === 'id');
    const hasCreatedAt = columnInfos.some(col => col.name === 'created_at');
    const hasUpdatedAt = columnInfos.some(col => col.name === 'updated_at');
    const hasStatus = columnInfos.some(col => col.name.includes('status') || col.name === 'is_active');

    // Determine required vs optional fields
    const requiredFields = columnInfos
      .filter(col => !col.nullable && col.name !== 'id' && !col.name.includes('created_at') && !col.name.includes('updated_at'))
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
      hasId
    };

    console.log(`✅ Successfully analyzed table ${tableName}:`, analysis);
    return analysis;

  } catch (error) {
    console.error(`Failed to analyze table ${tableName}:`, error);
    return null;
  }
};

export const calculateConfidence = (analysis: SchemaAnalysis): number => {
  let confidence = 0.5; // Base confidence
  
  // Higher confidence for tables with standard fields
  if (analysis.hasId) confidence += 0.2;
  if (analysis.hasCreatedAt) confidence += 0.1;
  if (analysis.suggestedRequiredFields.length > 0) confidence += 0.2;
  if (analysis.hasStatus) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
};

export const toPascalCase = (str: string): string => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};
