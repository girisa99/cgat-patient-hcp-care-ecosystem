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

    // Comprehensive therapy data for all modalities
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
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function generateComprehensiveTherapyData(): Promise<TherapyData> {
  const therapies = [];
  const modalities = [];
  const manufacturers = [];
  const products = [];
  const clinical_trials = [];
  const commercial_products = [];

  // 1. CELL THERAPIES
  const cellTherapies = [
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Abecma (idecabtagene vicleucel)',
      therapy_type: 'car_t_cell',
      description: 'BCMA-directed CAR-T cell therapy for multiple myeloma',
      indication: 'Multiple myeloma',
      target_population: 'Adults with relapsed or refractory multiple myeloma',
      mechanism_of_action: 'Anti-BCMA CAR-T cell therapy',
      special_handling_requirements: { cold_chain: true, specialized_facility: true, trained_staff: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Carvykti (ciltacabtagene autoleucel)',
      therapy_type: 'car_t_cell',
      description: 'BCMA-directed CAR-T cell therapy for multiple myeloma',
      indication: 'Multiple myeloma',
      target_population: 'Adults with relapsed or refractory multiple myeloma',
      mechanism_of_action: 'Anti-BCMA CAR-T cell therapy with dual BCMA targeting',
      special_handling_requirements: { cold_chain: true, specialized_facility: true, trained_staff: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // 2. GENE THERAPIES
  const geneTherapies = [
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Casgevy (exagamglogene autotemcel)',
      therapy_type: 'gene_therapy',
      description: 'CRISPR/Cas9 gene-edited therapy for sickle cell disease and beta-thalassemia',
      indication: 'Sickle cell disease, beta-thalassemia',
      target_population: 'Patients 12 years and older with severe SCD or TDT',
      mechanism_of_action: 'CRISPR/Cas9 editing of BCL11A gene in autologous CD34+ cells',
      special_handling_requirements: { cold_chain: true, specialized_facility: true, conditioning_required: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved', 'Orphan Drug'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Lyfgenia (eteplirsen)',
      therapy_type: 'gene_therapy',
      description: 'Adeno-associated virus gene therapy for hemophilia B',
      indication: 'Hemophilia B',
      target_population: 'Adults with severe or moderately severe hemophilia B',
      mechanism_of_action: 'AAV-mediated delivery of factor IX gene',
      special_handling_requirements: { immunosuppression_required: true, specialized_facility: true },
      regulatory_designations: ['FDA Approved', 'Orphan Drug'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // 3. ADVANCED BIOLOGICS
  const advancedBiologics = [
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Eteplirsen (Exondys 51)',
      therapy_type: 'advanced_biologics',
      description: 'Antisense oligonucleotide for Duchenne muscular dystrophy',
      indication: 'Duchenne muscular dystrophy',
      target_population: 'Patients with DMD with mutations amenable to exon 51 skipping',
      mechanism_of_action: 'Antisense oligonucleotide that promotes exon 51 skipping',
      special_handling_requirements: { IV_administration: true, monitoring_required: true },
      regulatory_designations: ['FDA Approved', 'Accelerated Approval'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // 4. PERSONALIZED MEDICINES
  const personalizedMedicines = [
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Herceptin (trastuzumab)',
      therapy_type: 'personalized_medicine',
      description: 'HER2-targeted monoclonal antibody therapy',
      indication: 'HER2-positive breast and gastric cancers',
      target_population: 'Patients with HER2-overexpressing tumors',
      mechanism_of_action: 'HER2 receptor antagonist',
      special_handling_requirements: { HER2_testing_required: true, cardiac_monitoring: true },
      regulatory_designations: ['FDA Approved', 'EMA Approved', 'Companion Diagnostic Required'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // 5. RADIOLIGAND THERAPIES
  const radioligandTherapies = [
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Azedra (iobenguane I 131)',
      therapy_type: 'radioligand_therapy',
      description: 'Norepinephrine transporter-targeted radioiodine therapy',
      indication: 'Pheochromocytoma and paraganglioma',
      target_population: 'Adults and pediatric patients with unresectable, locally advanced or metastatic pheochromocytoma or paraganglioma',
      mechanism_of_action: 'Norepinephrine transporter-targeted iodine-131 therapy',
      special_handling_requirements: { radiation_safety: true, specialized_facility: true, thyroid_protection: true },
      regulatory_designations: ['FDA Approved', 'Orphan Drug'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Combine all therapies
  therapies.push(...cellTherapies, ...geneTherapies, ...advancedBiologics, ...personalizedMedicines, ...radioligandTherapies);

  // Generate modalities
  const modalityData = [
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Antisense Oligonucleotide',
      modality_type: 'non_viral',
      description: 'Modified nucleic acid therapeutic',
      manufacturing_complexity: 'high',
      cold_chain_requirements: { temperature: '2-8C', duration: 'months', standard_transport: true },
      shelf_life_considerations: 'Refrigerated, multi-dose, sterile',
      administration_requirements: { intrathecal_option: true, specialized_training: true, monitoring: 'standard' },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Monoclonal Antibody',
      modality_type: 'protein_based',
      description: 'Targeted protein therapeutic',
      manufacturing_complexity: 'medium',
      cold_chain_requirements: { temperature: '2-8C', duration: 'years', standard_transport: true },
      shelf_life_considerations: 'Refrigerated, multi-dose, preservative-free',
      administration_requirements: { infusion_monitoring: true, allergy_screening: true, monitoring: 'standard' },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  modalities.push(...modalityData);

  // Generate manufacturers
  const manufacturerData = [
    {
      id: crypto.randomUUID(),
      name: 'Novartis',
      manufacturer_type: 'pharma',
      headquarters_location: 'Basel, Switzerland',
      regulatory_status: { FDA_approved: true, EMA_approved: true, PMDA_approved: true },
      manufacturing_capabilities: ['CAR-T', 'Gene Therapy', 'Small Molecules', 'Biologics'],
      quality_certifications: ['GMP', 'ISO 13485', 'FDA Registered'],
      contact_info: { website: 'novartis.com', phone: '+41-61-324-1111' },
      partnership_tier: 'preferred',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Gilead Sciences',
      manufacturer_type: 'pharma',
      headquarters_location: 'Foster City, CA, USA',
      regulatory_status: { FDA_approved: true, EMA_approved: true, PMDA_approved: true },
      manufacturing_capabilities: ['CAR-T', 'Antivirals', 'Oncology', 'Cell Therapy'],
      quality_certifications: ['GMP', 'FDA Registered', 'EMA Certified'],
      contact_info: { website: 'gilead.com', phone: '+1-650-574-3000' },
      partnership_tier: 'preferred',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Bristol Myers Squibb',
      manufacturer_type: 'pharma',
      headquarters_location: 'New York, NY, USA',
      regulatory_status: { FDA_approved: true, EMA_approved: true, PMDA_approved: true },
      manufacturing_capabilities: ['CAR-T', 'Immunotherapy', 'Oncology', 'Cell Therapy'],
      quality_certifications: ['GMP', 'FDA Registered', 'EMA Certified'],
      contact_info: { website: 'bms.com', phone: '+1-609-252-4000' },
      partnership_tier: 'preferred',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Johnson & Johnson',
      manufacturer_type: 'pharma',
      headquarters_location: 'New Brunswick, NJ, USA',
      regulatory_status: { FDA_approved: true, EMA_approved: true, PMDA_approved: true },
      manufacturing_capabilities: ['CAR-T', 'Gene Therapy', 'Biologics', 'Medical Devices'],
      quality_certifications: ['GMP', 'FDA Registered', 'EMA Certified', 'ISO 13485'],
      contact_info: { website: 'jnj.com', phone: '+1-732-524-0400' },
      partnership_tier: 'preferred',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Vertex Pharmaceuticals',
      manufacturer_type: 'biotech',
      headquarters_location: 'Boston, MA, USA',
      regulatory_status: { FDA_approved: true, EMA_approved: true, PMDA_approved: true },
      manufacturing_capabilities: ['Gene Editing', 'Small Molecules', 'CRISPR Therapies'],
      quality_certifications: ['GMP', 'FDA Registered', 'EMA Certified'],
      contact_info: { website: 'vrtx.com', phone: '+1-617-341-6100' },
      partnership_tier: 'preferred',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Biogen',
      manufacturer_type: 'biotech',
      headquarters_location: 'Cambridge, MA, USA',
      regulatory_status: { FDA_approved: true, EMA_approved: true, PMDA_approved: true },
      manufacturing_capabilities: ['Antisense Oligonucleotides', 'Biologics', 'Neurological Therapies'],
      quality_certifications: ['GMP', 'FDA Registered', 'EMA Certified'],
      contact_info: { website: 'biogen.com', phone: '+1-617-679-2000' },
      partnership_tier: 'preferred',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Roche',
      manufacturer_type: 'pharma',
      headquarters_location: 'Basel, Switzerland',
      regulatory_status: { FDA_approved: true, EMA_approved: true, PMDA_approved: true },
      manufacturing_capabilities: ['Monoclonal Antibodies', 'Personalized Medicine', 'Diagnostics', 'Oncology'],
      quality_certifications: ['GMP', 'FDA Registered', 'EMA Certified', 'ISO 15189'],
      contact_info: { website: 'roche.com', phone: '+41-61-688-1111' },
      partnership_tier: 'preferred',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Merck & Co',
      manufacturer_type: 'pharma',
      headquarters_location: 'Rahway, NJ, USA',
      regulatory_status: { FDA_approved: true, EMA_approved: true, PMDA_approved: true },
      manufacturing_capabilities: ['Immunotherapy', 'Oncology', 'Vaccines', 'Biologics'],
      quality_certifications: ['GMP', 'FDA Registered', 'EMA Certified'],
      contact_info: { website: 'merck.com', phone: '+1-908-740-4000' },
      partnership_tier: 'preferred',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'Advanced Accelerator Applications (AAA)',
      manufacturer_type: 'biotech',
      headquarters_location: 'Saint-Genis-Pouilly, France',
      regulatory_status: { FDA_approved: true, EMA_approved: true, PMDA_approved: false },
      manufacturing_capabilities: ['Radiopharmaceuticals', 'Theranostics', 'Nuclear Medicine'],
      quality_certifications: ['GMP', 'Radiopharmaceutical License', 'EMA Certified'],
      contact_info: { website: 'adacap.com', phone: '+33-4-50-20-80-50' },
      partnership_tier: 'standard',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  manufacturers.push(...manufacturerData);

  // Generate products for each therapy
  let productIndex = 0;
  for (const therapy of therapies) {
    const therapyModalities = getModalitiesForTherapy(therapy.therapy_type, modalities);
    const therapyManufacturers = getManufacturersForTherapy(therapy.therapy_type, manufacturers);

    for (let i = 0; i < Math.min(2, therapyManufacturers.length); i++) {
      const modality = therapyModalities[i % therapyModalities.length];
      const manufacturer = therapyManufacturers[i];

      const product = {
        id: crypto.randomUUID(),
        name: therapy.name,
        brand_name: therapy.name.split(' ')[0],
        therapy_id: therapy.id,
        modality_id: modality.id,
        manufacturer_id: manufacturer.id,
        product_status: getProductStatus(therapy.name),
        ndc_number: generateNDCNumber(),
        approval_date: getApprovalDate(therapy.name),
        indication: therapy.indication,
        dosing_information: generateDosingInformation(therapy.therapy_type),
        contraindications: generateContraindications(therapy.therapy_type),
        special_populations: generateSpecialPopulations(),
        distribution_requirements: generateDistributionRequirements(therapy.therapy_type),
        pricing_information: generatePricingInformation(therapy.therapy_type),
        market_access_considerations: generateMarketAccessConsiderations(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      products.push(product);

      // Generate clinical trials
      const trial = generateClinicalTrial(product);
      clinical_trials.push(trial);

      // Generate commercial products
      if (product.product_status === 'approved') {
        const commercialProduct = generateCommercialProduct(product);
        commercial_products.push(commercialProduct);
      }

      productIndex++;
    }
  }

  return {
    therapies,
    modalities,
    manufacturers,
    products,
    clinical_trials,
    commercial_products
  };
}

function getModalitiesForTherapy(therapyType: string, modalities: any[]): any[] {
  const modalityMap: Record<string, string[]> = {
    'car_t_cell': ['Autologous CAR-T'],
    'gene_therapy': ['Viral Vector Gene Therapy'],
    'advanced_biologics': ['Antisense Oligonucleotide', 'Monoclonal Antibody'],
    'personalized_medicine': ['Monoclonal Antibody'],
    'radioligand_therapy': ['Radioligand Therapy'],
    'cell_therapy': ['Autologous CAR-T'],
    'immunotherapy': ['Monoclonal Antibody'],
    'other_cgat': ['Viral Vector Gene Therapy']
  };

  const targetModalityNames = modalityMap[therapyType] || ['Monoclonal Antibody'];
  return modalities.filter(m => targetModalityNames.includes(m.name));
}

function getManufacturersForTherapy(therapyType: string, manufacturers: any[]): any[] {
  const manufacturerMap: Record<string, string[]> = {
    'car_t_cell': ['Novartis', 'Gilead Sciences', 'Bristol Myers Squibb', 'Johnson & Johnson'],
    'gene_therapy': ['Novartis', 'Vertex Pharmaceuticals', 'Biogen'],
    'advanced_biologics': ['Biogen', 'Roche', 'Novartis'],
    'personalized_medicine': ['Roche', 'Merck & Co', 'Bristol Myers Squibb'],
    'radioligand_therapy': ['Advanced Accelerator Applications (AAA)', 'Novartis'],
    'cell_therapy': ['Novartis', 'Gilead Sciences', 'Bristol Myers Squibb'],
    'immunotherapy': ['Merck & Co', 'Roche', 'Bristol Myers Squibb'],
    'other_cgat': ['Novartis', 'Johnson & Johnson', 'Vertex Pharmaceuticals']
  };

  const targetManufacturerNames = manufacturerMap[therapyType] || ['Novartis'];
  return manufacturers.filter(m => targetManufacturerNames.includes(m.name));
}

function getProductStatus(therapyName: string): string {
  const approvedTherapies = [
    'Kymriah', 'Yescarta', 'Breyanzi', 'Abecma', 'Carvykti',
    'Zolgensma', 'Luxturna', 'Casgevy', 'Lyfgenia',
    'Spinraza', 'Eteplirsen', 'Keytruda', 'Herceptin',
    'Pluvicto', 'Lutathera', 'Azedra'
  ];

  return approvedTherapies.some(name => therapyName.includes(name)) ? 'approved' : 'phase_3';
}

function generateNDCNumber(): string {
  const manufacturer = Math.floor(Math.random() * 90000) + 10000;
  const product = Math.floor(Math.random() * 900) + 100;
  const package = Math.floor(Math.random() * 90) + 10;
  return `${manufacturer}-${product}-${package}`;
}

function getApprovalDate(therapyName: string): string {
  const approvalDates: Record<string, string> = {
    'Kymriah': '2017-08-30',
    'Yescarta': '2017-10-18',
    'Breyanzi': '2021-02-05',
    'Abecma': '2021-03-26',
    'Carvykti': '2022-02-28',
    'Zolgensma': '2019-05-24',
    'Luxturna': '2017-12-19',
    'Casgevy': '2023-12-08',
    'Spinraza': '2016-12-23',
    'Keytruda': '2014-09-04',
    'Herceptin': '1998-09-25',
    'Pluvicto': '2022-03-23',
    'Lutathera': '2018-01-26',
    'Azedra': '2018-07-30'
  };

  for (const [key, date] of Object.entries(approvalDates)) {
    if (therapyName.includes(key)) {
      return date;
    }
  }

  return new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function generateDosingInformation(therapyType: string): Record<string, unknown> {
  const dosingTemplates: Record<string, Record<string, unknown>> = {
    'car_t_cell': {
      regimen: 'Single infusion',
      route: 'IV infusion',
      duration: '15-30 minutes',
      premedication: 'Acetaminophen, antihistamine, corticosteroids'
    },
    'gene_therapy': {
      regimen: 'Single dose',
      route: 'IV infusion or direct injection',
      duration: '60 minutes',
      premedication: 'Corticosteroids, antihistamines'
    },
    'radioligand_therapy': {
      regimen: 'Every 6-8 weeks x 4-6 cycles',
      route: 'IV infusion',
      duration: '30 minutes',
      premedication: 'Antiemetics, amino acid infusion'
    },
    'personalized_medicine': {
      regimen: 'Every 3 weeks',
      route: 'IV infusion',
      duration: '30-90 minutes',
      premedication: 'Antihistamines as needed'
    }
  };

  return dosingTemplates[therapyType] || dosingTemplates['personalized_medicine'];
}

function generateContraindications(therapyType: string): string[] {
  const contraindications: Record<string, string[]> = {
    'car_t_cell': ['Active CNS disease', 'Severe cardiac dysfunction', 'Active uncontrolled infection'],
    'gene_therapy': ['Severe immunodeficiency', 'Active viral infection', 'Pregnancy'],
    'radioligand_therapy': ['Pregnancy', 'Breastfeeding', 'Severe renal impairment'],
    'personalized_medicine': ['Severe autoimmune disease', 'Active infection', 'Pregnancy in certain cases']
  };

  return contraindications[therapyType] || contraindications['personalized_medicine'];
}

function generateSpecialPopulations(): Record<string, unknown> {
  return {
    pregnancy: 'Category D - Potential fetal risk',
    lactation: 'Discontinue breastfeeding',
    pediatric: 'Safety and efficacy established in pediatric patients',
    geriatric: 'No dose adjustment required',
    renal_impairment: 'Monitor closely',
    hepatic_impairment: 'Use with caution'
  };
}

function generateDistributionRequirements(therapyType: string): Record<string, unknown> {
  const requirements: Record<string, Record<string, unknown>> = {
    'car_t_cell': {
      storage: 'Cryopreserved at < -130°C',
      transport: 'Specialized courier with temperature monitoring',
      handling: 'Qualified site personnel only',
      rems: 'Risk Evaluation and Mitigation Strategy required'
    },
    'gene_therapy': {
      storage: 'Frozen at -80°C or below',
      transport: 'Temperature-controlled shipment',
      handling: 'Specialized facility required',
      rems: 'REMS program enrollment required'
    },
    'radioligand_therapy': {
      storage: 'Refrigerated 2-8°C',
      transport: 'Radioactive material shipping regulations',
      handling: 'Radiation safety protocols required',
      rems: 'Nuclear pharmacy dispensing only'
    }
  };

  return requirements[therapyType] || {
    storage: 'Refrigerated 2-8°C',
    transport: 'Temperature-controlled',
    handling: 'Standard pharmaceutical handling'
  };
}

function generatePricingInformation(therapyType: string): Record<string, unknown> {
  const pricing: Record<string, Record<string, unknown>> = {
    'car_t_cell': {
      wholesale: '$350,000 - $450,000',
      patient_cost: 'Varies by insurance',
      reimbursement: 'Medicare/Medicaid covered',
      value_based: 'Outcomes-based contracts available'
    },
    'gene_therapy': {
      wholesale: '$1,000,000 - $2,100,000',
      patient_cost: 'Varies by insurance',
      reimbursement: 'Medicare/Medicaid covered',
      value_based: 'Installment payment options'
    },
    'radioligand_therapy': {
      wholesale: '$40,000 - $60,000 per cycle',
      patient_cost: 'Varies by insurance',
      reimbursement: 'Medicare Part B covered',
      value_based: 'Standard commercial terms'
    }
  };

  return pricing[therapyType] || {
    wholesale: 'Contact for pricing',
    patient_cost: 'Varies by insurance',
    reimbursement: 'Check with payer'
  };
}

function generateMarketAccessConsiderations(): Record<string, unknown> {
  return {
    reimbursement: 'Prior authorization may be required',
    coverage_criteria: 'Biomarker testing required',
    patient_assistance: 'Patient support program available',
    specialty_pharmacy: 'Specialty pharmacy network required'
  };
}

function generateClinicalTrial(product: any): any {
  return {
    id: crypto.randomUUID(),
    nct_number: `NCT${Math.floor(Math.random() * 90000000) + 10000000}`,
    title: `Phase III Study of ${product.name} in ${product.indication}`,
    product_id: product.id,
    trial_status: product.product_status === 'approved' ? 'completed' : 'recruiting',
    phase: product.product_status === 'approved' ? 'phase_3' : 'phase_2',
    primary_indication: product.indication,
    patient_population: 'Adults with relapsed/refractory disease',
    enrollment_target: Math.floor(Math.random() * 400) + 100,
    enrollment_current: Math.floor(Math.random() * 300) + 50,
    primary_endpoint: 'Overall response rate',
    secondary_endpoints: ['Overall survival', 'Progression-free survival', 'Safety'],
    investigational_sites: { count: Math.floor(Math.random() * 50) + 10, countries: ['US', 'EU', 'Canada'] },
    sponsor_info: { name: 'Sponsor Pharmaceuticals', type: 'Industry' },
    start_date: new Date(Date.now() - Math.random() * 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimated_completion_date: new Date(Date.now() + Math.random() * 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    trial_locations: ['United States', 'European Union', 'Canada'],
    eligibility_criteria: {
      inclusion: ['Age ≥18 years', 'Confirmed diagnosis', 'ECOG 0-2'],
      exclusion: ['Active CNS disease', 'Uncontrolled infection', 'Pregnancy']
    },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function generateCommercialProduct(product: any): any {
  return {
    id: crypto.randomUUID(),
    product_id: product.id,
    launch_date: product.approval_date,
    market_regions: ['US', 'EU', 'Canada', 'Australia'],
    reimbursement_status: {
      medicare: 'Covered',
      medicaid: 'Covered',
      commercial: 'Prior authorization required'
    },
    patient_access_programs: {
      copay_assistance: true,
      free_drug_program: true,
      foundation_support: true
    },
    distribution_channels: ['Specialty pharmacy', 'Hospital', 'Clinic'],
    volume_projections: {
      year_1: '500-1000 patients',
      year_3: '2000-3000 patients',
      peak: '5000+ patients'
    },
    competitive_landscape: {
      direct_competitors: ['Competitor A', 'Competitor B'],
      market_position: 'First-in-class or best-in-class',
      differentiation: 'Superior efficacy and safety profile'
    },
    key_opinion_leaders: ['Dr. Smith', 'Dr. Johnson', 'Dr. Brown'],
    medical_affairs_contacts: {
      medical_director: 'Dr. Medical Director',
      msl_lead: 'MSL Lead Name',
      outcomes_research: 'Outcomes Research Lead'
    },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function insertTherapyData(supabase: any, data: TherapyData): Promise<void> {
  console.log('Inserting therapy data...');

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
    .from('modalities')
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
    .from('products')
    .upsert(data.products, { onConflict: 'name' });
  
  if (productError) {
    console.error('Error inserting products:', productError);
    throw productError;
  }

  // Insert clinical trials
  const { error: trialError } = await supabase
    .from('clinical_trials')
    .upsert(data.clinical_trials, { onConflict: 'nct_number' });
  
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