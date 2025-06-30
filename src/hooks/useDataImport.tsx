
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

      // 1. Load therapies - match the actual database schema
      console.log('📊 Loading therapies...');
      const therapiesData = SEED_THERAPIES.map(therapy => ({
        name: therapy.name,
        therapy_type: therapy.therapy_type as any,
        description: therapy.description,
        indication: therapy.indication_areas?.[0] || null,
        is_active: therapy.is_active
      }));

      const { error: therapiesError } = await supabase
        .from('therapies')
        .upsert(therapiesData, { onConflict: 'name' });
      
      if (therapiesError) throw therapiesError;

      // 2. Load manufacturers
      console.log('🏭 Loading manufacturers...');
      const { error: manufacturersError } = await supabase
        .from('manufacturers')
        .upsert(SEED_MANUFACTURERS, { onConflict: 'name' });
      
      if (manufacturersError) throw manufacturersError;

      // 3. Load modalities - match the actual database schema
      console.log('🧬 Loading modalities...');
      const modalitiesData = SEED_MODALITIES.map(modality => ({
        name: modality.name,
        modality_type: modality.modality_type as any,
        description: modality.description,
        administration_requirements: modality.administration_requirements,
        cold_chain_requirements: modality.cold_chain_requirements,
        manufacturing_complexity: modality.manufacturing_complexity,
        is_active: modality.is_active
      }));

      const { error: modalitiesError } = await supabase
        .from('modalities')
        .upsert(modalitiesData, { onConflict: 'name' });
      
      if (modalitiesError) throw modalitiesError;

      // 4. Load products - match the actual database schema
      console.log('💊 Loading products...');
      const productsData = SEED_PRODUCTS.map(product => ({
        name: product.name,
        product_status: 'approved' as any,
        indication: product.indication_areas?.[0] || null,
        is_active: product.is_active
      }));

      const { error: productsError } = await supabase
        .from('products')
        .upsert(productsData, { onConflict: 'name' });
      
      if (productsError) throw productsError;

      // 5. Load service providers first (since services reference them)
      console.log('🏢 Loading service providers...');
      const serviceProvidersData = SEED_SERVICE_PROVIDERS.map(provider => ({
        name: provider.name,
        provider_type: provider.provider_type === 'logistics' ? 'external_partner' : 
                      provider.provider_type === 'distribution' ? 'external_partner' : 'third_party',
        capabilities: provider.specializations || [],
        geographic_coverage: provider.geographic_coverage || [],
        certification_details: { certifications: provider.certifications || [] },
        contact_info: provider.contact_info || {},
        is_active: provider.is_active
      }));

      const { error: providersError } = await supabase
        .from('service_providers')
        .upsert(serviceProvidersData, { onConflict: 'name' });
      
      if (providersError) throw providersError;

      // Get the inserted service providers to use their IDs
      const { data: insertedProviders } = await supabase
        .from('service_providers')
        .select('id, name');

      // 6. Load services with proper service_provider_id
      console.log('🔧 Loading services...');
      const servicesData = SEED_SERVICES.map(service => {
        const serviceType = service.service_type === 'logistics' ? '3pl' :
                           service.service_type === 'patient_services' ? 'patient_hub_services' :
                           service.service_type === 'regulatory' ? 'order_management' :
                           service.service_type === 'financial' ? 'order_management' :
                           service.service_type === 'operational' ? 'order_management' : '3pl';
        
        // Find a matching provider or use the first one as fallback
        const matchingProvider = insertedProviders?.find(p => 
          service.name.toLowerCase().includes('cold') && p.name.toLowerCase().includes('cryo')
        ) || insertedProviders?.[0];

        return {
          name: service.name,
          service_type: serviceType as any,
          description: service.description,
          service_provider_id: matchingProvider?.id || null,
          requirements: { capabilities: service.capabilities || [] },
          pricing_model: {},
          sla_requirements: {},
          is_active: service.is_active
        };
      });

      const { error: servicesError } = await supabase
        .from('services')
        .upsert(servicesData.filter(s => s.service_provider_id), { onConflict: 'name' });
      
      if (servicesError) throw servicesError;

      // 7. Load service provider capabilities
      console.log('⚡ Loading service capabilities...');
      const capabilitiesData = SERVICE_CAPABILITIES.map(capability => {
        const matchingProvider = insertedProviders?.find(p => p.name === SEED_SERVICE_PROVIDERS[parseInt(capability.service_provider_id) - 1]?.name);
        
        return {
          service_provider_id: matchingProvider?.id || insertedProviders?.[0]?.id,
          service_type: capability.service_type === 'logistics' ? '3pl' : 
                       capability.service_type === 'distribution' ? 'specialty_distribution' : '3pl',
          therapy_area: capability.therapy_area,
          capability_level: capability.capability_level,
          experience_years: capability.experience_years,
          geographic_restrictions: [],
          regulatory_compliance: {},
          certifications: capability.certifications || [],
          is_preferred: capability.is_preferred,
          volume_capacity: {}
        };
      }).filter(c => c.service_provider_id);

      const { error: capabilitiesError } = await supabase
        .from('service_provider_capabilities')
        .upsert(capabilitiesData);
      
      if (capabilitiesError) throw capabilitiesError;

      // 8. Load clinical trials (simplified for now)
      console.log('🧪 Loading clinical trials...');
      const trialsData = SEED_CLINICAL_TRIALS.map(trial => ({
        nct_number: trial.nct_number,
        title: trial.title,
        phase: trial.phase,
        trial_status: 'recruiting' as any,
        primary_indication: trial.primary_indication,
        patient_population: trial.patient_population,
        enrollment_target: trial.enrollment_target,
        enrollment_current: trial.enrollment_current,
        start_date: trial.start_date,
        estimated_completion_date: trial.estimated_completion_date,
        primary_endpoint: trial.primary_endpoint,
        secondary_endpoints: trial.secondary_endpoints || [],
        eligibility_criteria: trial.eligibility_criteria || {},
        trial_locations: trial.trial_locations || [],
        is_active: trial.is_active
      }));

      const { error: trialsError } = await supabase
        .from('clinical_trials')
        .upsert(trialsData, { onConflict: 'nct_number' });
      
      if (trialsError) throw trialsError;

      // 9. Load commercial products (simplified for now)
      console.log('💼 Loading commercial products...');
      const commercialData = SEED_COMMERCIAL_PRODUCTS.map(product => ({
        launch_date: product.launch_date,
        market_regions: product.market_regions || [],
        reimbursement_status: product.reimbursement_status || {},
        patient_access_programs: product.patient_access_programs || {},
        distribution_channels: product.distribution_channels || [],
        competitive_landscape: product.competitive_landscape || {},
        volume_projections: product.volume_projections || {},
        is_active: product.is_active
      }));

      const { error: commercialError } = await supabase
        .from('commercial_products')
        .upsert(commercialData);
      
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
