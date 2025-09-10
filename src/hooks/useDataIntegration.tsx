/**
 * DATA INTEGRATION HOOK
 * Handles multiple data formats and update methods for enrollment data
 * Supports JSON, CSV, API integration with existing tables via edge functions
 */
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DataIntegrationOptions {
  tableName: string;
  moduleType: string;
  format: 'json' | 'csv' | 'api';
  mapping?: Record<string, string>; // Field mapping for data transformation
}

interface ImportResult {
  success: number;
  errors: number;
  details: Array<{ row: number; error: string }>;
}

export const useDataIntegration = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Import data from JSON via API
  const importFromJSON = useCallback(async (
    data: any[], 
    options: DataIntegrationOptions
  ): Promise<ImportResult> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const { data: result, error } = await supabase.functions.invoke('data-integration', {
        body: {
          operation: 'import',
          tableName: options.tableName,
          data,
          mapping: options.mapping
        }
      });

      if (error) throw error;

      toast({
        title: "Import Complete",
        description: `${result.success} records imported, ${result.errors} errors`,
      });

      return result;
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [toast]);

  // Import data from CSV
  const importFromCSV = useCallback(async (
    csvContent: string,
    options: DataIntegrationOptions
  ): Promise<ImportResult> => {
    const rows = parseCSV(csvContent);
    const jsonData = convertCSVToJSON(rows);
    return importFromJSON(jsonData, options);
  }, [importFromJSON]);

  // Export data to JSON
  const exportToJSON = useCallback(async (
    tableName: string,
    filters?: Record<string, any>
  ) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('data-integration', {
        body: {
          operation: 'export',
          tableName,
          filters,
          format: 'json'
        }
      });

      if (error) throw error;

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableName}_export_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `${result.count} records exported to JSON`,
      });

      return result.data;
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Export data to CSV
  const exportToCSV = useCallback(async (
    tableName: string,
    filters?: Record<string, any>
  ) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('data-integration', {
        body: {
          operation: 'export',
          tableName,
          filters,
          format: 'csv'
        }
      });

      if (error) throw error;

      const blob = new Blob([result.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableName}_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `${result.count} records exported to CSV`,
      });

      return result.data;
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Update single record via API
  const updateRecord = useCallback(async (
    tableName: string,
    id: string,
    data: Record<string, any>
  ) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('data-integration', {
        body: {
          operation: 'update',
          tableName,
          data: { id, updates: data }
        }
      });

      if (error) throw error;

      toast({
        title: "Record Updated",
        description: "Data has been successfully updated",
      });

      return result;
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Import data from external API
  const importFromAPI = useCallback(async (
    apiEndpoint: string,
    options: DataIntegrationOptions,
    headers?: Record<string, string>
  ): Promise<ImportResult> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const { data: result, error } = await supabase.functions.invoke('data-integration', {
        body: {
          operation: 'import_from_api',
          tableName: options.tableName,
          apiEndpoint,
          headers,
          mapping: options.mapping
        }
      });

      if (error) throw error;

      toast({
        title: "API Import Complete",
        description: `${result.success} records imported from API, ${result.errors} errors`,
      });

      return result;
    } catch (error) {
      toast({
        title: "API Import Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [toast]);

  // Sync data to external API
  const syncToAPI = useCallback(async (
    tableName: string,
    apiEndpoint: string,
    filters?: Record<string, any>,
    headers?: Record<string, string>
  ) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('data-integration', {
        body: {
          operation: 'sync_to_api',
          tableName,
          apiEndpoint,
          filters,
          headers
        }
      });

      if (error) throw error;

      toast({
        title: "API Sync Complete",
        description: `${result.count} records synced to external API`,
      });

      return result;
    } catch (error) {
      toast({
        title: "API Sync Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Bulk update records
  const bulkUpdate = useCallback(async (
    tableName: string,
    updates: Array<{ id: string; data: Record<string, any> }>
  ): Promise<ImportResult> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const { data: result, error } = await supabase.functions.invoke('data-integration', {
        body: {
          operation: 'bulk_update',
          tableName,
          data: updates
        }
      });

      if (error) throw error;

      toast({
        title: "Bulk Update Complete",
        description: `${result.success} records updated, ${result.errors} errors`,
      });

      return result;
    } catch (error) {
      toast({
        title: "Bulk Update Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [toast]);

  return {
    isProcessing,
    progress,
    importFromJSON,
    importFromCSV,
    importFromAPI,
    exportToJSON,
    exportToCSV,
    updateRecord,
    bulkUpdate,
    syncToAPI
  };
};

// Utility functions
function transformData(data: any, mapping?: Record<string, string>): any {
  if (!mapping) return data;
  
  const transformed: any = {};
  Object.entries(data).forEach(([key, value]) => {
    const mappedKey = mapping[key] || key;
    transformed[mappedKey] = value;
  });
  
  return transformed;
}

function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.trim().split('\n');
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  });
}

function convertCSVToJSON(rows: string[][]): any[] {
  if (rows.length === 0) return [];
  
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

function convertJSONToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      // Escape values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}