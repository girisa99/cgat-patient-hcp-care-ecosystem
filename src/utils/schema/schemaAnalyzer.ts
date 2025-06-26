
/**
 * Schema Analysis Utilities
 * Focused on analyzing table structures and generating configurations
 */

import { Database } from '@/integrations/supabase/types';

type DatabaseTables = keyof Database['public']['Tables'];

export interface SchemaAnalysis {
  tableName: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    defaultValue?: string;
  }[];
  suggestedModuleName: string;
  suggestedRequiredFields: string[];
  suggestedOptionalFields: string[];
  hasCreatedAt: boolean;
  hasUpdatedAt: boolean;
  hasStatus: boolean;
  hasUserId: boolean;
}

/**
 * Analyzes a specific table structure
 */
export const analyzeTable = async (tableName: string): Promise<SchemaAnalysis | null> => {
  try {
    // Since we cannot use raw SQL queries, create analysis based on known table structures
    return createFallbackAnalysis(tableName);
  } catch (error) {
    console.error(`❌ Error analyzing table ${tableName}:`, error);
    return createFallbackAnalysis(tableName);
  }
};

/**
 * Creates fallback analysis for tables when schema scanning fails
 */
export const createFallbackAnalysis = (tableName: string): SchemaAnalysis => {
  const suggestedModuleName = toPascalCase(tableName);
  
  const commonColumns = {
    profiles: ['first_name', 'last_name', 'email'],
    facilities: ['name', 'facility_type'],
    modules: ['name', 'description'],
    roles: ['name'],
    permissions: ['name']
  };
  
  const requiredFields = commonColumns[tableName as keyof typeof commonColumns] || ['name'];
  
  return {
    tableName,
    columns: [],
    suggestedModuleName,
    suggestedRequiredFields: requiredFields,
    suggestedOptionalFields: ['description'],
    hasCreatedAt: true,
    hasUpdatedAt: true,
    hasStatus: false,
    hasUserId: false
  };
};

/**
 * Converts snake_case to PascalCase
 */
export const toPascalCase = (str: string): string => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

/**
 * Calculates confidence score for auto-generated module
 */
export const calculateConfidence = (analysis: SchemaAnalysis): number => {
  let score = 0.5; // Base score

  // Boost confidence for common patterns
  if (analysis.hasCreatedAt) score += 0.2;
  if (analysis.hasUpdatedAt) score += 0.1;
  if (analysis.hasStatus) score += 0.1;
  if (analysis.suggestedRequiredFields.length > 0) score += 0.1;

  // Reduce confidence for system tables
  if (analysis.tableName.startsWith('auth_') || 
      analysis.tableName.startsWith('storage_') ||
      analysis.tableName.includes('_internal')) {
    score -= 0.3;
  }

  return Math.min(1, Math.max(0, score));
};
