import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Universal Video Generation with Multi-Provider Fallback
 * 
 * Priority routing (based on configured secrets):
 * 1. Sora2API - Primary video generation
 * 2. ModelsLab - AnimateDiff/Video generation
 * 3. Replicate - LumaAI/Runway alternatives
 * 4. Lovable AI Gateway - Gemini video
 * 5. Image fallback - High-quality still frame
 * 
 * Note: Google Veo requires Vertex AI service account, not AI Studio key
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, aspectRatio = '16:9', duration = 5 } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎬 Video generation request:', { prompt: prompt.substring(0, 80), aspectRatio, duration });

    const startTime = Date.now();

    // Try providers in priority order
    const providers = [
      { name: 'sora2api', fn: () => trySora2API(prompt, aspectRatio, duration) },
      { name: 'modelslab', fn: () => tryModelsLab(prompt, aspectRatio, duration) },
      { name: 'replicate', fn: () => tryReplicate(prompt, aspectRatio, duration) },
      { name: 'lovable', fn: () => tryLovableAI(prompt, aspectRatio, duration) },
    ];

    for (const provider of providers) {
      try {
        const result = await provider.fn();
        if (result) {
          const processingTime = Date.now() - startTime;
          console.log(`✅ Video generated via ${provider.name} in ${processingTime}ms`);
          
          return new Response(JSON.stringify({
            success: true,
            videoUrl: result.videoUrl,
            mediaUrl: result.videoUrl,
            processingTime,
            metadata: {
              prompt: prompt.substring(0, 100),
              duration,
              aspectRatio,
              provider: provider.name,
              timestamp: new Date().toISOString()
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (err) {
        console.log(`⚠️ ${provider.name} failed:`, err instanceof Error ? err.message : 'Unknown error');
      }
    }

    // All video providers failed - generate high-quality image fallback
    console.log('📸 All video providers failed, generating image fallback...');
    const imageResult = await generateImageFallback(prompt, aspectRatio);
    
    if (imageResult) {
      const processingTime = Date.now() - startTime;
      return new Response(JSON.stringify({
        success: true,
        videoUrl: imageResult,
        mediaUrl: imageResult,
        isImageFallback: true,
        processingTime,
        metadata: {
          prompt: prompt.substring(0, 100),
          aspectRatio,
          provider: 'image-fallback',
          timestamp: new Date().toISOString(),
          note: 'Generated as high-quality image (video providers unavailable)'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('All video generation providers failed');

  } catch (error) {
    console.error('💥 Error in video generation:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Provider: Sora2API (Primary)
async function trySora2API(prompt: string, aspectRatio: string, duration: number): Promise<{ videoUrl: string } | null> {
  const apiKey = Deno.env.get('SORA2API_KEY');
  if (!apiKey) return null;

  console.log('🎬 Trying Sora2API...');
  
  const response = await fetch('https://api.sora2api.com/v1/video/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: aspectRatio,
      duration,
      quality: 'high'
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sora2API error: ${response.status} - ${error.substring(0, 100)}`);
  }

  const data = await response.json();
  if (data.video_url || data.url) {
    return { videoUrl: data.video_url || data.url };
  }
  
  // Handle async generation
  if (data.task_id || data.id) {
    const taskId = data.task_id || data.id;
    console.log('⏳ Sora2API async task:', taskId);
    
    // Poll for result (max 60 seconds)
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 5000));
      
      const statusResponse = await fetch(`https://api.sora2api.com/v1/video/status/${taskId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      
      if (statusResponse.ok) {
        const status = await statusResponse.json();
        if (status.status === 'completed' && (status.video_url || status.url)) {
          return { videoUrl: status.video_url || status.url };
        }
        if (status.status === 'failed') {
          throw new Error('Sora2API task failed');
        }
      }
    }
  }
  
  return null;
}

// Provider: ModelsLab (Backup)
async function tryModelsLab(prompt: string, aspectRatio: string, duration: number): Promise<{ videoUrl: string } | null> {
  const apiKey = Deno.env.get('MODELSLAB_API_KEY');
  if (!apiKey) return null;

  console.log('🎬 Trying ModelsLab...');
  
  // ModelsLab text2video endpoint
  const response = await fetch('https://modelslab.com/api/v6/video/text2video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: apiKey,
      prompt,
      negative_prompt: 'blur, distorted, low quality',
      width: aspectRatio === '16:9' ? 1024 : aspectRatio === '9:16' ? 576 : 768,
      height: aspectRatio === '16:9' ? 576 : aspectRatio === '9:16' ? 1024 : 768,
      num_frames: duration * 8,
      num_inference_steps: 30,
      guidance_scale: 7.5
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ModelsLab error: ${response.status} - ${error.substring(0, 100)}`);
  }

  const data = await response.json();
  
  if (data.output?.[0]) {
    return { videoUrl: data.output[0] };
  }
  
  // Handle fetch_result for async generation
  if (data.fetch_result || data.id) {
    const fetchUrl = data.fetch_result || `https://modelslab.com/api/v6/video/fetch/${data.id}`;
    console.log('⏳ ModelsLab async, polling...');
    
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 5000));
      
      const fetchResponse = await fetch(fetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey })
      });
      
      if (fetchResponse.ok) {
        const fetchData = await fetchResponse.json();
        if (fetchData.status === 'success' && fetchData.output?.[0]) {
          return { videoUrl: fetchData.output[0] };
        }
        if (fetchData.status === 'failed') {
          throw new Error('ModelsLab task failed');
        }
      }
    }
  }
  
  return null;
}

// Provider: Replicate (LumaAI/alternative models)
async function tryReplicate(prompt: string, aspectRatio: string, duration: number): Promise<{ videoUrl: string } | null> {
  const apiKey = Deno.env.get('REPLICATE_API_TOKEN');
  if (!apiKey) return null;

  console.log('🎬 Trying Replicate...');
  
  // Use stable-video-diffusion or similar model
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'dc6f803f0a0c9d2e8b6da81cf0fe8a8f6c3c8b9f', // stable-video-diffusion
      input: {
        prompt,
        video_length: duration,
        fps: 8
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate error: ${response.status} - ${error.substring(0, 100)}`);
  }

  const prediction = await response.json();
  
  // Poll for result
  if (prediction.id) {
    console.log('⏳ Replicate prediction:', prediction.id);
    
    for (let i = 0; i < 24; i++) {
      await new Promise(r => setTimeout(r, 5000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      });
      
      if (statusResponse.ok) {
        const status = await statusResponse.json();
        if (status.status === 'succeeded' && status.output) {
          const videoUrl = Array.isArray(status.output) ? status.output[0] : status.output;
          return { videoUrl };
        }
        if (status.status === 'failed') {
          throw new Error('Replicate prediction failed');
        }
      }
    }
  }
  
  return null;
}

// Provider: Lovable AI Gateway
async function tryLovableAI(prompt: string, aspectRatio: string, duration: number): Promise<{ videoUrl: string } | null> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) return null;

  console.log('🎬 Trying Lovable AI Gateway...');
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/veo-2.0',
      messages: [{ role: 'user', content: `Generate a ${duration} second video: ${prompt}` }],
      modalities: ['video']
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Lovable AI error: ${response.status} - ${error.substring(0, 100)}`);
  }

  const data = await response.json();
  const videoUrl = data.choices?.[0]?.message?.video_url || data.choices?.[0]?.message?.content;
  
  if (videoUrl && (videoUrl.startsWith('http') || videoUrl.startsWith('data:'))) {
    return { videoUrl };
  }
  
  return null;
}

// Fallback: Generate high-quality image as placeholder
async function generateImageFallback(prompt: string, aspectRatio: string): Promise<string | null> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (LOVABLE_API_KEY) {
    console.log('📸 Generating image via Lovable AI Gateway...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{ 
          role: 'user', 
          content: `Generate a cinematic ${aspectRatio} image: ${prompt}. High quality, professional, movie still.` 
        }],
        modalities: ['image', 'text']
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (imageUrl) {
        return imageUrl;
      }
    }
  }

  // Try OpenAI DALL-E as backup
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (OPENAI_API_KEY) {
    console.log('📸 Generating image via OpenAI DALL-E...');
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Cinematic movie still: ${prompt}. Professional quality, ${aspectRatio} aspect ratio.`,
        n: 1,
        size: aspectRatio === '16:9' ? '1792x1024' : '1024x1024',
        quality: 'hd'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data?.[0]?.url) {
        return data.data[0].url;
      }
    }
  }

  return null;
}
