
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SeedDataRequest {
  action: 'load_seed_data' | 'import_csv' | 'get_schema';
  table?: string;
  data?: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { action, table, data }: SeedDataRequest = await req.json()
    console.log(`📡 Data loader API called with action: ${action}`)

    switch (action) {
      case 'get_schema':
        // Get table schema information
        const { data: schemaData, error: schemaError } = await supabaseClient
          .from('information_schema.columns')
          .select('table_name, column_name, data_type, is_nullable')
          .eq('table_schema', 'public')
          .in('table_name', [
            'therapies', 'manufacturers', 'modalities', 'products', 
            'services', 'service_providers', 'clinical_trials', 'commercial_products'
          ])

        if (schemaError) {
          console.error('❌ Schema error:', schemaError)
          throw schemaError
        }

        return new Response(
          JSON.stringify({ success: true, schema: schemaData }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )

      case 'import_csv':
        if (!table || !data) {
          throw new Error('Table name and data are required for CSV import')
        }

        console.log(`📊 Importing ${data.length} records to ${table}`)

        const { error: importError } = await supabaseClient
          .from(table)
          .upsert(data)

        if (importError) {
          console.error(`❌ Import error for ${table}:`, importError)
          throw importError
        }

        console.log(`✅ Successfully imported ${data.length} records to ${table}`)

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Successfully imported ${data.length} records to ${table}`,
            recordsImported: data.length
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )

      case 'load_seed_data':
        // This would load predefined seed data
        const seedResults = await loadAllSeedData(supabaseClient)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Seed data loaded successfully',
            results: seedResults
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('❌ Data loader error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function loadAllSeedData(supabaseClient: any) {
  console.log('🚀 Loading all seed data...')
  
  const results = {
    therapies: 0,
    manufacturers: 0,
    modalities: 0,
    products: 0,
    services: 0,
    service_providers: 0,
    clinical_trials: 0,
    commercial_products: 0
  }

  // Sample seed data (you can expand this)
  const seedTherapies = [
    {
      name: 'CAR-T Cell Therapy',
      therapy_type: 'cell_gene_therapy',
      description: 'Chimeric Antigen Receptor T-Cell Therapy for hematologic malignancies',
      indication_areas: ['Oncology', 'Hematology'],
      regulatory_status: 'FDA Approved',
      is_active: true
    },
    {
      name: 'Gene Editing Therapy',
      therapy_type: 'gene_editing',
      description: 'CRISPR-based gene editing for genetic disorders',
      indication_areas: ['Genetic Disorders', 'Rare Diseases'],
      regulatory_status: 'Clinical Trial',
      is_active: true
    }
  ]

  const seedManufacturers = [
    {
      name: 'Gilead Sciences',
      manufacturer_type: 'biopharmaceutical',
      headquarters_location: 'Foster City, CA',
      quality_certifications: ['FDA', 'EMA', 'GMP'],
      manufacturing_capabilities: ['Cell Therapy', 'Gene Therapy'],
      partnership_tier: 'tier_1',
      is_active: true
    },
    {
      name: 'Novartis',
      manufacturer_type: 'biopharmaceutical',
      headquarters_location: 'Basel, Switzerland',
      quality_certifications: ['FDA', 'EMA', 'GMP', 'ISO'],
      manufacturing_capabilities: ['CAR-T', 'Gene Therapy', 'Cell Therapy'],
      partnership_tier: 'tier_1',
      is_active: true
    }
  ]

  try {
    // Load therapies
    const { error: therapiesError } = await supabaseClient
      .from('therapies')
      .upsert(seedTherapies, { onConflict: 'name' })
    
    if (!therapiesError) results.therapies = seedTherapies.length

    // Load manufacturers
    const { error: manufacturersError } = await supabaseClient
      .from('manufacturers')
      .upsert(seedManufacturers, { onConflict: 'name' })
    
    if (!manufacturersError) results.manufacturers = seedManufacturers.length

    console.log('✅ Seed data loading completed:', results)
    return results

  } catch (error) {
    console.error('❌ Error loading seed data:', error)
    throw error
  }
}
