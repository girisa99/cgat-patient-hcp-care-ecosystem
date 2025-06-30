
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useJsonDataImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadJsonData = async (jsonData: any) => {
    setIsLoading(true);
    try {
      console.log('🚀 Starting JSON data import...');
      console.log('📊 Input data structure:', {
        hasTherapies: !!jsonData.therapies,
        hasManufacturers: !!jsonData.manufacturers,
        hasModalities: !!jsonData.modalities,
        hasServices: !!jsonData.services,
        hasServiceProviders: !!jsonData.service_providers,
        therapiesCount: jsonData.therapies?.length || 0,
        manufacturersCount: jsonData.manufacturers?.length || 0,
        modalitiesCount: jsonData.modalities?.length || 0,
        servicesCount: jsonData.services?.length || 0,
        serviceProvidersCount: jsonData.service_providers?.length || 0
      });

      // Helper function to safely insert data with duplicate checking
      const safeInsert = async (tableName: string, data: any[], uniqueField: string) => {
        console.log(`📊 Loading ${tableName}...`);
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log(`⚠️ No data provided for ${tableName}`);
          return 0;
        }

        console.log(`📊 Sample ${tableName} data:`, data[0]);
        
        let successCount = 0;
        
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          console.log(`📊 Processing ${tableName} ${i + 1}:`, {
            [uniqueField]: item[uniqueField]
          });

          try {
            // Check if item already exists
            const { data: existingData, error: checkError } = await supabase
              .from(tableName as any)
              .select('id')
              .eq(uniqueField, item[uniqueField])
              .maybeSingle();

            if (checkError && checkError.code !== 'PGRST116') {
              console.error(`❌ Error checking existing ${tableName}:`, checkError);
              continue;
            }

            if (existingData) {
              console.log(`⚠️ ${tableName} with ${uniqueField} "${item[uniqueField]}" already exists, skipping...`);
              continue;
            }

            // Insert new item using simple insert (no ON CONFLICT)
            const { error: insertError } = await supabase
              .from(tableName as any)
              .insert(item);

            if (insertError) {
              console.error(`❌ Error inserting ${tableName}:`, insertError);
              continue;
            }

            successCount++;
            console.log(`✅ Successfully inserted ${tableName}: ${item[uniqueField]}`);
          } catch (error) {
            console.error(`❌ Unexpected error processing ${tableName}:`, error);
            continue;
          }
        }

        console.log(`✅ ${tableName} completed: ${successCount}/${data.length} items processed`);
        return successCount;
      };

      let results = {
        therapies: 0,
        manufacturers: 0,
        modalities: 0,
        services: 0,
        service_providers: 0
      };

      // 1. Load therapies - map to actual schema
      if (jsonData.therapies && Array.isArray(jsonData.therapies)) {
        const therapiesData = jsonData.therapies.map((therapy: any) => ({
          name: therapy.name,
          therapy_type: 'cell_gene_therapy', // Use valid enum value
          description: therapy.description,
          is_active: true
          // Remove indication_areas as it doesn't exist in the schema
        }));

        results.therapies = await safeInsert('therapies', therapiesData, 'name');
      }

      // 2. Load manufacturers - map to actual schema
      if (jsonData.manufacturers && Array.isArray(jsonData.manufacturers)) {
        const manufacturersData = jsonData.manufacturers.map((mfg: any) => ({
          name: mfg.name,
          manufacturer_type: mfg.manufacturer_type || 'biopharmaceutical',
          headquarters_location: mfg.headquarters_location,
          quality_certifications: Array.isArray(mfg.quality_certifications) ? mfg.quality_certifications : [],
          manufacturing_capabilities: Array.isArray(mfg.manufacturing_capabilities) ? mfg.manufacturing_capabilities : [],
          partnership_tier: mfg.partnership_tier || 'tier_3',
          is_active: true
        }));

        results.manufacturers = await safeInsert('manufacturers', manufacturersData, 'name');
      }

      // 3. Load modalities - fix enum values
      if (jsonData.modalities && Array.isArray(jsonData.modalities)) {
        const modalitiesData = jsonData.modalities.map((modality: any) => {
          // Map invalid enum values to valid ones
          let modalityType = 'cell_therapy'; // default
          if (modality.modality_type === 'gene_therapy' || modality.modality_type === 'gene_editing') {
            modalityType = 'gene_therapy_crispr';
          } else if (modality.modality_type === 'cell_therapy') {
            modalityType = 'cell_therapy_car_t';
          }

          return {
            name: modality.name,
            modality_type: modalityType,
            description: modality.description,
            administration_requirements: modality.administration_requirements,
            cold_chain_requirements: modality.cold_chain_requirements,
            manufacturing_complexity: modality.manufacturing_complexity || 'medium',
            is_active: true
          };
        });

        results.modalities = await safeInsert('modalities', modalitiesData, 'name');
      }

      // 4. Load services - remove capabilities field that doesn't exist
      if (jsonData.services && Array.isArray(jsonData.services)) {
        const servicesData = jsonData.services.map((service: any) => ({
          name: service.name,
          service_type: service.service_type,
          description: service.description,
          geographic_coverage: Array.isArray(service.geographic_coverage) ? service.geographic_coverage : [],
          is_active: true
          // Remove capabilities field as it doesn't exist in schema
        }));

        results.services = await safeInsert('services', servicesData, 'name');
      }

      // 5. Load service providers - remove certifications field that doesn't exist
      if (jsonData.service_providers && Array.isArray(jsonData.service_providers)) {
        const providersData = jsonData.service_providers.map((provider: any) => {
          // Map provider types to valid enum values
          let providerType = 'third_party'; // default
          if (provider.provider_type === 'logistics') {
            providerType = 'external_partner';
          } else if (provider.provider_type === 'manufacturing') {
            providerType = 'internal';
          }

          return {
            name: provider.name,
            provider_type: providerType,
            specializations: Array.isArray(provider.specializations) ? provider.specializations : [],
            geographic_coverage: Array.isArray(provider.geographic_coverage) ? provider.geographic_coverage : [],
            contact_info: provider.contact_info || {},
            is_active: true
            // Remove certifications field as it doesn't exist in schema
          };
        });

        results.service_providers = await safeInsert('service_providers', providersData, 'name');
      }

      console.log('✅ All JSON data loaded successfully!');
      toast({
        title: "Success!",
        description: `JSON data imported: ${results.therapies} therapies, ${results.manufacturers} manufacturers, ${results.modalities} modalities, ${results.services} services, ${results.service_providers} providers`,
      });

      return results;

    } catch (error: any) {
      console.error('❌ Error loading JSON data:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      toast({
        title: "Error",
        description: `Failed to load JSON data: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadJsonData,
    isLoading
  };
};
