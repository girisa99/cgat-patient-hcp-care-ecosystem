/**
 * Generate Template Thumbnails using Internal 18 AI Providers
 * 
 * Uses existing edge functions:
 * - modelslab-media (FLUX, SDXL, Midjourney-style)
 * - ai-image-generator (OpenAI DALL-E, HuggingFace FLUX, Replicate)
 * - gemini-generate-image (Google Gemini/Imagen)
 * - alibaba-3d-generator (Alibaba Wanx)
 * 
 * Regional routing based on 4-zone strategy:
 * - Western: ModelsLab, OpenAI, Replicate
 * - CJK/MENA: Alibaba, DeepSeek
 * - SEA/Global: Gemini, ModelsLab
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Internal provider configuration - 18 AI providers
const INTERNAL_PROVIDERS = {
  // Tier 1: Primary Image Providers
  modelslab_flux: {
    id: 'modelslab_flux',
    name: 'ModelsLab FLUX Pro',
    tier: 1,
    regions: ['western', 'global', 'sea'],
    costPerUnit: 0.003,
  },
  modelslab_sdxl: {
    id: 'modelslab_sdxl',
    name: 'ModelsLab SDXL',
    tier: 1,
    regions: ['western', 'global'],
    costPerUnit: 0.002,
  },
  openai_dalle: {
    id: 'openai_dalle',
    name: 'OpenAI DALL-E 3',
    tier: 2,
    regions: ['western', 'global'],
    costPerUnit: 0.04,
  },
  huggingface_flux: {
    id: 'huggingface_flux',
    name: 'HuggingFace FLUX',
    tier: 2,
    regions: ['western', 'global'],
    costPerUnit: 0.001,
  },
  replicate_flux: {
    id: 'replicate_flux',
    name: 'Replicate FLUX',
    tier: 2,
    regions: ['western', 'global'],
    costPerUnit: 0.002,
  },
  gemini_imagen: {
    id: 'gemini_imagen',
    name: 'Google Gemini Imagen',
    tier: 2,
    regions: ['sea', 'global', 'western'],
    costPerUnit: 0.002,
  },
  alibaba_wanx: {
    id: 'alibaba_wanx',
    name: 'Alibaba Wanx',
    tier: 1,
    regions: ['cjk', 'mena', 'sea'],
    costPerUnit: 0.005,
  },
  deepseek_image: {
    id: 'deepseek_image',
    name: 'DeepSeek Vision',
    tier: 2,
    regions: ['cjk'],
    costPerUnit: 0.001,
  },
};

// Regional provider priority
const REGIONAL_PRIORITY: Record<string, string[]> = {
  western: ['modelslab_flux', 'openai_dalle', 'replicate_flux', 'huggingface_flux'],
  cjk: ['alibaba_wanx', 'deepseek_image', 'modelslab_flux', 'gemini_imagen'],
  mena: ['alibaba_wanx', 'modelslab_flux', 'gemini_imagen', 'openai_dalle'],
  sea: ['gemini_imagen', 'modelslab_flux', 'alibaba_wanx', 'replicate_flux'],
  global: ['modelslab_flux', 'gemini_imagen', 'openai_dalle', 'replicate_flux'],
};

// Category-specific visual prompts
const CATEGORY_PROMPTS: Record<string, string> = {
  marketing: 'Professional marketing video thumbnail with bold text overlay, gradient background, modern SaaS aesthetic, product showcase style, 16:9 aspect ratio',
  educational: 'Clean educational tutorial thumbnail with whiteboard elements, organized layout, academic feel, instructional design, professional lighting',
  storytelling: 'Cinematic storytelling thumbnail with dramatic lighting, narrative feel, film-quality composition, emotional impact, widescreen',
  announcement: 'Exciting announcement thumbnail with celebration elements, news broadcast style, attention-grabbing design, dynamic composition',
  healthcare: 'Professional healthcare video thumbnail with medical elements, trustworthy blue tones, clean clinical aesthetic, HIPAA-compliant visual style',
  entertainment: 'Vibrant entertainment thumbnail with dynamic colors, engaging visuals, fun and energetic mood, social media optimized',
  corporate: 'Professional corporate thumbnail with business elements, executive style, polished and trustworthy, minimalist design',
  animation: 'Colorful animated style thumbnail with cartoon elements, vibrant gradients, playful character design, motion blur effects',
  '3d': 'Photorealistic 3D rendered thumbnail with volumetric lighting, product visualization style, high-fidelity materials, studio lighting',
  interactive: 'Modern interactive media thumbnail with UI elements, gamification visual cues, engagement-focused design, call-to-action style',
  image_to_video: 'Photo-to-video transformation thumbnail showing before/after style, motion lines, cinematic transition effect',
  seasonal: 'Seasonal holiday themed thumbnail with festive elements, warm colors, celebration mood, culturally appropriate symbols',
  // Regional variants
  regional_cjk: 'Elegant Asian-inspired design with balanced composition, subtle gradients, calligraphy-influenced aesthetics, harmonious colors',
  regional_mena: 'Arabic-inspired geometric patterns, rich jewel tones, ornate yet modern design elements, right-to-left visual flow',
  regional_sea: 'Tropical vibrant colors, cultural fusion elements, warm and welcoming aesthetic, natural textures',
  regional_latam: 'Bold Latin American colors, festive energy, cultural richness, warm and passionate visual style',
};

// Generate with ModelsLab (FLUX/SDXL)
async function generateWithModelsLab(prompt: string, model: string = 'flux-schnell'): Promise<{ url: string | null; provider: string }> {
  const MODELSLAB_API_KEY = Deno.env.get('MODELSLAB_API_KEY');
  if (!MODELSLAB_API_KEY) {
    console.log('⚠️ MODELSLAB_API_KEY not configured');
    return { url: null, provider: 'modelslab' };
  }

  try {
    console.log('🎨 Generating with ModelsLab', model);
    const response = await fetch('https://modelslab.com/api/v6/images/text2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: MODELSLAB_API_KEY,
        model_id: model === 'flux' ? 'flux-schnell' : 'sdxl-base-1.0',
        prompt: prompt,
        negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text',
        width: 1280,
        height: 720,
        samples: 1,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        safety_checker: true,
        enhance_prompt: true,
      }),
    });

    if (!response.ok) {
      console.error('ModelsLab error:', await response.text());
      return { url: null, provider: 'modelslab' };
    }

    const data = await response.json();
    
    // Handle async generation
    if (data.status === 'processing' && data.fetch_result) {
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const pollRes = await fetch(data.fetch_result);
        const pollData = await pollRes.json();
        if (pollData.status === 'success' && pollData.output?.[0]) {
          return { url: pollData.output[0], provider: 'modelslab_flux' };
        }
        if (pollData.status === 'failed') break;
      }
      return { url: null, provider: 'modelslab' };
    }
    
    return { url: data.output?.[0] || null, provider: model === 'flux' ? 'modelslab_flux' : 'modelslab_sdxl' };
  } catch (error) {
    console.error('ModelsLab generation failed:', error);
    return { url: null, provider: 'modelslab' };
  }
}

// Generate with OpenAI DALL-E
async function generateWithOpenAI(prompt: string): Promise<{ url: string | null; provider: string }> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.log('⚠️ OPENAI_API_KEY not configured');
    return { url: null, provider: 'openai' };
  }

  try {
    console.log('🎨 Generating with OpenAI DALL-E 3');
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
      return { url: null, provider: 'openai' };
    }

    const data = await response.json();
    return { url: data.data?.[0]?.url || null, provider: 'openai_dalle' };
  } catch (error) {
    console.error('OpenAI generation failed:', error);
    return { url: null, provider: 'openai' };
  }
}

// Generate with HuggingFace FLUX
async function generateWithHuggingFace(prompt: string): Promise<{ url: string | null; provider: string }> {
  const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
  if (!HUGGING_FACE_TOKEN) {
    console.log('⚠️ HUGGING_FACE_ACCESS_TOKEN not configured');
    return { url: null, provider: 'huggingface' };
  }

  try {
    console.log('🎨 Generating with HuggingFace FLUX');
    const response = await fetch('https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { num_inference_steps: 4, guidance_scale: 1.0 }
      }),
    });

    if (!response.ok) {
      console.error('HuggingFace error:', await response.text());
      return { url: null, provider: 'huggingface' };
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return { url: `data:image/png;base64,${base64}`, provider: 'huggingface_flux' };
  } catch (error) {
    console.error('HuggingFace generation failed:', error);
    return { url: null, provider: 'huggingface' };
  }
}

// Generate with Replicate FLUX
async function generateWithReplicate(prompt: string): Promise<{ url: string | null; provider: string }> {
  const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_TOKEN');
  if (!REPLICATE_API_KEY) {
    console.log('⚠️ REPLICATE_API_TOKEN not configured');
    return { url: null, provider: 'replicate' };
  }

  try {
    console.log('🎨 Generating with Replicate FLUX');
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'f2ab8a5569070ad23ec7c3df5b2e7b5a56f81b0afe2c3a1bb6bbf44eef2ab95e',
        input: {
          prompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "16:9",
          output_format: "webp",
          output_quality: 80,
        }
      }),
    });

    if (!response.ok) {
      console.error('Replicate error:', await response.text());
      return { url: null, provider: 'replicate' };
    }

    const prediction = await response.json();
    let result = prediction;
    
    // Poll for completion
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(r => setTimeout(r, 1000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Token ${REPLICATE_API_KEY}` },
      });
      result = await pollRes.json();
    }

    if (result.status === 'failed') {
      return { url: null, provider: 'replicate' };
    }

    return { url: result.output?.[0] || null, provider: 'replicate_flux' };
  } catch (error) {
    console.error('Replicate generation failed:', error);
    return { url: null, provider: 'replicate' };
  }
}

// Generate with Gemini/Imagen
async function generateWithGemini(prompt: string): Promise<{ url: string | null; provider: string }> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
  if (!GEMINI_API_KEY) {
    console.log('⚠️ GEMINI_API_KEY not configured');
    return { url: null, provider: 'gemini' };
  }

  try {
    console.log('🎨 Generating with Gemini Imagen');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: { text: prompt },
          numberOfImages: 1,
          aspectRatio: '16:9',
          safetyFilterLevel: 'BLOCK_MEDIUM_AND_ABOVE',
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini error:', await response.text());
      return { url: null, provider: 'gemini' };
    }

    const data = await response.json();
    const imageBytes = data.generatedImages?.[0]?.image?.imageBytes;
    
    if (!imageBytes) {
      return { url: null, provider: 'gemini' };
    }

    return { url: `data:image/png;base64,${imageBytes}`, provider: 'gemini_imagen' };
  } catch (error) {
    console.error('Gemini generation failed:', error);
    return { url: null, provider: 'gemini' };
  }
}

// Generate with Alibaba Wanx - Dual endpoint support (China + International)
async function generateWithAlibaba(prompt: string): Promise<{ url: string | null; provider: string }> {
  // Try both API keys - International (Virginia) preferred for image gen, China (Beijing) as fallback
  const intlKey = Deno.env.get('ALIBABA_API_KEY');
  const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
  const ALIBABA_API_KEY = intlKey || chinaKey;
  
  if (!ALIBABA_API_KEY) {
    console.log('⚠️ Neither ALIBABA_API_KEY nor ALIBABA_CHINA_API_KEY configured');
    return { url: null, provider: 'alibaba' };
  }

  // Route to correct endpoint based on which key is being used
  const useIntl = !!intlKey;
  const baseUrl = useIntl
    ? 'https://dashscope-intl.aliyuncs.com/api/v1'
    : 'https://dashscope.aliyuncs.com/api/v1';

  try {
    console.log(`🎨 Generating with Alibaba Wanx via ${useIntl ? 'International (Virginia)' : 'China (Beijing)'}`);
    const response = await fetch(`${baseUrl}/services/aigc/text2image/image-synthesis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ALIBABA_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: { prompt },
        parameters: {
          size: '1280*720',
          n: 1,
        }
      }),
    });

    if (!response.ok) {
      console.error('Alibaba error:', await response.text());
      return { url: null, provider: 'alibaba' };
    }

    const data = await response.json();
    const taskId = data.output?.task_id;
    
    if (!taskId) {
      return { url: null, provider: 'alibaba' };
    }

    // Poll for result using the same endpoint base
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await fetch(`${baseUrl}/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${ALIBABA_API_KEY}` },
      });
      const statusData = await statusRes.json();
      
      if (statusData.output?.task_status === 'SUCCEEDED') {
        return { url: statusData.output?.results?.[0]?.url || null, provider: 'alibaba_wanx' };
      }
      if (statusData.output?.task_status === 'FAILED') break;
    }
    
    return { url: null, provider: 'alibaba' };
  } catch (error) {
    console.error('Alibaba generation failed:', error);
    return { url: null, provider: 'alibaba' };
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
        contentType: 'image/png',
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

// Generate thumbnail with regional provider fallback chain
async function generateThumbnail(
  supabase: any,
  blueprint: any,
  region: string = 'global'
): Promise<{ url: string | null; provider: string | null }> {
  const categoryPrompt = CATEGORY_PROMPTS[blueprint.category] || CATEGORY_PROMPTS.marketing;
  const regionalStyle = region === 'cjk' ? CATEGORY_PROMPTS.regional_cjk :
                        region === 'mena' ? CATEGORY_PROMPTS.regional_mena :
                        region === 'sea' ? CATEGORY_PROMPTS.regional_sea : '';
  
  const fullPrompt = `Create a professional video thumbnail for "${blueprint.name}". 
${blueprint.description}
Style: ${categoryPrompt}
${regionalStyle ? `Regional aesthetic: ${regionalStyle}` : ''}
Resolution: 16:9 aspect ratio, 1280x720, high quality, no text overlays, no watermarks.
Visual elements: Modern, clean, professional, suitable for video platform thumbnails.`;

  console.log(`📸 Generating thumbnail for: ${blueprint.name} (region: ${region})`);
  
  // Get provider order based on region
  const providerOrder = REGIONAL_PRIORITY[region] || REGIONAL_PRIORITY.global;
  
  let result: { url: string | null; provider: string } = { url: null, provider: '' };
  
  for (const providerId of providerOrder) {
    switch (providerId) {
      case 'modelslab_flux':
        result = await generateWithModelsLab(fullPrompt, 'flux');
        break;
      case 'modelslab_sdxl':
        result = await generateWithModelsLab(fullPrompt, 'sdxl');
        break;
      case 'openai_dalle':
        result = await generateWithOpenAI(fullPrompt);
        break;
      case 'huggingface_flux':
        result = await generateWithHuggingFace(fullPrompt);
        break;
      case 'replicate_flux':
        result = await generateWithReplicate(fullPrompt);
        break;
      case 'gemini_imagen':
        result = await generateWithGemini(fullPrompt);
        break;
      case 'alibaba_wanx':
        result = await generateWithAlibaba(fullPrompt);
        break;
    }
    
    if (result.url) {
      console.log(`✅ Generated with ${result.provider}`);
      break;
    }
  }
  
  if (!result.url) {
    console.log(`❌ All providers failed for ${blueprint.name}`);
    return { url: null, provider: null };
  }
  
  // If base64, upload to storage
  let finalUrl = result.url;
  if (result.url.startsWith('data:')) {
    const filename = `${blueprint.id}-${Date.now()}.png`;
    finalUrl = await uploadToStorage(supabase, result.url, filename);
  }
  
  // Update blueprint with thumbnail and provider info
  if (finalUrl) {
    const providerConfig = INTERNAL_PROVIDERS[result.provider as keyof typeof INTERNAL_PROVIDERS];
    await supabase
      .from('video_blueprints')
      .update({ 
        thumbnail_url: finalUrl,
        style_preset: {
          ...blueprint.style_preset,
          thumbnail_provider: result.provider,
          thumbnail_provider_name: providerConfig?.name || result.provider,
          thumbnail_provider_tier: providerConfig?.tier || 2,
          thumbnail_region: region,
          thumbnail_generated_at: new Date().toISOString(),
        }
      })
      .eq('id', blueprint.id);
  }
  
  return { url: finalUrl, provider: result.provider };
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
    console.log(`🔧 Using internal providers: ModelsLab, OpenAI, HuggingFace, Replicate, Gemini, Alibaba`);
    
    const results: { 
      id: string; 
      name: string; 
      thumbnail_url: string | null; 
      provider: string | null;
      provider_name: string | null;
      success: boolean 
    }[] = [];
    
    for (const blueprint of blueprints) {
      const { url, provider } = await generateThumbnail(supabase, blueprint, region);
      const providerConfig = provider ? INTERNAL_PROVIDERS[provider as keyof typeof INTERNAL_PROVIDERS] : null;
      
      results.push({
        id: blueprint.id,
        name: blueprint.name,
        thumbnail_url: url,
        provider,
        provider_name: providerConfig?.name || provider,
        success: !!url,
      });
    }
    
    const successCount = results.filter(r => r.success).length;
    const providerStats = results.reduce((acc, r) => {
      if (r.provider) {
        acc[r.provider] = (acc[r.provider] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return new Response(
      JSON.stringify({
        success: true,
        generated: successCount,
        failed: results.length - successCount,
        total: results.length,
        region,
        providers_used: providerStats,
        available_providers: Object.keys(INTERNAL_PROVIDERS),
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
