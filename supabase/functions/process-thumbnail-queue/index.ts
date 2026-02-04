/**
 * Process Thumbnail Generation Queue
 * 
 * FIXED: Now uploads all generated images to Supabase Storage
 * to prevent expired URLs from external providers (OpenAI, etc.)
 * 
 * Background worker that processes queued thumbnail generation jobs
 * Uses async pattern to avoid Edge Function timeout limits
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper: Convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Upload image to Supabase Storage and return permanent URL
async function uploadToStorage(
  supabase: any,
  imageData: string | Uint8Array,
  blueprintId: string,
  isBase64: boolean = false,
  mimeType: string = 'image/png'
): Promise<string | null> {
  try {
    let fileBuffer: Uint8Array;
    
    if (isBase64) {
      // Handle base64 data
      const base64Data = typeof imageData === 'string' ? imageData : '';
      fileBuffer = base64ToUint8Array(base64Data);
    } else if (typeof imageData === 'string') {
      // Download from URL
      console.log(`📥 Downloading image from external URL...`);
      const response = await fetch(imageData);
      if (!response.ok) {
        console.error(`Failed to download: ${response.status}`);
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      fileBuffer = new Uint8Array(arrayBuffer);
      
      // Get mime type from response
      const contentType = response.headers.get('content-type');
      if (contentType) mimeType = contentType.split(';')[0];
    } else {
      fileBuffer = imageData;
    }
    
    // Determine file extension
    const extension = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';
    const fileName = `template-thumbnails/${blueprintId}-${Date.now()}.${extension}`;
    
    console.log(`📤 Uploading to storage: ${fileName}`);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(fileName);

    console.log(`✅ Uploaded to: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Upload to storage failed:', error);
    return null;
  }
}

// Provider generation functions - now return raw data for upload
async function generateWithModelsLab(prompt: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  const MODELSLAB_API_KEY = Deno.env.get('MODELSLAB_API_KEY');
  if (!MODELSLAB_API_KEY) {
    console.log('❌ ModelsLab API key not configured');
    return { url: null, provider: 'modelslab', isBase64: false };
  }

  try {
    console.log('🔄 Trying ModelsLab FLUX...');
    const response = await fetch('https://modelslab.com/api/v6/images/text2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: MODELSLAB_API_KEY,
        model_id: 'flux-schnell',
        prompt,
        negative_prompt: 'blurry, low quality, distorted, watermark, text',
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
      console.log(`❌ ModelsLab error: ${response.status}`);
      return { url: null, provider: 'modelslab', isBase64: false };
    }

    const data = await response.json();
    
    if (data.status === 'processing' && data.fetch_result) {
      console.log('⏳ ModelsLab processing, polling...');
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const pollRes = await fetch(data.fetch_result);
        const pollData = await pollRes.json();
        if (pollData.status === 'success' && pollData.output?.[0]) {
          return { url: pollData.output[0], provider: 'modelslab_flux', isBase64: false };
        }
        if (pollData.status === 'failed') break;
      }
    }
    
    return { url: data.output?.[0] || null, provider: 'modelslab_flux', isBase64: false };
  } catch (error) {
    console.error('ModelsLab error:', error);
    return { url: null, provider: 'modelslab', isBase64: false };
  }
}

async function generateWithOpenAI(prompt: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.log('❌ OpenAI API key not configured');
    return { url: null, provider: 'openai', isBase64: false };
  }

  try {
    console.log('🔄 Trying OpenAI DALL-E 3...');
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
        response_format: 'url', // We'll download and re-upload to storage
      }),
    });

    if (!response.ok) {
      console.log(`❌ OpenAI error: ${response.status}`);
      return { url: null, provider: 'openai', isBase64: false };
    }

    const data = await response.json();
    // Return the temporary URL - we'll download and upload to storage
    return { url: data.data?.[0]?.url || null, provider: 'openai_dalle', isBase64: false };
  } catch (error) {
    console.error('OpenAI error:', error);
    return { url: null, provider: 'openai', isBase64: false };
  }
}

async function generateWithGemini(prompt: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
  if (!GEMINI_API_KEY) {
    console.log('❌ Gemini API key not configured');
    return { url: null, provider: 'gemini', isBase64: false };
  }

  try {
    console.log('🔄 Trying Gemini 2.0 Flash Image...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Generate a high-quality 16:9 aspect ratio image: ${prompt}` }]
          }],
          generationConfig: {
            responseModalities: ['image', 'text'],
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Gemini error: ${response.status} - ${errorText}`);
      return { url: null, provider: 'gemini', isBase64: false };
    }

    const data = await response.json();
    const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
    
    if (imagePart?.inlineData?.data) {
      // Return base64 data - we'll upload to storage
      return { 
        url: imagePart.inlineData.data, // Just the base64 without data: prefix
        provider: 'gemini_imagen', 
        isBase64: true 
      };
    }
    
    return { url: null, provider: 'gemini', isBase64: false };
  } catch (error) {
    console.error('Gemini error:', error);
    return { url: null, provider: 'gemini', isBase64: false };
  }
}

async function generateWithLovable(prompt: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.log('❌ Lovable API key not configured');
    return { url: null, provider: 'lovable', isBase64: false };
  }

  try {
    console.log('🔄 Trying Lovable AI Gateway (Gemini Flash Image)...');
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
      console.log(`❌ Lovable error: ${response.status}`);
      return { url: null, provider: 'lovable', isBase64: false };
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (imageUrl && imageUrl.startsWith('data:image')) {
      // Extract base64 from data URL
      const base64Match = imageUrl.match(/^data:image\/\w+;base64,(.+)$/);
      if (base64Match) {
        return { url: base64Match[1], provider: 'lovable_gemini', isBase64: true };
      }
    }
    
    return { url: null, provider: 'lovable', isBase64: false };
  } catch (error) {
    console.error('Lovable error:', error);
    return { url: null, provider: 'lovable', isBase64: false };
  }
}

async function generateWithAlibaba(prompt: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  const ALIBABA_API_KEY = Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('DASHSCOPE_API_KEY');
  if (!ALIBABA_API_KEY) {
    console.log('❌ Alibaba API key not configured');
    return { url: null, provider: 'alibaba', isBase64: false };
  }

  try {
    console.log('🔄 Trying Alibaba Wanx...');
    const response = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ALIBABA_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: { prompt },
        parameters: { size: '1280*720', n: 1 },
      }),
    });

    if (!response.ok) {
      console.log(`❌ Alibaba error: ${response.status}`);
      return { url: null, provider: 'alibaba', isBase64: false };
    }

    const data = await response.json();
    const taskId = data.output?.task_id;
    if (!taskId) return { url: null, provider: 'alibaba', isBase64: false };

    console.log('⏳ Alibaba processing, polling...');
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await fetch(`https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${ALIBABA_API_KEY}` },
      });
      const statusData = await statusRes.json();
      
      if (statusData.output?.task_status === 'SUCCEEDED') {
        return { url: statusData.output?.results?.[0]?.url || null, provider: 'alibaba_wanx', isBase64: false };
      }
      if (statusData.output?.task_status === 'FAILED') break;
    }
    
    return { url: null, provider: 'alibaba', isBase64: false };
  } catch (error) {
    console.error('Alibaba error:', error);
    return { url: null, provider: 'alibaba', isBase64: false };
  }
}

// Regional provider priority - updated with Lovable as fallback
const REGIONAL_PRIORITY: Record<string, string[]> = {
  western: ['modelslab', 'openai', 'lovable', 'gemini'],
  cjk: ['alibaba', 'modelslab', 'lovable', 'gemini'],
  mena: ['alibaba', 'lovable', 'gemini', 'modelslab'],
  sea: ['gemini', 'lovable', 'alibaba', 'modelslab'],
  india: ['gemini', 'lovable', 'modelslab', 'openai'],
  africa: ['gemini', 'lovable', 'modelslab', 'openai'],
  global: ['lovable', 'modelslab', 'gemini', 'openai', 'alibaba'],
};

// Category prompts
const CATEGORY_PROMPTS: Record<string, string> = {
  marketing: 'Professional marketing video thumbnail, bold design, gradient background, modern SaaS aesthetic',
  corporate: 'Professional corporate thumbnail, business style, executive, polished minimalist design',
  travel: 'Stunning travel destination thumbnail, cinematic, wanderlust, vibrant colors',
  healthcare: 'Professional healthcare thumbnail, medical, trustworthy blue tones, clinical clean',
  educational: 'Educational tutorial thumbnail, whiteboard elements, academic, instructional',
  entertainment: 'Vibrant entertainment thumbnail, dynamic, engaging, fun energetic',
  animation: 'Colorful animated thumbnail, cartoon elements, vibrant gradients, playful',
  '3d': 'Photorealistic 3D thumbnail, volumetric lighting, product visualization',
  avatar: 'AI avatar presenter thumbnail, professional virtual human, modern',
  interactive: 'Interactive media thumbnail, gamification, engagement-focused',
  seasonal: 'Seasonal holiday thumbnail, festive elements, celebration mood',
  effects: 'Video effects thumbnail, cinematic, motion graphics, transitions',
  image_to_video: 'Photo-to-video transformation, motion lines, cinematic transition',
  announcement: 'Product announcement thumbnail, exciting, launch event style',
  storytelling: 'Cinematic storytelling thumbnail, narrative, emotional connection',
  smb: 'Small business promotional thumbnail, friendly, approachable',
  ppt: 'Professional presentation thumbnail, clean slides, business style',
  'oil-gas': 'Industrial energy sector thumbnail, professional, technical',
};

async function generateThumbnail(
  supabase: any,
  blueprint: any,
  region: string
): Promise<{ url: string | null; provider: string }> {
  const categoryPrompt = CATEGORY_PROMPTS[blueprint.category] || CATEGORY_PROMPTS.marketing;
  
  const prompt = `Create a professional video thumbnail for "${blueprint.name}". 
${blueprint.description || ''}
Style: ${categoryPrompt}
Requirements: 16:9 aspect ratio, 1280x720, high quality, no text overlays, no watermarks, no people faces.`;

  const providers = REGIONAL_PRIORITY[region] || REGIONAL_PRIORITY.global;
  
  for (const provider of providers) {
    let result: { url: string | null; provider: string; isBase64: boolean } = { url: null, provider: '', isBase64: false };
    
    switch (provider) {
      case 'lovable':
        result = await generateWithLovable(prompt);
        break;
      case 'modelslab':
        result = await generateWithModelsLab(prompt);
        break;
      case 'openai':
        result = await generateWithOpenAI(prompt);
        break;
      case 'gemini':
        result = await generateWithGemini(prompt);
        break;
      case 'alibaba':
        result = await generateWithAlibaba(prompt);
        break;
    }
    
    if (result.url) {
      // CRITICAL: Upload to Supabase Storage to get permanent URL
      console.log(`🔄 Uploading ${result.provider} result to storage...`);
      const permanentUrl = await uploadToStorage(
        supabase,
        result.url,
        blueprint.id,
        result.isBase64
      );
      
      if (permanentUrl) {
        console.log(`✅ Permanent URL created: ${permanentUrl}`);
        return { url: permanentUrl, provider: result.provider };
      }
    }
  }
  
  return { url: null, provider: 'none' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { limit = 5 } = await req.json().catch(() => ({}));

    console.log(`🔄 Processing thumbnail queue (limit: ${limit})`);

    // Get pending jobs
    const { data: jobs, error: fetchError } = await supabase
      .from('thumbnail_generation_queue')
      .select('*, video_blueprints!inner(*)')
      .eq('status', 'pending')
      .lt('attempts', 3)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (fetchError) throw fetchError;

    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No pending jobs' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${jobs.length} pending jobs`);

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      details: [] as any[],
    };

    for (const job of jobs) {
      const blueprint = job.video_blueprints;
      const region = job.region || 'global';

      // Mark as processing
      await supabase
        .from('thumbnail_generation_queue')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
          attempts: job.attempts + 1,
        })
        .eq('id', job.id);

      try {
        console.log(`🎨 Generating for: ${blueprint.name} (region: ${region})`);
        
        const { url, provider } = await generateThumbnail(supabase, blueprint, region);

        if (url) {
          // Update blueprint with permanent thumbnail URL
          await supabase
            .from('video_blueprints')
            .update({
              thumbnail_url: url,
              thumbnail_provider: provider,
              thumbnail_region: region,
              style_preset: {
                ...blueprint.style_preset,
                thumbnail_provider: provider,
                thumbnail_region: region,
                thumbnail_generated_at: new Date().toISOString(),
              },
            })
            .eq('id', blueprint.id);

          // Mark job as completed
          await supabase
            .from('thumbnail_generation_queue')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              thumbnail_url: url,
              provider,
            })
            .eq('id', job.id);

          results.succeeded++;
          results.details.push({ name: blueprint.name, status: 'success', provider });
        } else {
          throw new Error('All providers failed');
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        
        await supabase
          .from('thumbnail_generation_queue')
          .update({
            status: job.attempts + 1 >= 3 ? 'failed' : 'pending',
            error_message: errorMsg,
          })
          .eq('id', job.id);

        results.failed++;
        results.details.push({ name: blueprint.name, status: 'failed', error: errorMsg });
      }

      results.processed++;
    }

    console.log(`✅ Processed: ${results.processed}, Success: ${results.succeeded}, Failed: ${results.failed}`);

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Queue processing error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
