import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Therapy {
  id: string;
  name: string;
  therapy_type: string;
  indication?: string;
  description?: string;
  mechanism_of_action?: string;
}

interface GeneratedProduct {
  name: string;
  brand_name: string;
  indication: string;
  mechanism_of_action: string;
  dosing_information: any;
  contraindications: string[];
  special_populations: any;
  distribution_requirements: any;
  pricing_information: any;
  market_access_considerations: any;
  product_status: 'preclinical' | 'phase_1' | 'phase_2' | 'phase_3' | 'approved' | 'discontinued';
  ndc_number?: string;
  approval_date?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { therapy_ids } = await req.json();

    if (!therapy_ids || !Array.isArray(therapy_ids)) {
      throw new Error('therapy_ids array is required');
    }

    // Fetch therapy details
    const { data: therapies, error: therapyError } = await supabaseClient
      .from('therapies')
      .select('*')
      .in('id', therapy_ids);

    if (therapyError) throw therapyError;

    // Get manufacturers and modalities
    const { data: manufacturers } = await supabaseClient
      .from('manufacturers')
      .select('*')
      .eq('is_active', true)
      .limit(10);

    const { data: modalities } = await supabaseClient
      .from('modalities')
      .select('*')
      .eq('is_active', true);

    const results = [];

