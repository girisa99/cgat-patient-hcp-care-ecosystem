
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

      // 1. Load therapies - using only fields that exist in the database
      if (jsonData.therapies) {
        console.log('📊 Loading therapies...');
        const therapiesData = jsonData.therapies.map((therapy: any) => ({
          name: therapy.name,
          therapy_type: therapy.therapy_type || 'cell_gene_therapy',
          description: therapy.description,
          is_active: true
        }));

        const { error: therapiesError } = await supabase
          .from('therapies')
          .upsert(therapiesData, { onConflict: 'name' });
        
        if (therapiesError) throw therapiesError;
      }

      // 2. Load manufacturers
      if (jsonData.manufacturers) {
        console.log('🏭 Loading manufacturers...');
        const manufacturersData = jsonData.manufacturers.map((mfg: any) => ({
          name: mfg.name,
          manufacturer_type: mfg.manufacturer_type,
          headquarters_location: mfg.headquarters_location,
          quality_certifications: mfg.quality_certifications,
          manufacturing_capabilities: mfg.manufacturing_capabilities,
          partnership_tier: mfg.partnership_tier,
          is_active: true
        }));

        const { error: manufacturersError } = await supabase
          .from('manufacturers')
          .upsert(manufacturersData, { onConflict: 'name' });
        
        if (manufacturersError) throw manufacturersError;
      }

      // 3. Load modalities
      if (jsonData.modalities) {
        console.log('🧬 Loading modalities...');
        const modalitiesData = jsonData.modalities.map((modality: any) => ({
          name: modality.name,
          modality_type: modality.modality_type || 'cell_therapy',
          description: modality.description,
          administration_requirements: modality.administration_requirements,
          cold_chain_requirements: modality.cold_chain_requirements,
          manufacturing_complexity: modality.manufacturing_complexity || 'medium',
          is_active: true
        }));

        const { error: modalitiesError } = await supabase
          .from('modalities')
          .upsert(modalitiesData, { onConflict: 'name' });
        
        if (modalitiesError) throw modalitiesError;
      }

      // 4. Load services
      if (jsonData.services) {
        console.log('🔧 Loading services...');
        const servicesData = jsonData.services.map((service: any) => ({
          name: service.name,
          service_type: service.service_type,
          description: service.description,
          capabilities: service.capabilities,
          geographic_coverage: service.geographic_coverage,
          is_active: true
        }));

        const { error: servicesError } = await supabase
          .from('services')
          .upsert(servicesData, { onConflict: 'name' });
        
        if (servicesError) throw servicesError;
      }

      // 5. Load service providers
      if (jsonData.service_providers) {
        console.log('🏢 Loading service providers...');
        const providersData = jsonData.service_providers.map((provider: any) => ({
          name: provider.name,
          provider_type: provider.provider_type || 'third_party',
          specializations: provider.specializations,
          geographic_coverage: provider.geographic_coverage,
          certifications: provider.certifications,
          contact_info: provider.contact_info,
          is_active: true
        }));

        const { error: providersError } = await supabase
          .from('service_providers')
          .upsert(providersData, { onConflict: 'name' });
        
        if (providersError) throw providersError;
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
