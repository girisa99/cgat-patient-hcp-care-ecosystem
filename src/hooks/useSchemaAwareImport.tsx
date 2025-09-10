/**
 * SCHEMA-AWARE IMPORT HOOK
 * Handles dynamic column creation and flexible data mapping
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface SchemaMapping {
  sourceField: string;
  targetColumn: string;
  dataType: string;
  isNewColumn?: boolean;
}

interface ImportOptions {
  table: string;
  createMissingColumns?: boolean;
  schemaMapping?: SchemaMapping[];
  batchSize?: number;
}

export const useSchemaAwareImport = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [schemaAnalysis, setSchemaAnalysis] = useState<{
    existingColumns: string[];
    newFields: string[];
    mappingSuggestions: SchemaMapping[];
  } | null>(null);

  const { showSuccess, showError } = useMasterToast();

  // Analyze incoming data against existing table schema
  const analyzeDataSchema = async (data: Array<Record<string, any>>, tableName: string) => {
    setIsAnalyzing(true);
    
    try {
      // Get existing table columns
      const { data: existingColumns } = await supabase
        .rpc('get_complete_schema_info');
      
      const tableInfo = Array.isArray(existingColumns) ? 
        existingColumns.find((t: any) => t.table_name === tableName) : null;
      const existingColumnNames = (tableInfo as any)?.columns?.map((c: any) => c.column_name) || [];
      
      // Analyze data fields
      const allDataFields = new Set<string>();
      data.forEach(row => {
        Object.keys(row).forEach(key => allDataFields.add(key));
      });
      
      const newFields = Array.from(allDataFields).filter(
        field => !existingColumnNames.includes(field)
      );
      
      // Generate mapping suggestions
      const mappingSuggestions: SchemaMapping[] = Array.from(allDataFields).map(field => {
        const sampleValue = data.find(row => row[field] !== null && row[field] !== undefined)?.[field];
        const dataType = inferDataType(sampleValue);
        
        return {
          sourceField: field,
          targetColumn: field.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          dataType,
          isNewColumn: !existingColumnNames.includes(field)
        };
      });
      
      setSchemaAnalysis({
        existingColumns: existingColumnNames,
        newFields,
        mappingSuggestions
      });
      
      return { existingColumns: existingColumnNames, newFields, mappingSuggestions };
      
    } catch (error) {
      showError('Schema Analysis Failed', 'Could not analyze data schema');
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Infer data type from sample value
  const inferDataType = (value: any): string => {
    if (value === null || value === undefined) return 'text';
    
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'integer' : 'numeric';
    }
    if (Array.isArray(value)) return 'jsonb';
    if (typeof value === 'object') return 'jsonb';
    
    if (typeof value === 'string') {
      // Email pattern
      if (value.includes('@') && value.includes('.')) return 'text';
      // Date pattern
      if (!isNaN(Date.parse(value))) return 'timestamp with time zone';
      // UUID pattern
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return 'uuid';
    }
    
    return 'text';
  };

  // Create missing columns via migration
  const createMissingColumns = async (tableName: string, newColumns: SchemaMapping[]) => {
    if (newColumns.length === 0) return;
    
    try {
      // For now, show a warning that manual migration is needed
      const columnDefs = newColumns
        .filter(col => col.isNewColumn)
        .map(col => `${col.targetColumn} ${col.dataType}`)
        .join(', ');
      
      console.warn(`Manual migration needed for table ${tableName}: ADD COLUMN ${columnDefs}`);
      showSuccess('Schema Analysis Complete', `Identified ${newColumns.length} new columns. Manual migration may be required.`);
    } catch (error) {
      showError('Schema Update Failed', 'Could not create new columns');
      throw error;
    }
  };

  // Import data with schema mapping
  const importWithSchemaMapping = async (
    data: Array<Record<string, any>>, 
    options: ImportOptions
  ) => {
    setIsImporting(true);
    
    try {
      const { table, createMissingColumns: createColumns, schemaMapping, batchSize = 100 } = options;
      
      // Analyze schema if not provided
      let mapping = schemaMapping;
      if (!mapping) {
        const analysis = await analyzeDataSchema(data, table);
        mapping = analysis.mappingSuggestions;
      }
      
      // Create missing columns if requested
      if (createColumns && mapping) {
        await createMissingColumns(table, mapping.filter(m => m.isNewColumn));
      }
      
      // Transform data according to mapping
      const transformedData = data.map(row => {
        const transformed: Record<string, any> = {};
        
        mapping?.forEach(map => {
          if (row[map.sourceField] !== undefined) {
            transformed[map.targetColumn] = transformValue(row[map.sourceField], map.dataType);
          }
        });
        
        return transformed;
      });
      
      // Batch insert with dynamic table name (using any to bypass type checking)
      const results = [];
      for (let i = 0; i < transformedData.length; i += batchSize) {
        const batch = transformedData.slice(i, i + batchSize);
        const { data: insertResult, error } = await (supabase as any)
          .from(table)
          .insert(batch)
          .select();
        
        if (error) throw error;
        results.push(...(insertResult || []));
      }
      
      showSuccess('Import Complete', `Successfully imported ${results.length} records`);
      return results;
      
    } catch (error) {
      showError('Import Failed', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  // Transform value according to target data type
  const transformValue = (value: any, targetType: string): any => {
    if (value === null || value === undefined) return null;
    
    switch (targetType) {
      case 'boolean':
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true' || value === '1';
        }
        return Boolean(value);
      
      case 'integer':
        return parseInt(String(value), 10);
      
      case 'numeric':
        return parseFloat(String(value));
      
      case 'jsonb':
        return typeof value === 'object' ? value : JSON.parse(String(value));
      
      case 'timestamp with time zone':
        return new Date(value).toISOString();
      
      default:
        return String(value);
    }
  };

  // Export data with schema (using any to bypass type checking)
  const exportWithSchema = async (tableName: string, format: 'csv' | 'json') => {
    try {
      const { data, error } = await (supabase as any)
        .from(tableName)
        .select('*');
      
      if (error) throw error;
      
      if (format === 'csv') {
        return convertToCSV(data || []);
      } else {
        return JSON.stringify(data, null, 2);
      }
    } catch (error) {
      showError('Export Failed', 'Could not export data');
      throw error;
    }
  };

  const convertToCSV = (data: Array<Record<string, any>>): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle complex types
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value || '').replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  return {
    // Analysis
    analyzeDataSchema,
    schemaAnalysis,
    isAnalyzing,
    
    // Import
    importWithSchemaMapping,
    createMissingColumns,
    isImporting,
    
    // Export
    exportWithSchema,
    
    // Utilities
    inferDataType,
    transformValue,
    convertToCSV
  };
};