    for (const therapy of therapies) {
      console.log(`Generating products for therapy: ${therapy.name}`);
      
      const products = await generateProductsForTherapy(therapy, manufacturers || [], modalities || []);
      
      for (const productData of products) {
        // Insert product
        const { data: product, error: productError } = await supabaseClient
          .from('products')
          .insert({
            ...productData,
            therapy_id: therapy.id,
            manufacturer_id: manufacturers?.[Math.floor(Math.random() * manufacturers.length)]?.id,
            modality_id: modalities?.[Math.floor(Math.random() * modalities.length)]?.id,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (productError) {
          console.error('Error inserting product:', productError);
          continue;
        }

        // Create commercial product
        const { error: commercialError } = await supabaseClient
          .from('commercial_products')
          .insert({
            product_id: product.id,
            launch_date: productData.approval_date || new Date().toISOString().split('T')[0],
            market_regions: ['US', 'EU'],
            reimbursement_status: {
              medicare: 'covered',
              medicaid: 'covered',
              private_insurance: 'varies'
            },
            patient_access_programs: {
              copay_assistance: true,
              patient_foundation: true,
              free_drug_program: true
            },
            distribution_channels: ['specialty_pharmacy', 'hospital', 'clinic'],
            volume_projections: {
              year1: Math.floor(Math.random() * 1000) + 100,
              year2: Math.floor(Math.random() * 2000) + 500,
              year3: Math.floor(Math.random() * 3000) + 1000
            },
            competitive_landscape: {
              main_competitors: [`Competitor A for ${therapy.therapy_type}`, `Competitor B for ${therapy.therapy_type}`],
              market_share: `${Math.floor(Math.random() * 30) + 10}%`
            },
            key_opinion_leaders: [
              'Dr. Sarah Johnson - Oncology',
              'Dr. Michael Chen - Hematology',
              'Dr. Emily Rodriguez - Gene Therapy'
            ],
            medical_affairs_contacts: {
              medical_director: 'medical.affairs@company.com',
              clinical_liaison: 'clinical.affairs@company.com'
            },
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (commercialError) {
          console.error('Error inserting commercial product:', commercialError);
        }

        results.push({
          therapy_name: therapy.name,
          product_name: productData.name,
          product_id: product.id
        });
      }
    }

    return new Response(JSON.stringify({ 
      message: `Generated ${results.length} products for ${therapies.length} therapies`,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-therapy-products function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateProductsForTherapy(therapy: Therapy, manufacturers: any[], modalities: any[]): Promise<GeneratedProduct[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    // Fallback to template-based generation
    return generateTemplateProducts(therapy);
  }

  try {
    const prompt = `Generate 2-3 realistic pharmaceutical products for this therapy:

Therapy: ${therapy.name}
Type: ${therapy.therapy_type}
Indication: ${therapy.indication || 'Not specified'}
Description: ${therapy.description || 'Not specified'}
Mechanism: ${therapy.mechanism_of_action || 'Not specified'}

Create realistic products that would be developed for this therapy. Include:
- Product name (scientific/generic)
- Brand name (commercial)
- Detailed indication
- Mechanism of action
- Dosing information (realistic dosing regimen)
- Contraindications (relevant medical contraindications)
- Special populations considerations
- Distribution requirements
- Pricing information (realistic ranges)
- Market access considerations
- Development status (phase or approved)
- NDC number (if approved)
- Approval date (if approved)

Return as JSON array with this exact structure:
[{
  "name": "string",
  "brand_name": "string", 
  "indication": "string",
  "mechanism_of_action": "string",
  "dosing_information": {"regimen": "string", "route": "string", "frequency": "string"},
  "contraindications": ["string"],
  "special_populations": {"pregnancy": "string", "pediatric": "string", "elderly": "string"},
  "distribution_requirements": {"storage": "string", "handling": "string"},
  "pricing_information": {"wholesale": "string", "patient_cost": "string"},
  "market_access_considerations": {"reimbursement": "string", "access_programs": "string"},
  "product_status": "approved|phase_3|phase_2|phase_1|preclinical",
  "ndc_number": "string|null",
  "approval_date": "YYYY-MM-DD|null"
}]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a pharmaceutical product development expert. Generate realistic, scientifically accurate products based on therapy information. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in OpenAI response');
    }

    const products = JSON.parse(jsonMatch[0]);
    return products;

  } catch (error) {
    console.error('OpenAI generation failed, using template:', error);
    return generateTemplateProducts(therapy);
  }
}

function generateTemplateProducts(therapy: Therapy): GeneratedProduct[] {
  const baseProductName = therapy.name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const therapyTypeShort = therapy.therapy_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const products: GeneratedProduct[] = [
    {
      name: `${baseProductName} Injectable`,
      brand_name: `${therapyTypeShort}™`,
      indication: therapy.indication || `Treatment for ${therapy.therapy_type} related conditions`,
      mechanism_of_action: therapy.mechanism_of_action || `Advanced ${therapy.therapy_type} mechanism targeting specific cellular pathways`,
      dosing_information: {
        regimen: '1-2 doses per treatment cycle',
        route: 'Intravenous',
        frequency: 'Once every 3-4 weeks',
        dose_range: '50-200 mg/m²'
      },
      contraindications: [
        'Hypersensitivity to active ingredients',
        'Severe immunodeficiency',
        'Active infections',
        'Pregnancy (Category X)'
      ],
      special_populations: {
        pregnancy: 'Contraindicated - may cause fetal harm',
        pediatric: 'Safety and efficacy not established in children under 18',
        elderly: 'Use with caution - may require dose adjustment',
        renal_impairment: 'Dose adjustment recommended for severe impairment'
      },
      distribution_requirements: {
        storage: '2-8°C (36-46°F), protect from light',
        handling: 'Requires specialized handling and administration',
        transport: 'Cold chain distribution required',
        preparation: 'Aseptic preparation in certified facility'
      },
      pricing_information: {
        wholesale: '$50,000-$150,000 per treatment course',
        patient_cost: '$10,000-$25,000 after insurance and assistance programs',
        cost_per_dose: '$25,000-$75,000'
      },
      market_access_considerations: {
        reimbursement: 'Covered by Medicare Part B and most commercial payers',
        access_programs: 'Patient assistance program available',
        prior_authorization: 'Required by most payers',
        specialty_pharmacy: 'Available through select specialty pharmacies'
      },
      product_status: Math.random() > 0.3 ? 'approved' : 'phase_3',
      ndc_number: Math.random() > 0.3 ? `12345-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}` : undefined,
      approval_date: Math.random() > 0.3 ? '2023-06-15' : undefined
    }
  ];

  // Add a second product variant
  if (Math.random() > 0.4) {
    products.push({
      name: `${baseProductName} Extended Release`,
      brand_name: `${therapyTypeShort} XR™`,
      indication: therapy.indication || `Long-term treatment for ${therapy.therapy_type} related conditions`,
      mechanism_of_action: therapy.mechanism_of_action || `Extended-release formulation with sustained ${therapy.therapy_type} activity`,
      dosing_information: {
        regimen: '1 dose per treatment cycle',
        route: 'Subcutaneous',
        frequency: 'Once every 6-8 weeks',
        dose_range: '100-300 mg'
      },
      contraindications: [
        'Hypersensitivity to active ingredients',
        'Severe hepatic impairment',
        'Active malignancy (excluding target indication)',
        'Pregnancy and lactation'
      ],
      special_populations: {
        pregnancy: 'Category C - use only if benefits outweigh risks',
        pediatric: 'Approved for patients 12 years and older',
        elderly: 'No dose adjustment required',
        hepatic_impairment: 'Contraindicated in severe impairment'
      },
      distribution_requirements: {
        storage: 'Room temperature (15-30°C), do not freeze',
        handling: 'Single-use prefilled syringes',
        transport: 'Standard pharmaceutical distribution',
        preparation: 'Ready-to-use formulation'
      },
      pricing_information: {
        wholesale: '$75,000-$200,000 per treatment course',
        patient_cost: '$15,000-$35,000 after insurance and assistance programs',
        cost_per_dose: '$37,500-$100,000'
      },
      market_access_considerations: {
        reimbursement: 'Preferred formulary status with major payers',
        access_programs: 'Comprehensive patient support program',
        prior_authorization: 'Streamlined approval process for qualified patients',
        specialty_pharmacy: 'Available through expanded specialty pharmacy network'
      },
      product_status: Math.random() > 0.6 ? 'approved' : 'phase_2',
      ndc_number: Math.random() > 0.6 ? `12345-${Math.floor(Math.random() * 900) + 400}-${Math.floor(Math.random() * 90) + 10}` : undefined,
      approval_date: Math.random() > 0.6 ? '2024-01-22' : undefined
    });
  }

  return products;
}