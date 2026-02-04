/**
 * Process Thumbnail Generation Queue
 * 
 * Background worker that processes queued thumbnail generation jobs
 * Uses async pattern to avoid Edge Function timeout limits
 * 
 * This function should be called:
 * 1. By a cron job (every 30 seconds)
 * 2. Manually when queue has items
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Provider generation functions
async function generateWithModelsLab(prompt: string): Promise<{ url: string | null; provider: string }> {
  const MODELSLAB_API_KEY = Deno.env.get('MODELSLAB_API_KEY');
  if (!MODELSLAB_API_KEY) return { url: null, provider: 'modelslab' };

  try {
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

    if (!response.ok) return { url: null, provider: 'modelslab' };

    const data = await response.json();
    
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
    }
    
    return { url: data.output?.[0] || null, provider: 'modelslab_flux' };
  } catch {
    return { url: null, provider: 'modelslab' };
  }
}

async function generateWithOpenAI(prompt: string): Promise<{ url: string | null; provider: string }> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) return { url: null, provider: 'openai' };

  try {
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
        response_format: 'url',
      }),
    });

    if (!response.ok) return { url: null, provider: 'openai' };

    const data = await response.json();
    return { url: data.data?.[0]?.url || null, provider: 'openai_dalle' };
  } catch {
    return { url: null, provider: 'openai' };
  }
}

async function generateWithGemini(prompt: string): Promise<{ url: string | null; provider: string }> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
  if (!GEMINI_API_KEY) return { url: null, provider: 'gemini' };

  try {
    // Use Gemini 2.5 Flash Image via chat completions
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Generate a high-quality image: ${prompt}` }]
          }],
          generationConfig: {
            responseModalities: ['image', 'text'],
          }
        }),
      }
    );

    if (!response.ok) return { url: null, provider: 'gemini' };

    const data = await response.json();
    const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
    
    if (imagePart?.inlineData?.data) {
      return { url: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`, provider: 'gemini_imagen' };
    }
    
    return { url: null, provider: 'gemini' };
  } catch {
    return { url: null, provider: 'gemini' };
  }
}

async function generateWithAlibaba(prompt: string): Promise<{ url: string | null; provider: string }> {
  const ALIBABA_API_KEY = Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('DASHSCOPE_API_KEY');
  if (!ALIBABA_API_KEY) return { url: null, provider: 'alibaba' };

  try {
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

    if (!response.ok) return { url: null, provider: 'alibaba' };

    const data = await response.json();
    const taskId = data.output?.task_id;
    if (!taskId) return { url: null, provider: 'alibaba' };

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await fetch(`https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${ALIBABA_API_KEY}` },
      });
      const statusData = await statusRes.json();
      
      if (statusData.output?.task_status === 'SUCCEEDED') {
        return { url: statusData.output?.results?.[0]?.url || null, provider: 'alibaba_wanx' };
      }
      if (statusData.output?.task_status === 'FAILED') break;
    }
    
    return { url: null, provider: 'alibaba' };
  } catch {
    return { url: null, provider: 'alibaba' };
  }
}

// Regional provider priority
const REGIONAL_PRIORITY: Record<string, string[]> = {
  western: ['modelslab', 'openai', 'gemini'],
  cjk: ['alibaba', 'modelslab', 'gemini'],
  mena: ['alibaba', 'gemini', 'modelslab'],
  sea: ['gemini', 'alibaba', 'modelslab'],
  india: ['gemini', 'modelslab', 'openai'],
  africa: ['gemini', 'modelslab', 'openai'],
  global: ['modelslab', 'gemini', 'openai', 'alibaba'],
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
};

async function generateThumbnail(
  blueprint: any,
  region: string
): Promise<{ url: string | null; provider: string }> {
  const categoryPrompt = CATEGORY_PROMPTS[blueprint.category] || CATEGORY_PROMPTS.marketing;
  
  const prompt = `Create a professional video thumbnail for "${blueprint.name}". 
${blueprint.description}
Style: ${categoryPrompt}
Resolution: 16:9, 1280x720, high quality, no text overlays, no watermarks.`;

  const providers = REGIONAL_PRIORITY[region] || REGIONAL_PRIORITY.global;
  
  for (const provider of providers) {
    let result: { url: string | null; provider: string } = { url: null, provider: '' };
    
    switch (provider) {
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
      console.log(`✅ Generated with ${result.provider}`);
      return result;
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
        
        const { url, provider } = await generateThumbnail(blueprint, region);

        if (url) {
          // Update blueprint with thumbnail
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
