
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDataImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  };

  const importCSVData = async (file: File, tableName: string) => {
    setIsLoading(true);
    try {
      console.log(`📁 Importing CSV data to ${tableName}...`);
      
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        throw new Error('No data found in CSV file');
      }

      // Convert data to match database schema
      const processedData = data.map(row => {
        const processed: any = { ...row };
        
        // Convert arrays (stored as comma-separated strings in CSV)
        if (processed.indication_areas && typeof processed.indication_areas === 'string') {
          processed.indication_areas = processed.indication_areas.split(';').map((s: string) => s.trim());
        }
        if (processed.quality_certifications && typeof processed.quality_certifications === 'string') {
          processed.quality_certifications = processed.quality_certifications.split(';').map((s: string) => s.trim());
        }
        if (processed.manufacturing_capabilities && typeof processed.manufacturing_capabilities === 'string') {
          processed.manufacturing_capabilities = processed.manufacturing_capabilities.split(';').map((s: string) => s.trim());
        }
        if (processed.capabilities && typeof processed.capabilities === 'string') {
          processed.capabilities = processed.capabilities.split(';').map((s: string) => s.trim());
        }
        if (processed.geographic_coverage && typeof processed.geographic_coverage === 'string') {
          processed.geographic_coverage = processed.geographic_coverage.split(';').map((s: string) => s.trim());
        }

        // Convert JSON fields
        if (processed.regulatory_status && typeof processed.regulatory_status === 'string') {
          try {
            processed.regulatory_status = JSON.parse(processed.regulatory_status);
          } catch {
            processed.regulatory_status = {};
          }
        }
        if (processed.contact_info && typeof processed.contact_info === 'string') {
          try {
            processed.contact_info = JSON.parse(processed.contact_info);
          } catch {
            processed.contact_info = {};
          }
        }

        // Convert booleans
        if (processed.is_active === 'true' || processed.is_active === '1') {
          processed.is_active = true;
        } else if (processed.is_active === 'false' || processed.is_active === '0') {
          processed.is_active = false;
        }

        // Ensure proper enum values for specific tables
        if (tableName === 'service_providers' && processed.provider_type) {
          // Map common provider types to valid enum values
          const providerTypeMap: Record<string, string> = {
            'logistics': 'external_partner',
            'distribution': 'external_partner',
            'pharmacy': 'third_party',
            'manufacturing': 'third_party',
            'internal': 'internal'
          };
          processed.provider_type = providerTypeMap[processed.provider_type.toLowerCase()] || 'third_party';
        }

        return processed;
      });

      const { error } = await supabase
        .from(tableName as any)
        .upsert(processedData);

      if (error) throw error;

      toast({
        title: "Import Successful!",
        description: `Successfully imported ${data.length} records to ${tableName} table.`,
      });

    } catch (error: any) {
      console.error(`❌ Error importing CSV data to ${tableName}:`, error);
      toast({
        title: "Import Failed",
        description: `Failed to import data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    importCSVData,
    isLoading
  };
};
