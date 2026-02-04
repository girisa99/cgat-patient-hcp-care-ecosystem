/**
 * Generate Template Thumbnails using Multi-Provider AI
 * Uses Gemini, ModelsLab, OpenAI DALL-E, DeepSeek with regional routing
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Provider configuration with regional routing
const PROVIDERS = {
  gemini: {
    id: 'gemini',
    name: 'Gemini 2.5 Flash',
    regions: ['western', 'global'],
    priority: 1,
  },
  modelslab: {
    id: 'modelslab',
    name: 'ModelsLab FLUX',
    regions: ['western', 'global'],
    priority: 2,
  },
  openai: {
    id: 'openai',
    name: 'OpenAI DALL-E 3',
    regions: ['western', 'global'],
    priority: 3,
  },
  alibaba: {
    id: 'alibaba',
    name: 'Alibaba Wanx',
    regions: ['cjk', 'mena'],
    priority: 1,
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek Image',
    regions: ['cjk'],
    priority: 2,
  },
};

// Regional mapping for optimal provider selection
function getProviderForRegion(region: string): string {
  const regionProviders: Record<string, string[]> = {
    western: ['gemini', 'modelslab', 'openai'],
    cjk: ['alibaba', 'deepseek', 'gemini'],
    mena: ['alibaba', 'gemini', 'modelslab'],
    sea: ['gemini', 'modelslab', 'alibaba'],
    global: ['gemini', 'modelslab', 'openai'],
  };
  
  const providers = regionProviders[region] || regionProviders.global;
  return providers[0]; // Return primary for region
}

// Category-specific visual prompts
const CATEGORY_PROMPTS: Record<string, string> = {
  marketing: 'Professional marketing video thumbnail with bold text overlay, gradient background, modern SaaS aesthetic, product showcase style',
  educational: 'Clean educational tutorial thumbnail with whiteboard elements, organized layout, academic feel, instructional design',
  storytelling: 'Cinematic storytelling thumbnail with dramatic lighting, narrative feel, film-quality composition, emotional impact',
  announcement: 'Exciting announcement thumbnail with celebration elements, news broadcast style, attention-grabbing design',
  healthcare: 'Professional healthcare video thumbnail with medical elements, trustworthy blue tones, clean clinical aesthetic',
  entertainment: 'Vibrant entertainment thumbnail with dynamic colors, engaging visuals, fun and energetic mood',
  corporate: 'Professional corporate thumbnail with business elements, executive style, polished and trustworthy',
  tech: 'Modern tech thumbnail with futuristic elements, digital interface mockups, innovation-focused design',
  regional_cjk: 'Elegant Asian-inspired design with balanced composition, subtle gradients, calligraphy-influenced aesthetics',
  regional_mena: 'Arabic-inspired geometric patterns, rich jewel tones, ornate yet modern design elements',
  regional_sea: 'Tropical vibrant colors, cultural fusion elements, warm and welcoming aesthetic',
};

// Generate with Gemini via Lovable Gateway
async function generateWithGemini(prompt: string): Promise<string | null> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.log('⚠️ LOVABLE_API_KEY not configured, skipping Gemini');
    return null;
  }

  try {
    console.log('🎨 Generating with Gemini...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      console.error('Gemini error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
  } catch (error) {
    console.error('Gemini generation failed:', error);
    return null;
  }
}

// Generate with ModelsLab
async function generateWithModelsLab(prompt: string): Promise<string | null> {
  const MODELSLAB_API_KEY = Deno.env.get('MODELSLAB_API_KEY');
  if (!MODELSLAB_API_KEY) {
    console.log('⚠️ MODELSLAB_API_KEY not configured, skipping ModelsLab');
    return null;
  }

  try {
    console.log('🎨 Generating with ModelsLab...');
    const response = await fetch('https://modelslab.com/api/v6/images/text2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: MODELSLAB_API_KEY,
        prompt: prompt,
        negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy',
        width: 1280,
        height: 720,
        samples: 1,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        safety_checker: false,
        enhance_prompt: true,
      }),
    });

    if (!response.ok) {
      console.error('ModelsLab error:', await response.text());
      return null;
    }

    const data = await response.json();
    
    // Handle async generation
    if (data.status === 'processing' && data.fetch_result) {
      // Poll for result
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const pollRes = await fetch(data.fetch_result);
        const pollData = await pollRes.json();
        if (pollData.status === 'success' && pollData.output?.[0]) {
          return pollData.output[0];
        }
        if (pollData.status === 'failed') break;
      }
      return null;
    }
    
    return data.output?.[0] || null;
  } catch (error) {
    console.error('ModelsLab generation failed:', error);
    return null;
  }
}

// Generate with OpenAI DALL-E
async function generateWithOpenAI(prompt: string): Promise<string | null> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.log('⚠️ OPENAI_API_KEY not configured, skipping OpenAI');
    return null;
  }

  try {
    console.log('🎨 Generating with OpenAI DALL-E...');
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      console.error('OpenAI error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (error) {
    console.error('OpenAI generation failed:', error);
    return null;
  }
}

// Upload base64 to storage
async function uploadToStorage(
  supabase: any, 
  base64Data: string, 
  filename: string
): Promise<string | null> {
  try {
    let imageData = base64Data;
    if (base64Data.includes(',')) {
      imageData = base64Data.split(',')[1];
    }

    const binaryStr = atob(imageData);
    const imageBuffer = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      imageBuffer[i] = binaryStr.charCodeAt(i);
    }

    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(`template-thumbnails/${filename}`, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(`template-thumbnails/${filename}`);

    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

// Generate thumbnail with fallback chain
async function generateThumbnail(
  supabase: any,
  blueprint: any,
  region: string = 'global'
): Promise<string | null> {
  const categoryPrompt = CATEGORY_PROMPTS[blueprint.category] || CATEGORY_PROMPTS.marketing;
  const regionalStyle = region === 'cjk' ? CATEGORY_PROMPTS.regional_cjk :
                        region === 'mena' ? CATEGORY_PROMPTS.regional_mena :
                        region === 'sea' ? CATEGORY_PROMPTS.regional_sea : '';
  
  const fullPrompt = `Create a professional video thumbnail for "${blueprint.name}". 
${blueprint.description}
Style: ${categoryPrompt}
${regionalStyle ? `Regional aesthetic: ${regionalStyle}` : ''}
Resolution: 16:9 aspect ratio, 1280x720, high quality, no text overlays.
Visual elements: Modern, clean, professional, suitable for video platform thumbnails.`;

  console.log(`📸 Generating thumbnail for: ${blueprint.name} (${region})`);
  
  // Try providers in order based on region
  const primaryProvider = getProviderForRegion(region);
  const fallbackOrder = ['gemini', 'modelslab', 'openai'];
  
  // Reorder to prioritize regional provider
  const providerOrder = [primaryProvider, ...fallbackOrder.filter(p => p !== primaryProvider)];
  
  let imageUrl: string | null = null;
  let usedProvider = '';
  
  for (const provider of providerOrder) {
    switch (provider) {
      case 'gemini':
        imageUrl = await generateWithGemini(fullPrompt);
        break;
      case 'modelslab':
        imageUrl = await generateWithModelsLab(fullPrompt);
        break;
      case 'openai':
        imageUrl = await generateWithOpenAI(fullPrompt);
        break;
    }
    
    if (imageUrl) {
      usedProvider = provider;
      console.log(`✅ Generated with ${provider}`);
      break;
    }
  }
  
  if (!imageUrl) {
    console.log(`❌ All providers failed for ${blueprint.name}`);
    return null;
  }
  
  // If base64, upload to storage
  if (imageUrl.startsWith('data:')) {
    const filename = `${blueprint.id}-${Date.now()}.jpg`;
    imageUrl = await uploadToStorage(supabase, imageUrl, filename);
  }
  
  // Update blueprint with thumbnail
  if (imageUrl) {
    await supabase
      .from('video_blueprints')
      .update({ 
        thumbnail_url: imageUrl,
        style_preset: {
          ...blueprint.style_preset,
          thumbnail_provider: usedProvider,
          thumbnail_generated_at: new Date().toISOString(),
        }
      })
      .eq('id', blueprint.id);
  }
  
  return imageUrl;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blueprintId, generateAll, region = 'global', regenerate = false } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch blueprints to generate thumbnails for
    let query = supabase.from('video_blueprints').select('*').eq('is_active', true);
    
    if (blueprintId) {
      query = query.eq('id', blueprintId);
    } else if (!generateAll) {
      // Only generate for those missing thumbnails
      query = regenerate ? query : query.is('thumbnail_url', null);
    }
    
    const { data: blueprints, error } = await query;
    
    if (error) throw error;
    
    console.log(`📸 Generating thumbnails for ${blueprints.length} templates (region: ${region})`);
    
    const results: { id: string; name: string; thumbnail_url: string | null; success: boolean }[] = [];
    
    for (const blueprint of blueprints) {
      const thumbnailUrl = await generateThumbnail(supabase, blueprint, region);
      results.push({
        id: blueprint.id,
        name: blueprint.name,
        thumbnail_url: thumbnailUrl,
        success: !!thumbnailUrl,
      });
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({
        success: true,
        generated: successCount,
        failed: results.length - successCount,
        total: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
