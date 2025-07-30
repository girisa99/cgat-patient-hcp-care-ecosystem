import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductGenerationRequest {
  therapy_ids: string[];
  ai_providers?: string[];
  use_mcp?: boolean;
  small_model_fallback?: boolean;
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

    const { 
      therapy_ids, 
      ai_providers = ['openai', 'claude'], 
      use_mcp = false, 
      small_model_fallback = true 
    }: ProductGenerationRequest = await req.json();

    if (!therapy_ids || !Array.isArray(therapy_ids)) {
      throw new Error('therapy_ids array is required');
    }

    console.log('Healthcare Agentic Orchestrator starting with providers:', ai_providers);

    // Fetch therapy details
    const { data: therapies, error: therapyError } = await supabaseClient
      .from('therapies')
      .select('*')
      .in('id', therapy_ids);

    if (therapyError) throw therapyError;

    const results = [];
    
    for (const therapy of therapies) {
      console.log(`Processing therapy: ${therapy.name} with ${ai_providers.length} AI providers`);
      
      // Try multiple AI providers for diverse product generation
      const productGenerations = await Promise.allSettled(
        ai_providers.map(provider => generateProductsWithProvider(provider, therapy))
      );

      // Combine successful generations
      const allProducts = [];
      productGenerations.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`Provider ${ai_providers[index]} generated ${result.value.length} products`);
          allProducts.push(...result.value);
        } else {
          console.error(`Provider ${ai_providers[index]} failed:`, result.reason);
        }
      });

      // If no products generated and small model fallback is enabled
      if (allProducts.length === 0 && small_model_fallback) {
        console.log('Falling back to template generation');
        allProducts.push(...generateTemplateProducts(therapy));
      }

      // Store products with AI provider attribution
      for (const productData of allProducts) {
        const { data: product, error: productError } = await supabaseClient
          .from('products')
          .insert({
            name: productData.name,
            brand_name: productData.brand_name,
            indication: productData.indication,
            dosing_information: productData.dosing_information,
            contraindications: productData.contraindications,
            special_populations: productData.special_populations,
            distribution_requirements: productData.distribution_requirements,
            pricing_information: productData.pricing_information,
            market_access_considerations: productData.market_access_considerations,
            product_status: productData.product_status,
            ndc_number: productData.ndc_number,
            approval_date: productData.approval_date,
            therapy_id: therapy.id,
            manufacturer_id: null,
            modality_id: null,
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

        results.push({
          therapy_name: therapy.name,
          product_name: productData.name,
          product_id: product.id,
          ai_provider: productData.ai_provider || 'template'
        });
      }
    }

    return new Response(JSON.stringify({
      message: `Generated ${results.length} products using ${ai_providers.join(', ')} AI providers`,
      results,
      providers_used: ai_providers,
      mcp_enabled: use_mcp
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in healthcare-agentic-orchestrator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateProductsWithProvider(provider: string, therapy: any) {
  console.log(`Generating products with ${provider} for ${therapy.name}`);
  
  switch (provider) {
    case 'openai':
      return await generateWithOpenAI(therapy);
    case 'claude':
      return await generateWithClaude(therapy);
    case 'mcp':
      return await generateWithMCP(therapy);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

async function generateWithOpenAI(therapy: any) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) throw new Error('OpenAI API key not available');

  const prompt = `Generate 1-2 realistic pharmaceutical products for therapy: ${therapy.name} (${therapy.therapy_type}). Return as JSON array: [{"name": "string", "brand_name": "string", "indication": "string", "dosing_information": {"regimen": "string", "route": "string"}, "contraindications": ["string"], "special_populations": {"pregnancy": "string"}, "distribution_requirements": {"storage": "string"}, "pricing_information": {"wholesale": "string"}, "market_access_considerations": {"reimbursement": "string"}, "product_status": "approved|phase_3|phase_2", "ndc_number": "string", "approval_date": "YYYY-MM-DD"}]`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Generate realistic pharmaceutical products. Return valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

  const data = await response.json();
  const content = data.choices[0].message.content;
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No valid JSON found in OpenAI response');

  const products = JSON.parse(jsonMatch[0]);
  return products.map((p: any) => ({ ...p, ai_provider: 'openai' }));
}

async function generateWithClaude(therapy: any) {
  const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
  if (!claudeApiKey) throw new Error('Claude API key not available');

  const prompt = `Generate 1-2 pharmaceutical products for therapy: ${therapy.name} (${therapy.therapy_type}). Return JSON array: [{"name": "string", "brand_name": "string", "indication": "string", "dosing_information": {"regimen": "string", "route": "string"}, "contraindications": ["string"], "special_populations": {"pregnancy": "string"}, "distribution_requirements": {"storage": "string"}, "pricing_information": {"wholesale": "string"}, "market_access_considerations": {"reimbursement": "string"}, "product_status": "approved|phase_3|phase_2", "ndc_number": "string", "approval_date": "YYYY-MM-DD"}]`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${claudeApiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    }),
  });

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);

  const data = await response.json();
  const content = data.content[0].text;
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No valid JSON found in Claude response');

  const products = JSON.parse(jsonMatch[0]);
  return products.map((p: any) => ({ ...p, ai_provider: 'claude' }));
}

