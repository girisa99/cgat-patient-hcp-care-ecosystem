
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

      // 1. Load therapies - using only fields that exist in the database
      if (jsonData.therapies && Array.isArray(jsonData.therapies)) {
        console.log('📊 Loading therapies...');
        console.log('📊 Sample therapy data:', jsonData.therapies[0]);
        
        const therapiesData = jsonData.therapies.map((therapy: any, index: number) => {
          console.log(`📊 Processing therapy ${index + 1}:`, {
            name: therapy.name,
            therapy_type: therapy.therapy_type,
            description: therapy.description
          });
          
          return {
            name: therapy.name,
            therapy_type: therapy.therapy_type || 'cell_gene_therapy',
            description: therapy.description,
            is_active: true
          };
        });

        console.log('📊 Processed therapies data:', therapiesData);

        const { error: therapiesError } = await supabase
          .from('therapies')
          .upsert(therapiesData, { onConflict: 'name' });
        
        if (therapiesError) {
          console.error('❌ Therapies insert error:', therapiesError);
          throw therapiesError;
        }
        console.log('✅ Therapies loaded successfully');
      }

      // 2. Load manufacturers
      if (jsonData.manufacturers && Array.isArray(jsonData.manufacturers)) {
        console.log('🏭 Loading manufacturers...');
        console.log('🏭 Sample manufacturer data:', jsonData.manufacturers[0]);
        
        const manufacturersData = jsonData.manufacturers.map((mfg: any, index: number) => {
          console.log(`🏭 Processing manufacturer ${index + 1}:`, {
            name: mfg.name,
            manufacturer_type: mfg.manufacturer_type,
            headquarters_location: mfg.headquarters_location
          });
          
          return {
            name: mfg.name,
            manufacturer_type: mfg.manufacturer_type,
            headquarters_location: mfg.headquarters_location,
            quality_certifications: mfg.quality_certifications,
            manufacturing_capabilities: mfg.manufacturing_capabilities,
            partnership_tier: mfg.partnership_tier,
            is_active: true
          };
        });

        console.log('🏭 Processed manufacturers data:', manufacturersData);

        const { error: manufacturersError } = await supabase
          .from('manufacturers')
          .upsert(manufacturersData, { onConflict: 'name' });
        
        if (manufacturersError) {
          console.error('❌ Manufacturers insert error:', manufacturersError);
          throw manufacturersError;
        }
        console.log('✅ Manufacturers loaded successfully');
      }

      // 3. Load modalities
      if (jsonData.modalities && Array.isArray(jsonData.modalities)) {
        console.log('🧬 Loading modalities...');
        console.log('🧬 Sample modality data:', jsonData.modalities[0]);
        
        const modalitiesData = jsonData.modalities.map((modality: any, index: number) => {
          console.log(`🧬 Processing modality ${index + 1}:`, {
            name: modality.name,
            modality_type: modality.modality_type,
            description: modality.description
          });
          
          return {
            name: modality.name,
            modality_type: modality.modality_type || 'cell_therapy',
            description: modality.description,
            administration_requirements: modality.administration_requirements,
            cold_chain_requirements: modality.cold_chain_requirements,
            manufacturing_complexity: modality.manufacturing_complexity || 'medium',
            is_active: true
          };
        });

        console.log('🧬 Processed modalities data:', modalitiesData);

        const { error: modalitiesError } = await supabase
          .from('modalities')
          .upsert(modalitiesData, { onConflict: 'name' });
        
        if (modalitiesError) {
          console.error('❌ Modalities insert error:', modalitiesError);
          throw modalitiesError;
        }
        console.log('✅ Modalities loaded successfully');
      }

      // 4. Load services
      if (jsonData.services && Array.isArray(jsonData.services)) {
        console.log('🔧 Loading services...');
        console.log('🔧 Sample service data:', jsonData.services[0]);
        
        const servicesData = jsonData.services.map((service: any, index: number) => {
          console.log(`🔧 Processing service ${index + 1}:`, {
            name: service.name,
            service_type: service.service_type,
            description: service.description
          });
          
          return {
            name: service.name,
            service_type: service.service_type,
            description: service.description,
            capabilities: service.capabilities,
            geographic_coverage: service.geographic_coverage,
            is_active: true
          };
        });

        console.log('🔧 Processed services data:', servicesData);

        const { error: servicesError } = await supabase
          .from('services')
          .upsert(servicesData, { onConflict: 'name' });
        
        if (servicesError) {
          console.error('❌ Services insert error:', servicesError);
          throw servicesError;
        }
        console.log('✅ Services loaded successfully');
      }

      // 5. Load service providers
      if (jsonData.service_providers && Array.isArray(jsonData.service_providers)) {
        console.log('🏢 Loading service providers...');
        console.log('🏢 Sample service provider data:', jsonData.service_providers[0]);
        
        const providersData = jsonData.service_providers.map((provider: any, index: number) => {
          console.log(`🏢 Processing service provider ${index + 1}:`, {
            name: provider.name,
            provider_type: provider.provider_type,
            specializations: provider.specializations
          });
          
          return {
            name: provider.name,
            provider_type: provider.provider_type || 'third_party',
            specializations: provider.specializations,
            geographic_coverage: provider.geographic_coverage,
            certifications: provider.certifications,
            contact_info: provider.contact_info,
            is_active: true
          };
        });

        console.log('🏢 Processed service providers data:', providersData);

        const { error: providersError } = await supabase
          .from('service_providers')
          .upsert(providersData, { onConflict: 'name' });
        
        if (providersError) {
          console.error('❌ Service providers insert error:', providersError);
          throw providersError;
        }
        console.log('✅ Service providers loaded successfully');
      }

      console.log('✅ All JSON data loaded successfully!');
      toast({
        title: "Success!",
        description: "All JSON data has been loaded into the database successfully.",
      });

      return {
        therapies: jsonData.therapies?.length || 0,
        manufacturers: jsonData.manufacturers?.length || 0,
        modalities: jsonData.modalities?.length || 0,
        services: jsonData.services?.length || 0,
        service_providers: jsonData.service_providers?.length || 0
      };

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
