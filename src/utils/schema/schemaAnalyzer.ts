
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

/**
 * ENHANCED confidence calculation - much more generous for working systems
 */
export const calculateConfidence = (analysis: SchemaAnalysis): number => {
  let confidence = 0.6; // Higher base confidence for existing tables
  
  console.log(`🎯 Calculating confidence for ${analysis.tableName}:`);
  
  // Core database structure indicators (higher weights)
  if (analysis.hasId) {
    confidence += 0.15;
    console.log(`  ✓ Has ID field: +15%`);
  }
  if (analysis.hasCreatedAt) {
    confidence += 0.12;
    console.log(`  ✓ Has created_at: +12%`);
  }
  if (analysis.hasUpdatedAt) {
    confidence += 0.08;
    console.log(`  ✓ Has updated_at: +8%`);
  }
  
  // Business logic indicators (higher weights)
  if (analysis.hasNameField) {
    confidence += 0.15; // Name field is very important
    console.log(`  ✓ Has name field: +15%`);
  }
  if (analysis.suggestedRequiredFields.length > 0) {
    confidence += 0.1;
    console.log(`  ✓ Has required fields (${analysis.suggestedRequiredFields.length}): +10%`);
  }
  if (analysis.hasStatus) {
    confidence += 0.1;
    console.log(`  ✓ Has status field: +10%`);
  }
  if (analysis.hasUserReference) {
    confidence += 0.12; // User association indicates business use
    console.log(`  ✓ Has user reference: +12%`);
  }
  
  // Data quality indicators
  if (analysis.recordCount && analysis.recordCount > 0) {
    confidence += 0.15; // Has actual data - very important
    console.log(`  ✓ Has data (${analysis.recordCount} records): +15%`);
  }
  if (analysis.hasEmail) {
    confidence += 0.08; // Email suggests user-facing
    console.log(`  ✓ Has email field: +8%`);
  }
  
  // Column count assessment (more generous)
  const columnCount = analysis.columns.length;
  if (columnCount >= 3 && columnCount <= 20) {
    confidence += 0.1; // Good range for business entities
    console.log(`  ✓ Good column count (${columnCount}): +10%`);
  } else if (columnCount > 20) {
    confidence -= 0.02; // Slight penalty for very complex tables
    console.log(`  ⚠ Many columns (${columnCount}): -2%`);
  }
  
  // Business entity name patterns (higher bonus)
  const businessPatterns = ['user', 'customer', 'patient', 'order', 'product', 'facility', 'module', 'role', 'permission', 'profile'];
  const tableLower = analysis.tableName.toLowerCase();
  const matchingPattern = businessPatterns.find(pattern => tableLower.includes(pattern));
  if (matchingPattern) {
    confidence += 0.15;
    console.log(`  ✓ Business entity pattern (${matchingPattern}): +15%`);
  }
  
  // System table penalties (reduced)
  const systemPatterns = ['log', 'audit', 'temp', 'cache', 'session', 'token', 'key'];
  const systemPattern = systemPatterns.find(pattern => tableLower.includes(pattern));
  if (systemPattern && !tableLower.includes('audit_log')) { // Don't penalize audit_logs as much
    confidence -= 0.1;
    console.log(`  ⚠ System table pattern (${systemPattern}): -10%`);
  }

  // Special bonus for known important tables
  const importantTables = ['profiles', 'users', 'facilities', 'modules', 'roles', 'permissions'];
  if (importantTables.includes(tableLower)) {
    confidence += 0.2;
    console.log(`  ⭐ Important system table: +20%`);
  }
  
  const finalConfidence = Math.max(0.4, Math.min(confidence, 1.0)); // Between 40% and 100%
  console.log(`  🎯 Final confidence: ${Math.round(finalConfidence * 100)}%`);
  
  return finalConfidence;
};

export const toPascalCase = (str: string): string => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};
