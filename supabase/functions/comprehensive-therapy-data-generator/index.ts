import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TherapyData {
  therapies: any[];
  modalities: any[];
  manufacturers: any[];
  products: any[];
  clinical_trials: any[];
  commercial_products: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Generating comprehensive therapy data for all therapeutic modalities...');

    // Generate comprehensive therapy data
    const comprehensiveTherapyData = await generateComprehensiveTherapyData();

    // Insert all data in batches
    await insertTherapyData(supabase, comprehensiveTherapyData);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Comprehensive therapy data generated successfully',
        data: {
          therapies_created: comprehensiveTherapyData.therapies.length,
          modalities_created: comprehensiveTherapyData.modalities.length,
          manufacturers_created: comprehensiveTherapyData.manufacturers.length,
          products_created: comprehensiveTherapyData.products.length,
          clinical_trials_created: comprehensiveTherapyData.clinical_trials.length,
          commercial_products_created: comprehensiveTherapyData.commercial_products.length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating comprehensive therapy data:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate comprehensive therapy data',
        details: (error instanceof Error ? error.message : String(error)) 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function generateComprehensiveTherapyData(): Promise<TherapyData> {
  const now = new Date().toISOString();

  // Core therapy data with all categories preserved
  const therapies = [
    // Cell Therapies
    {
      id: crypto.randomUUID(),
      name: 'Kymriah (tisagenlecleucel)',
      therapy_type: 'car_t_cell',
      description: 'CD19-directed CAR-T cell therapy for B-cell acute lymphoblastic leukemia and diffuse large B-cell lymphoma',
      indication: 'B-cell ALL, DLBCL',
      target_population: 'Pediatric and young adult patients up to 25 years, adults with DLBCL',
      mechanism_of_action: 'Genetically modified autologous T cells expressing CD19-directed CAR',
      special_handling_requirements: { cold_chain: true, specialized_facility: true, trained_staff: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved', 'Breakthrough Therapy'],
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Yescarta (axicabtagene ciloleucel)',
      therapy_type: 'car_t_cell',
      description: 'CD19-directed CAR-T cell therapy for large B-cell lymphoma',
      indication: 'Large B-cell lymphoma, primary mediastinal B-cell lymphoma',
      target_population: 'Adults with relapsed or refractory large B-cell lymphoma',
      mechanism_of_action: 'Anti-CD19 CAR-T cell therapy',
      special_handling_requirements: { cold_chain: true, specialized_facility: true, trained_staff: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved'],
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Breyanzi (lisocabtagene maraleucel)',
      therapy_type: 'car_t_cell',
      description: 'CD19-directed CAR-T cell therapy for large B-cell lymphoma',
      indication: 'Large B-cell lymphoma',
      target_population: 'Adults with relapsed or refractory large B-cell lymphoma',
      mechanism_of_action: 'Anti-CD19 CAR-T cell therapy with defined composition',
      special_handling_requirements: { cold_chain: true, specialized_facility: true, trained_staff: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved'],
      is_active: true,
      created_at: now,
      updated_at: now
    },
    // Gene Therapies
    {
      id: crypto.randomUUID(),
      name: 'Zolgensma (onasemnogene abeparvovec)',
      therapy_type: 'gene_therapy',
      description: 'Adeno-associated virus gene therapy for spinal muscular atrophy',
      indication: 'Spinal muscular atrophy type 1',
      target_population: 'Pediatric patients under 2 years with SMA',
      mechanism_of_action: 'AAV9-mediated delivery of functional SMN1 gene',
      special_handling_requirements: { cold_chain: true, specialized_facility: true, pre_medication_required: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved', 'Orphan Drug'],
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Luxturna (voretigene neparvovec)',
      therapy_type: 'gene_therapy',
      description: 'Adeno-associated virus gene therapy for inherited retinal disease',
      indication: 'Leber congenital amaurosis 10, RPE65 mutation-associated retinal dystrophy',
      target_population: 'Patients with confirmed biallelic RPE65 mutations',
      mechanism_of_action: 'AAV2-mediated delivery of functional RPE65 gene',
      special_handling_requirements: { surgical_administration: true, specialized_facility: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved', 'Orphan Drug'],
      is_active: true,
      created_at: now,
      updated_at: now
    },
    // Radioligand Therapies
    {
      id: crypto.randomUUID(),
      name: 'Pluvicto (lutetium Lu 177 vipivotide tetraxetan)',
      therapy_type: 'radioligand_therapy',
      description: 'PSMA-targeted radioligand therapy for prostate cancer',
      indication: 'PSMA-positive metastatic castration-resistant prostate cancer',
      target_population: 'Adults with PSMA-positive mCRPC',
      mechanism_of_action: 'PSMA-targeted lutetium-177 radioligand therapy',
      special_handling_requirements: { radiation_safety: true, specialized_facility: true, waste_management: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved'],
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Lutathera (lutetium Lu 177 dotatate)',
      therapy_type: 'radioligand_therapy',
      description: 'Somatostatin receptor-targeted radioligand therapy',
      indication: 'Somatostatin receptor-positive gastroenteropancreatic neuroendocrine tumors',
      target_population: 'Adults with somatostatin receptor-positive GEP-NETs',
      mechanism_of_action: 'Somatostatin receptor-targeted lutetium-177 therapy',
      special_handling_requirements: { radiation_safety: true, specialized_facility: true, waste_management: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved'],
      is_active: true,
      created_at: now,
      updated_at: now
    },
    // Personalized Medicine
    {
      id: crypto.randomUUID(),
      name: 'Keytruda (pembrolizumab)',
      therapy_type: 'personalized_medicine',
      description: 'PD-1 inhibitor immunotherapy with companion diagnostics',
      indication: 'Multiple cancer types with PD-L1 expression or MSI-H/dMMR',
      target_population: 'Patients with biomarker-positive tumors',
      mechanism_of_action: 'PD-1/PD-L1 pathway inhibition',
      special_handling_requirements: { biomarker_testing_required: true, infusion_monitoring: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved', 'Companion Diagnostic Required'],
      is_active: true,
      created_at: now,
      updated_at: now
    },
    // Advanced Biologics
    {
      id: crypto.randomUUID(),
      name: 'Spinraza (nusinersen)',
      therapy_type: 'advanced_biologics',
      description: 'Antisense oligonucleotide for spinal muscular atrophy',
      indication: 'Spinal muscular atrophy',
      target_population: 'Patients of all ages with SMA',
      mechanism_of_action: 'Antisense oligonucleotide that modifies SMN2 pre-mRNA splicing',
      special_handling_requirements: { intrathecal_administration: true, specialized_facility: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved', 'Orphan Drug'],
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ];

  // Modality data
  const modalities = [
    {
      id: crypto.randomUUID(),
      name: 'Autologous CAR-T',
      modality_type: 'autologous',
      description: 'Patient-derived CAR-T cell therapy',
      manufacturing_complexity: 'very_high',
      cold_chain_requirements: { temperature: '-80C to -150C', duration: 'months', specialized_transport: true },
      shelf_life_considerations: 'Cryopreserved, patient-specific, single-use',
      administration_requirements: { premedication: true, specialized_facility: true, monitoring: 'intensive' },
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Viral Vector Gene Therapy',
      modality_type: 'viral_vector',
      description: 'AAV-based gene delivery system',
      manufacturing_complexity: 'very_high',
      cold_chain_requirements: { temperature: '-80C', duration: 'years', specialized_transport: true },
      shelf_life_considerations: 'Frozen, single-use, sterile',
      administration_requirements: { premedication: true, specialized_facility: true, monitoring: 'extended' },
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Radioligand Therapy',
      modality_type: 'radioligand',
      description: 'Targeted radiopharmaceutical therapy',
      manufacturing_complexity: 'high',
      cold_chain_requirements: { temperature: '2-8C', duration: 'days', specialized_transport: true },
      shelf_life_considerations: 'Short half-life, radiation decay, specialized handling',
      administration_requirements: { radiation_safety: true, specialized_facility: true, waste_management: true },
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ];

  // Manufacturer data
  const manufacturers = [
    {
      id: crypto.randomUUID(),
      name: 'Novartis',
      manufacturer_type: 'pharma',
      headquarters_location: 'Basel, Switzerland',
      regulatory_status: { FDA_approved: true, EMA_approved: true, PMDA_approved: true },
      therapeutic_areas: ['Oncology', 'Cell & Gene Therapy', 'Neuroscience'],
      manufacturing_capabilities: ['CAR-T Manufacturing', 'Gene Therapy Production', 'Biologics'],
      compliance_certifications: ['GMP', 'ISO 13485', '21 CFR Part 11'],
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Gilead Sciences',
      manufacturer_type: 'pharma',
      headquarters_location: 'Foster City, CA, USA',
      regulatory_status: { FDA_approved: true, EMA_approved: true, PMDA_approved: true },
      therapeutic_areas: ['Oncology', 'Cell Therapy', 'Virology'],
      manufacturing_capabilities: ['CAR-T Manufacturing', 'Small Molecule', 'Biologics'],
      compliance_certifications: ['GMP', 'ISO 13485', '21 CFR Part 11'],
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ];

  // Product data (restored functionality)
  const products = [
    {
      id: crypto.randomUUID(),
      product_id: 'KYMR-001',
      name: 'Kymriah',
      manufacturer_id: manufacturers[0].id, // Novartis
      therapy_category: 'CAR-T Cell Therapy',
      indication: 'B-cell ALL, DLBCL',
      regulatory_status: 'FDA Approved',
      launch_date: '2017-08-30',
      market_access_status: 'Commercial',
      pricing_information: { list_price: 450000, currency: 'USD', per: 'treatment' },
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      product_id: 'YESC-001',
      name: 'Yescarta',
      manufacturer_id: manufacturers[1].id, // Gilead
      therapy_category: 'CAR-T Cell Therapy',
      indication: 'Large B-cell lymphoma',
      regulatory_status: 'FDA Approved',
      launch_date: '2017-10-18',
      market_access_status: 'Commercial',
      pricing_information: { list_price: 373000, currency: 'USD', per: 'treatment' },
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ];

  // Clinical trials data (restored functionality)
  const clinical_trials = [
    {
      id: crypto.randomUUID(),
      trial_id: 'NCT02435849',
      trial_name: 'Study of CTL019 in Pediatric and Young Adult Patients with Relapsed/Refractory B-cell ALL',
      therapy_id: therapies[0].id, // Kymriah
      phase: 'Phase II',
      status: 'Completed',
      primary_endpoints: ['Overall remission rate within 3 months'],
      secondary_endpoints: ['Duration of remission', 'Overall survival'],
      patient_population: 'Pediatric and young adult patients with R/R B-cell ALL',
      enrollment_target: 68,
      start_date: '2015-04-01',
      completion_date: '2020-12-31',
      sponsor: 'Novartis',
      locations: ['United States', 'Canada', 'Europe'],
      results_summary: { primary_endpoint_met: true, response_rate: 0.81, safety_profile: 'manageable' },
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      trial_id: 'NCT03391466',
      trial_name: 'Study of JCAR017 in Adult Patients with Relapsed or Refractory B-Cell Non-Hodgkin Lymphoma',
      therapy_id: therapies[2].id, // Breyanzi
      phase: 'Phase III',
      status: 'Completed',
      primary_endpoints: ['Event-free survival'],
      secondary_endpoints: ['Overall response rate', 'Overall survival'],
      patient_population: 'Adults with R/R large B-cell lymphoma',
      enrollment_target: 184,
      start_date: '2017-12-01',
      completion_date: '2021-06-30',
      sponsor: 'Bristol Myers Squibb',
      locations: ['United States', 'Europe', 'Asia'],
      results_summary: { primary_endpoint_met: true, response_rate: 0.73, safety_profile: 'acceptable' },
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ];

  // Commercial products data (restored functionality)
  const commercial_products = [
    {
      id: crypto.randomUUID(),
      product_id: 'KYMR-COMM-001',
      therapy_id: therapies[0].id, // Kymriah
      manufacturer_id: manufacturers[0].id, // Novartis
      product_name: 'Kymriah Commercial',
      market_authorization_date: '2017-08-30',
      countries_approved: ['United States', 'European Union', 'Canada', 'Australia'],
      distribution_channels: ['Authorized Treatment Centers', 'Specialty Pharmacies'],
      supply_chain_requirements: {
        cold_chain: true,
        specialized_logistics: true,
        patient_scheduling: true,
        manufacturing_slots: true
      },
      competitive_landscape: {
        direct_competitors: ['Yescarta', 'Breyanzi'],
        market_share: 0.35,
        competitive_advantages: ['First to market', 'Pediatric indication']
      },
      commercial_metrics: {
        annual_revenue: 456000000,
        patient_treatments: 1200,
        market_penetration: 0.15
      },
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      product_id: 'ZOLG-COMM-001',
      therapy_id: therapies[3].id, // Zolgensma
      manufacturer_id: manufacturers[0].id, // Novartis
      product_name: 'Zolgensma Commercial',
      market_authorization_date: '2019-05-24',
      countries_approved: ['United States', 'European Union', 'Japan'],
      distribution_channels: ['Specialized Gene Therapy Centers'],
      supply_chain_requirements: {
        cold_chain: true,
        ultra_low_temperature: true,
        specialized_facilities: true,
        patient_preparation: true
      },
      competitive_landscape: {
        direct_competitors: ['Spinraza'],
        market_share: 0.60,
        competitive_advantages: ['One-time treatment', 'Gene therapy approach']
      },
      commercial_metrics: {
        annual_revenue: 920000000,
        patient_treatments: 400,
        market_penetration: 0.70
      },
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ];

  return {
    therapies,
    modalities,
    manufacturers,
    products,
    clinical_trials,
    commercial_products
  };
}

async function insertTherapyData(supabase: any, data: TherapyData) {
  // Insert therapies
  const { error: therapyError } = await supabase
    .from('therapies')
    .upsert(data.therapies, { onConflict: 'name' });
  
  if (therapyError) {
    console.error('Error inserting therapies:', therapyError);
    throw therapyError;
  }

  // Insert modalities
  const { error: modalityError } = await supabase
    .from('therapy_modalities')
    .upsert(data.modalities, { onConflict: 'name' });
  
  if (modalityError) {
    console.error('Error inserting modalities:', modalityError);
    throw modalityError;
  }

  // Insert manufacturers
  const { error: manufacturerError } = await supabase
    .from('manufacturers')
    .upsert(data.manufacturers, { onConflict: 'name' });
  
  if (manufacturerError) {
    console.error('Error inserting manufacturers:', manufacturerError);
    throw manufacturerError;
  }

  // Insert products
  const { error: productError } = await supabase
    .from('therapy_products')
    .upsert(data.products, { onConflict: 'product_id' });
  
  if (productError) {
    console.error('Error inserting products:', productError);
    throw productError;
  }

  // Insert clinical trials
  const { error: trialError } = await supabase
    .from('clinical_trials')
    .upsert(data.clinical_trials, { onConflict: 'trial_id' });
  
  if (trialError) {
    console.error('Error inserting clinical trials:', trialError);
    throw trialError;
  }

  // Insert commercial products
  const { error: commercialError } = await supabase
    .from('commercial_products')
    .upsert(data.commercial_products, { onConflict: 'product_id' });
  
  if (commercialError) {
    console.error('Error inserting commercial products:', commercialError);
    throw commercialError;
  }

  console.log('All therapy data inserted successfully!');
}