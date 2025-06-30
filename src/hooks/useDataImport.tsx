
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  SEED_THERAPIES, 
  SEED_MANUFACTURERS, 
  SEED_MODALITIES, 
  SEED_PRODUCTS, 
  SEED_SERVICES, 
  SEED_SERVICE_PROVIDERS, 
  SEED_CLINICAL_TRIALS, 
  SEED_COMMERCIAL_PRODUCTS,
  SERVICE_CAPABILITIES
} from '@/data/seedData';

export const useDataImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadSeedData = async () => {
    setIsLoading(true);
    try {
      console.log('🚀 Starting seed data import...');

      // 1. Load therapies
      console.log('📊 Loading therapies...');
      const { error: therapiesError } = await supabase
        .from('therapies')
        .upsert(SEED_THERAPIES, { onConflict: 'name' });
      
      if (therapiesError) throw therapiesError;

      // 2. Load manufacturers
      console.log('🏭 Loading manufacturers...');
      const { error: manufacturersError } = await supabase
        .from('manufacturers')
        .upsert(SEED_MANUFACTURERS, { onConflict: 'name' });
      
      if (manufacturersError) throw manufacturersError;

      // 3. Load modalities
      console.log('🧬 Loading modalities...');
      const { error: modalitiesError } = await supabase
        .from('modalities')
        .upsert(SEED_MODALITIES, { onConflict: 'name' });
      
      if (modalitiesError) throw modalitiesError;

      // 4. Load products
      console.log('💊 Loading products...');
      const { error: productsError } = await supabase
        .from('products')
        .upsert(SEED_PRODUCTS, { onConflict: 'name' });
      
      if (productsError) throw productsError;

      // 5. Load services
      console.log('🔧 Loading services...');
      const { error: servicesError } = await supabase
        .from('services')
        .upsert(SEED_SERVICES, { onConflict: 'name' });
      
      if (servicesError) throw servicesError;

      // 6. Load service providers
      console.log('🏢 Loading service providers...');
      const { error: providersError } = await supabase
        .from('service_providers')
        .upsert(SEED_SERVICE_PROVIDERS, { onConflict: 'name' });
      
      if (providersError) throw providersError;

      // 7. Load service provider capabilities
      console.log('⚡ Loading service capabilities...');
      const { error: capabilitiesError } = await supabase
        .from('service_provider_capabilities')
        .upsert(SERVICE_CAPABILITIES);
      
      if (capabilitiesError) throw capabilitiesError;

      // 8. Load clinical trials
      console.log('🧪 Loading clinical trials...');
      const { error: trialsError } = await supabase
        .from('clinical_trials')
        .upsert(SEED_CLINICAL_TRIALS, { onConflict: 'nct_number' });
      
      if (trialsError) throw trialsError;

      // 9. Load commercial products
      console.log('💼 Loading commercial products...');
      const { error: commercialError } = await supabase
        .from('commercial_products')
        .upsert(SEED_COMMERCIAL_PRODUCTS);
      
      if (commercialError) throw commercialError;

      console.log('✅ All seed data loaded successfully!');
      toast({
        title: "Success!",
        description: "All seed data has been loaded into the database successfully.",
      });

    } catch (error: any) {
      console.error('❌ Error loading seed data:', error);
      toast({
        title: "Error",
        description: `Failed to load seed data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

        return processed;
      });

      const { error } = await supabase
        .from(tableName)
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
    loadSeedData,
    importCSVData,
    isLoading
  };
};
