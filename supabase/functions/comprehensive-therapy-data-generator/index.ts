import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Generating comprehensive therapy data...');

    // Generate core therapy data
    const therapyData = generateTherapyData();
    const modalityData = generateModalityData();
    const manufacturerData = generateManufacturerData();

    // Insert data in batches
    await insertData(supabase, {
      therapies: therapyData,
      modalities: modalityData,
      manufacturers: manufacturerData
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Comprehensive therapy data generated successfully',
        data: {
          therapies_created: therapyData.length,
          modalities_created: modalityData.length,
          manufacturers_created: manufacturerData.length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating therapy data:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate therapy data',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function generateTherapyData() {
  const now = new Date().toISOString();
  
  return [
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
}

function generateModalityData() {
  const now = new Date().toISOString();
  
  return [
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
}

function generateManufacturerData() {
  const now = new Date().toISOString();
  
  return [
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
    },
    {
      id: crypto.randomUUID(),
      name: 'Advanced Accelerator Applications (AAA)',
      manufacturer_type: 'specialty',
      headquarters_location: 'Saint-Genis-Pouilly, France',
      regulatory_status: { FDA_approved: true, EMA_approved: true },
      therapeutic_areas: ['Nuclear Medicine', 'Radioligand Therapy'],
      manufacturing_capabilities: ['Radiopharmaceutical Production', 'Targeted Therapy'],
      compliance_certifications: ['GMP', 'Radiation Safety', 'Nuclear Medicine'],
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ];
}

async function insertData(supabase: any, data: any) {
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

  console.log('All therapy data inserted successfully!');
}