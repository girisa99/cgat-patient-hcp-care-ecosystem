
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
        hasProducts: !!jsonData.products,
        hasServices: !!jsonData.services,
        hasServiceProviders: !!jsonData.service_providers,
        hasClinicalTrials: !!jsonData.clinical_trials,
        hasCommercialProducts: !!jsonData.commercial_products,
        therapiesCount: jsonData.therapies?.length || 0,
        manufacturersCount: jsonData.manufacturers?.length || 0,
        modalitiesCount: jsonData.modalities?.length || 0,
        productsCount: jsonData.products?.length || 0,
        servicesCount: jsonData.services?.length || 0,
        serviceProvidersCount: jsonData.service_providers?.length || 0,
        clinicalTrialsCount: jsonData.clinical_trials?.length || 0,
        commercialProductsCount: jsonData.commercial_products?.length || 0
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
        products: 0,
        services: 0,
        service_providers: 0,
        clinical_trials: 0,
        commercial_products: 0
      };

      // 1. Load therapies - map to correct enum values
      if (jsonData.therapies && Array.isArray(jsonData.therapies)) {
        const therapiesData = jsonData.therapies.map((therapy: any) => {
          // Map therapy types to valid enum values
          let therapyType = 'other_cgat'; // default
          if (therapy.therapy_type === 'cell_gene_therapy' || therapy.therapy_type === 'cell_therapy') {
            therapyType = 'car_t_cell';
          } else if (therapy.therapy_type === 'gene_therapy') {
            therapyType = 'gene_therapy';
          }

          return {
            name: therapy.name,
            therapy_type: therapyType,
            description: therapy.description,
            indication: therapy.indication_areas ? therapy.indication_areas.join(', ') : null,
            regulatory_designations: therapy.regulatory_status ? [therapy.regulatory_status] : [],
            special_handling_requirements: {},
            is_active: true
          };
        });

        results.therapies = await safeInsert('therapies', therapiesData, 'name');
      }

      // 2. Load manufacturers - map to correct enum values
      if (jsonData.manufacturers && Array.isArray(jsonData.manufacturers)) {
        const manufacturersData = jsonData.manufacturers.map((mfg: any) => {
          // Map manufacturer types to valid enum values
          let manufacturerType = 'other'; // default
          if (mfg.manufacturer_type === 'biopharmaceutical') {
            manufacturerType = 'pharma';
          } else if (mfg.manufacturer_type === 'gene_therapy_specialist' || mfg.manufacturer_type === 'cell_therapy_specialist') {
            manufacturerType = 'biotech';
          }

          return {
            name: mfg.name,
            manufacturer_type: manufacturerType,
            headquarters_location: mfg.headquarters_location,
            quality_certifications: Array.isArray(mfg.quality_certifications) ? mfg.quality_certifications : [],
            manufacturing_capabilities: Array.isArray(mfg.manufacturing_capabilities) ? mfg.manufacturing_capabilities : [],
            partnership_tier: mfg.partnership_tier === 'tier_1' ? 'preferred' : mfg.partnership_tier === 'tier_2' ? 'standard' : 'limited',
            regulatory_status: {},
            contact_info: mfg.contact_info || {},
            is_active: true
          };
        });

        results.manufacturers = await safeInsert('manufacturers', manufacturersData, 'name');
      }

      // 3. Load modalities - map to correct enum values
      if (jsonData.modalities && Array.isArray(jsonData.modalities)) {
        const modalitiesData = jsonData.modalities.map((modality: any) => {
          // Map modality types to valid enum values
          let modalityType = 'autologous'; // default
          if (modality.modality_type === 'gene_therapy') {
            modalityType = 'viral_vector';
          } else if (modality.modality_type === 'cell_therapy') {
            modalityType = 'autologous';
          }

          return {
            name: modality.name,
            modality_type: modalityType,
            description: modality.description,
            administration_requirements: modality.administration_requirements || {},
            cold_chain_requirements: modality.cold_chain_requirements || {},
            manufacturing_complexity: modality.manufacturing_complexity || 'medium',
            shelf_life_considerations: modality.shelf_life_considerations,
            is_active: true
          };
        });

        results.modalities = await safeInsert('modalities', modalitiesData, 'name');
      }

      // 4. Load products
      if (jsonData.products && Array.isArray(jsonData.products)) {
        const productsData = jsonData.products.map((product: any) => {
          // Map product status to valid enum values
          let productStatus = 'preclinical'; // default
          if (product.product_type === 'commercial') {
            productStatus = 'approved';
          } else if (product.product_type === 'investigational') {
            productStatus = 'phase_3';
          }

          return {
            name: product.name,
            brand_name: product.brand_name,
            product_status: productStatus,
            indication: product.indication_areas ? product.indication_areas.join(', ') : null,
            approval_date: product.regulatory_approvals?.fda?.date || null,
            dosing_information: {},
            contraindications: [],
            special_populations: {},
            distribution_requirements: {},
            pricing_information: product.pricing_information || {},
            market_access_considerations: {},
            is_active: true
          };
        });

        results.products = await safeInsert('products', productsData, 'name');
      }

      // 5. Load services
      if (jsonData.services && Array.isArray(jsonData.services)) {
        const servicesData = jsonData.services.map((service: any) => ({
          name: service.name,
          service_type: service.service_type,
          description: service.description,
          geographic_coverage: Array.isArray(service.geographic_coverage) ? service.geographic_coverage : [],
          is_active: true
        }));

        results.services = await safeInsert('services', servicesData, 'name');
      }

      // 6. Load service providers
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
          };
        });

        results.service_providers = await safeInsert('service_providers', providersData, 'name');
      }

      // 7. Load clinical trials
      if (jsonData.clinical_trials && Array.isArray(jsonData.clinical_trials)) {
        const clinicalTrialsData = jsonData.clinical_trials.map((trial: any) => {
          // Map trial status to valid enum values
          let trialStatus = 'not_yet_recruiting'; // default
          if (trial.trial_status === 'recruiting') {
            trialStatus = 'recruiting';
          } else if (trial.trial_status === 'active') {
            trialStatus = 'active_not_recruiting';
          } else if (trial.trial_status === 'completed') {
            trialStatus = 'completed';
          } else if (trial.trial_status === 'ongoing') {
            trialStatus = 'active_not_recruiting';
          }

          // Map phase to valid enum values
          let phase = 'preclinical'; // default
          if (trial.phase === 'Phase I' || trial.phase === 'Phase 1') {
            phase = 'phase_1';
          } else if (trial.phase === 'Phase II' || trial.phase === 'Phase 2') {
            phase = 'phase_2';
          } else if (trial.phase === 'Phase III' || trial.phase === 'Phase 3') {
            phase = 'phase_3';
          } else if (trial.phase === 'Phase IV' || trial.phase === 'Phase 4') {
            phase = 'phase_4';
          }

          return {
            nct_number: trial.nct_number,
            title: trial.title,
            trial_status: trialStatus,
            phase: phase,
            primary_indication: trial.eligibility_criteria?.indication,
            enrollment_target: trial.enrollment_target,
            enrollment_current: 0,
            primary_endpoint: trial.primary_endpoint,
            secondary_endpoints: [],
            investigational_sites: {},
            sponsor_info: {},
            eligibility_criteria: trial.eligibility_criteria || {},
            trial_locations: [],
            is_active: true
          };
        });

        results.clinical_trials = await safeInsert('clinical_trials', clinicalTrialsData, 'nct_number');
      }

      // 8. Load commercial products
      if (jsonData.commercial_products && Array.isArray(jsonData.commercial_products)) {
        const commercialProductsData = jsonData.commercial_products.map((cp: any) => ({
          launch_date: cp.launch_date,
          market_regions: Array.isArray(cp.market_regions) ? cp.market_regions : [],
          reimbursement_status: cp.reimbursement_status || {},
          patient_access_programs: {},
          distribution_channels: [],
          volume_projections: cp.sales_performance || {},
          competitive_landscape: {},
          key_opinion_leaders: [],
          medical_affairs_contacts: {},
          is_active: true
        }));

        results.commercial_products = await safeInsert('commercial_products', commercialProductsData, 'launch_date');
      }

      console.log('✅ All JSON data loaded successfully!');
      toast({
        title: "Success!",
        description: `JSON data imported: ${results.therapies} therapies, ${results.manufacturers} manufacturers, ${results.modalities} modalities, ${results.products} products, ${results.services} services, ${results.service_providers} providers, ${results.clinical_trials} trials, ${results.commercial_products} commercial products`,
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