async function generateWithMCP(therapy: any) {
  console.log('MCP integration placeholder - using template generation');
  const products = generateTemplateProducts(therapy);
  return products.map((p: any) => ({ ...p, ai_provider: 'mcp' }));
}

function generateTemplateProducts(therapy: any) {
  const baseProductName = therapy.name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  
  // Generate 3-5 products per therapy for better diversity
  const products = [];
  const productCount = Math.floor(Math.random() * 3) + 3; // 3-5 products
  
  for (let i = 0; i < productCount; i++) {
    const isCommercial = Math.random() > 0.4; // 60% chance of being commercial
    const productVariants = ['Injectable', 'Oral', 'Topical', 'IV Infusion', 'Subcutaneous'];
    const variant = productVariants[i % productVariants.length];
    
    products.push({
      name: `${baseProductName} ${variant} ${i + 1}`,
      brand_name: `${therapy.therapy_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}${i + 1}™`,
      indication: therapy.indication || `Treatment for ${therapy.therapy_type} related conditions`,
      dosing_information: {
        regimen: `${i + 1}-${i + 2} doses per treatment cycle`,
        route: variant === 'Oral' ? 'Oral' : variant === 'Topical' ? 'Topical' : 'Intravenous',
        frequency: `Once every ${2 + i}-${3 + i} weeks`
      },
      contraindications: [
        'Hypersensitivity to active ingredients', 
        'Severe immunodeficiency',
        ...(i % 2 === 0 ? ['Pregnancy'] : ['Liver impairment'])
      ],
      special_populations: {
        pregnancy: isCommercial ? 'Contraindicated - may cause fetal harm' : 'Use with caution',
        pediatric: 'Safety not established in children under 18',
        elderly: 'Use with caution - may require dose adjustment'
      },
      distribution_requirements: {
        storage: i % 2 === 0 ? '2-8°C (36-46°F), protect from light' : '-20°C, frozen storage required',
        handling: 'Requires specialized handling and administration'
      },
      pricing_information: {
        wholesale: `$${(50 + i * 25)},000-$${(150 + i * 50)},000 per treatment course`,
        patient_cost: `$${(10 + i * 5)},000-$${(25 + i * 10)},000 after insurance and assistance programs`
      },
      market_access_considerations: {
        reimbursement: isCommercial ? 'Covered by Medicare Part B and most commercial payers' : 'Limited coverage - investigational',
        access_programs: isCommercial ? 'Patient assistance program available' : 'Clinical trial access only'
      },
      product_status: isCommercial ? 'approved' : (i % 2 === 0 ? 'phase_3' : 'phase_2'),
      ndc_number: isCommercial ? `12345-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}` : null,
      approval_date: isCommercial ? `202${2 + (i % 2)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-15` : null
    });
  }
  
  return products;
}