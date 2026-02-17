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
      const errText = await response.text();
      console.log(`❌ ModelsLab error: ${response.status} - ${errText.substring(0, 100)}`);
      return { url: null, provider: 'modelslab', isBase64: false };
    }

    const data = await response.json();
    console.log(`📊 ModelsLab response status: ${data.status}`);
    
    if (data.status === 'processing' && data.fetch_result) {
      console.log('⏳ ModelsLab processing, polling...');
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const pollRes = await fetch(data.fetch_result);
        const pollData = await pollRes.json();
        console.log(`📊 Poll ${i + 1}: ${pollData.status}`);
        if (pollData.status === 'success' && pollData.output?.[0]) {
          console.log('✅ ModelsLab image ready');
          return { url: pollData.output[0], provider: 'modelslab_flux', isBase64: false };
        }
        if (pollData.status === 'failed') {
          console.log(`❌ ModelsLab job failed: ${JSON.stringify(pollData)}`);
          break;
        }
      }
    } else if (data.status === 'success' && data.output?.[0]) {
      console.log('✅ ModelsLab image ready (immediate)');
      return { url: data.output[0], provider: 'modelslab_flux', isBase64: false };
    } else if (data.status === 'error') {
      console.log(`❌ ModelsLab error: ${data.message || JSON.stringify(data)}`);
    }
    
    return { url: null, provider: 'modelslab', isBase64: false };
  } catch (error) {
    console.error('ModelsLab error:', error);
    return { url: null, provider: 'modelslab', isBase64: false };
  }
}

// DeepSeek Image Generation
async function generateWithDeepSeek(prompt: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
  if (!DEEPSEEK_API_KEY) {
    console.log('❌ DeepSeek API key not configured');
    return { url: null, provider: 'deepseek', isBase64: false };
  }

  try {
    console.log('🔄 Trying DeepSeek Vision...');
    // DeepSeek doesn't have direct image gen, skip for now
    return { url: null, provider: 'deepseek', isBase64: false };
  } catch (error) {
    console.error('DeepSeek error:', error);
    return { url: null, provider: 'deepseek', isBase64: false };
  }
}

// HuggingFace Image Generation
async function generateWithHuggingFace(prompt: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  const HF_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN') || Deno.env.get('HUGGINGFACE_API_KEY');
  if (!HF_TOKEN) {
    console.log('❌ HuggingFace token not configured');
    return { url: null, provider: 'huggingface', isBase64: false };
  }

  try {
    console.log('🔄 Trying HuggingFace FLUX...');
    const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      console.log(`❌ HuggingFace error: ${response.status}`);
      return { url: null, provider: 'huggingface', isBase64: false };
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    console.log('✅ HuggingFace image generated');
    return { url: base64, provider: 'huggingface_flux', isBase64: true };
  } catch (error) {
    console.error('HuggingFace error:', error);
    return { url: null, provider: 'huggingface', isBase64: false };
  }
}

// Replicate Image Generation
async function generateWithReplicate(prompt: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  const REPLICATE_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
  if (!REPLICATE_TOKEN) {
    console.log('❌ Replicate token not configured');
    return { url: null, provider: 'replicate', isBase64: false };
  }

  try {
    console.log('🔄 Trying Replicate SDXL...');
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'a00d0b7dcbb9c3fbb34ba87d2d5b46c56969c84a628bf778a7fdaec30b1b99c5', // SDXL
        input: {
          prompt,
          width: 1280,
          height: 720,
          num_outputs: 1,
        },
      }),
    });

    if (!response.ok) {
      console.log(`❌ Replicate error: ${response.status}`);
      return { url: null, provider: 'replicate', isBase64: false };
    }

    const data = await response.json();
    console.log('⏳ Replicate processing...');
    
    // Poll for result
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(data.urls.get, {
        headers: { 'Authorization': `Token ${REPLICATE_TOKEN}` },
      });
      const pollData = await pollRes.json();
      
      if (pollData.status === 'succeeded' && pollData.output?.[0]) {
        console.log('✅ Replicate image ready');
        return { url: pollData.output[0], provider: 'replicate_sdxl', isBase64: false };
      }
      if (pollData.status === 'failed') {
        console.log(`❌ Replicate failed: ${pollData.error}`);
        break;
      }
    }
    
    return { url: null, provider: 'replicate', isBase64: false };
  } catch (error) {
    console.error('Replicate error:', error);
    return { url: null, provider: 'replicate', isBase64: false };
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

// Banana/Nano Image Generation (via Lovable AI Gateway - Gemini 2.5 Flash Image)
async function generateWithBanana(prompt: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.log('❌ Lovable API key not configured for Banana');
    return { url: null, provider: 'banana', isBase64: false };
  }

  try {
    console.log('🔄 Trying Banana Nano (Gemini 2.5 Flash Image)...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: `Generate a professional 16:9 video thumbnail image: ${prompt}` }],
        modalities: ['image', 'text']
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (imageUrl && imageUrl.startsWith('data:image')) {
        const base64Data = imageUrl.split(',')[1];
        console.log('✅ Banana Nano image generated');
        return { url: base64Data, provider: 'banana_nano', isBase64: true };
      }
    } else {
      console.log(`❌ Banana error: ${response.status}`);
    }
    return { url: null, provider: 'banana', isBase64: false };
  } catch (error) {
    console.error('Banana error:', error);
    return { url: null, provider: 'banana', isBase64: false };
  }
}

// Vertex AI Imagen 3 (PRIMARY - via Service Account)
async function generateWithVertexImagen(prompt: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  const SERVICE_ACCOUNT = Deno.env.get('GOOGLE_VERTEX_SERVICE_ACCOUNT');
  if (!SERVICE_ACCOUNT) {
    console.log('❌ Vertex AI service account not configured');
    return { url: null, provider: 'vertex', isBase64: false };
  }

  try {
    console.log('🔄 Trying Vertex AI Imagen 3.0 (PRIMARY)...');
    // Vertex AI requires JWT auth - will implement in production
    // For now, fall through to Gemini API
    return { url: null, provider: 'vertex', isBase64: false };
  } catch (error) {
    console.error('Vertex error:', error);
    return { url: null, provider: 'vertex', isBase64: false };
  }
}

async function generateWithGemini(prompt: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
  if (!GEMINI_API_KEY) {
    console.log('❌ Gemini API key not configured');
    return { url: null, provider: 'gemini', isBase64: false };
  }

  try {
    // PRIMARY: Try Gemini 3 Pro (google/gemini-3-pro-image-preview) via Lovable Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (LOVABLE_API_KEY) {
      console.log('🔄 Trying Gemini 3 Pro Image (PRIMARY)...');
      const gemini3Response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-pro-image-preview',
          messages: [{ role: 'user', content: `Generate a professional 16:9 video thumbnail image: ${prompt}` }],
          modalities: ['image', 'text']
        }),
      });

      if (gemini3Response.ok) {
        const data = await gemini3Response.json();
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (imageUrl && imageUrl.startsWith('data:image')) {
          const base64Data = imageUrl.split(',')[1];
          console.log('✅ Gemini 3 Pro image generated');
          return { url: base64Data, provider: 'gemini_3_pro', isBase64: true };
        }
      } else {
        console.log(`❌ Gemini 3 Pro error: ${gemini3Response.status}`);
      }
    }

    // SECONDARY: Try Imagen 3.0 via Google API
    console.log('🔄 Trying Imagen 3.0 generate (SECONDARY)...');
    const imagenResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Professional 16:9 video thumbnail: ${prompt}`,
          config: {
            numberOfImages: 1,
            aspectRatio: '16:9',
            outputMimeType: 'image/png',
          }
        }),
      }
    );

    if (imagenResponse.ok) {
      const data = await imagenResponse.json();
      const base64Image = data.generatedImages?.[0]?.image?.imageBytes;
      if (base64Image) {
        console.log('✅ Imagen 3.0 image generated');
        return { url: base64Image, provider: 'vertex_imagen3', isBase64: true };
      }
    } else {
      const errText = await imagenResponse.text();
      console.log(`❌ Imagen 3.0 error: ${imagenResponse.status} - ${errText.substring(0, 100)}`);
    }

    // FALLBACK: Gemini 2.0 Flash (stable fallback)
    console.log('🔄 Trying Gemini 2.0 Flash (FALLBACK)...');
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Generate a professional 16:9 video thumbnail image: ${prompt}` }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          }
        }),
      }
    );

    if (geminiResponse.ok) {
      const data = await geminiResponse.json();
      const imagePart = data.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData?.mimeType?.startsWith('image/')
      );
      
      if (imagePart?.inlineData?.data) {
        console.log('✅ Gemini 2.0 Flash image generated (fallback)');
        return { 
          url: imagePart.inlineData.data,
          provider: 'gemini_2_flash', 
          isBase64: true 
        };
      }
    } else {
      const errorText = await geminiResponse.text();
      console.log(`❌ Gemini 2.0 Flash error: ${geminiResponse.status} - ${errorText.substring(0, 150)}`);
    }
    
    return { url: null, provider: 'gemini', isBase64: false };
  } catch (error) {
    console.error('Gemini error:', error);
    return { url: null, provider: 'gemini', isBase64: false };
  }
}

// Lovable AI REMOVED - using integrated providers only (Gemini, ModelsLab, OpenAI, Alibaba)
// Per architecture requirement: all thumbnail generation uses the 18 internal AI providers

async function generateWithAlibaba(prompt: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  const ALIBABA_API_KEY = Deno.env.get('ALIBABA_SINGAPORE_API_KEY') || Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('DASHSCOPE_API_KEY');
  if (!ALIBABA_API_KEY) {
    console.log('❌ Alibaba API key not configured');
    return { url: null, provider: 'alibaba', isBase64: false };
  }

  try {
    // PRIMARY: Try Wan 2.6 T2I (latest, best quality)
    console.log('🔄 Trying Alibaba Wan 2.6 T2I (Singapore)...');
    const response = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ALIBABA_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'wan2.6-t2i',
        input: { prompt },
        parameters: { size: '1280*720', n: 1 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.log(`❌ Wan 2.6 T2I error: ${response.status} - ${errText.substring(0, 100)}`);
      
      // FALLBACK: Try legacy wanx-v1
      console.log('🔄 Falling back to Wanx v1...');
      const fallbackRes = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
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
      if (!fallbackRes.ok) {
        console.log(`❌ Wanx v1 also failed: ${fallbackRes.status}`);
        return { url: null, provider: 'alibaba', isBase64: false };
      }
      const fallbackData = await fallbackRes.json();
      const fallbackTaskId = fallbackData.output?.task_id;
      if (fallbackTaskId) {
        return await pollAlibabaTask(ALIBABA_API_KEY, fallbackTaskId, 'alibaba_wanx_v1');
      }
      return { url: null, provider: 'alibaba', isBase64: false };
    }

    const data = await response.json();
    const taskId = data.output?.task_id;
    if (!taskId) return { url: null, provider: 'alibaba', isBase64: false };

    return await pollAlibabaTask(ALIBABA_API_KEY, taskId, 'alibaba_wan26_t2i');
  } catch (error) {
    console.error('Alibaba error:', error);
    return { url: null, provider: 'alibaba', isBase64: false };
  }
}

async function pollAlibabaTask(apiKey: string, taskId: string, providerName: string): Promise<{ url: string | null; provider: string; isBase64: boolean }> {
  console.log(`⏳ Alibaba processing task ${taskId}, polling...`);
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await fetch(`https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const statusData = await statusRes.json();
    const status = statusData.output?.task_status;
    
    if (status === 'SUCCEEDED') {
      const imageUrl = statusData.output?.results?.[0]?.url;
      if (imageUrl) {
        console.log(`✅ ${providerName} image ready`);
        return { url: imageUrl, provider: providerName, isBase64: false };
      }
    }
    if (status === 'FAILED') {
      console.log(`❌ ${providerName} task failed: ${JSON.stringify(statusData.output)}`);
      break;
    }
  }
  return { url: null, provider: providerName, isBase64: false };
}

// ============================================
// REGIONAL PROVIDER PRIORITY - PRODUCTION HIERARCHY
// ============================================
// PRIMARY: Gemini 3 Pro / Vertex Imagen3 / Banana Nano (via Lovable Gateway)
// SECONDARY: Alibaba Wanx / ModelsLab FLUX / DeepSeek
// FALLBACK: Gemini 2.0 / Replicate SDXL / HuggingFace FLUX
// LAST RESORT: OpenAI DALL-E (expensive, use only if all else fails)
// ============================================
const REGIONAL_PRIORITY: Record<string, string[]> = {
  // Claude Zone (Western/Europe/LATAM) - Gemini 3 first, then Vertex, then fallbacks
  western: ['gemini', 'banana', 'modelslab', 'replicate', 'huggingface', 'alibaba', 'openai'],
  europe: ['gemini', 'banana', 'modelslab', 'alibaba', 'replicate', 'huggingface', 'openai'],
  latam: ['gemini', 'banana', 'modelslab', 'alibaba', 'replicate', 'huggingface', 'openai'],
  
  // Alibaba Zone (CJK/MENA) - Alibaba Wanx first for best regional results
  cjk: ['alibaba', 'gemini', 'banana', 'modelslab', 'replicate', 'huggingface', 'openai'],
  china: ['alibaba', 'gemini', 'banana', 'modelslab', 'replicate', 'huggingface', 'openai'],
  mena: ['alibaba', 'gemini', 'banana', 'modelslab', 'replicate', 'huggingface', 'openai'],
  arabic: ['alibaba', 'gemini', 'banana', 'modelslab', 'replicate', 'huggingface', 'openai'],
  japan: ['gemini', 'alibaba', 'banana', 'modelslab', 'replicate', 'huggingface', 'openai'],
  korea: ['gemini', 'alibaba', 'banana', 'modelslab', 'replicate', 'huggingface', 'openai'],
  
  // Gemini Zone (South Asia/SEA/Africa) - Gemini first, Alibaba fallback
  india: ['gemini', 'alibaba', 'banana', 'modelslab', 'replicate', 'huggingface', 'openai'],
  pakistan: ['gemini', 'alibaba', 'banana', 'modelslab', 'replicate', 'huggingface', 'openai'],
  bangladesh: ['gemini', 'alibaba', 'banana', 'modelslab', 'replicate', 'huggingface', 'openai'],
  sea: ['gemini', 'alibaba', 'banana', 'modelslab', 'replicate', 'huggingface', 'openai'],
  indonesia: ['gemini', 'alibaba', 'banana', 'modelslab', 'replicate', 'huggingface', 'openai'],
  africa: ['gemini', 'alibaba', 'banana', 'modelslab', 'replicate', 'huggingface', 'openai'],
  
  // Global fallback
  global: ['gemini', 'banana', 'alibaba', 'modelslab', 'replicate', 'huggingface', 'openai'],
};

// Category prompts - EXPANDED with all template categories including regional
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
  storytelling: 'Cinematic storytelling thumbnail, narrative, emotional connection, dramatic',
  smb: 'Small business promotional thumbnail, friendly, approachable, local community',
  ppt: 'Professional presentation thumbnail, clean slides, business graphics',
  oil_gas: 'Industrial energy sector thumbnail, professional, technical, engineering',
  customer_journey: 'Customer journey map thumbnail, funnel stages, touchpoints, pathway visualization',
  infographic: 'Data visualization thumbnail, charts, graphs, statistics, clean modern design',
  combination: 'Multi-modal content thumbnail, hybrid elements, premium production, dynamic composition',
  podcast: 'Podcast thumbnail, microphone, audio waveform, professional broadcasting studio',
  webcast: 'Webcast thumbnail, video conferencing, professional streaming setup, global audience',
  vision: 'National vision thumbnail, landmark architecture, progress indicators, futuristic city',
  heritage: 'Cultural heritage thumbnail, traditional art, monuments, vibrant cultural elements',
  fintech: 'Fintech thumbnail, digital payments, mobile banking, secure transactions',
  food_business: 'Food business thumbnail, street food, local cuisine, vibrant market stall',
  retail: 'Retail business thumbnail, shop display, products, local store ambiance',
  homecare: 'Homecare thumbnail, family care, elderly support, compassionate service',
  nursing: 'Nursing care thumbnail, medical professional, patient care, healthcare facility',
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
    
    // Route to integrated AI providers with correct priority:
    // Gemini 3 → Banana → Vertex Imagen → Alibaba → ModelsLab → DeepSeek → Replicate → HuggingFace → OpenAI (last)
    switch (provider) {
      case 'gemini':
        // Tries Gemini 3 Pro → Imagen 3 → Gemini 2.0 Flash (fallback chain inside)
        result = await generateWithGemini(prompt);
        break;
      case 'banana':
        // Banana Nano via Lovable Gateway (Gemini 2.5 Flash Image)
        result = await generateWithBanana(prompt);
        break;
      case 'alibaba':
        result = await generateWithAlibaba(prompt);
        break;
      case 'modelslab':
        result = await generateWithModelsLab(prompt);
        break;
      case 'replicate':
        result = await generateWithReplicate(prompt);
        break;
      case 'huggingface':
        result = await generateWithHuggingFace(prompt);
        break;
      case 'openai':
        // OpenAI DALL-E is LAST RESORT (expensive)
        result = await generateWithOpenAI(prompt);
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

    const { limit = 5, autoProcess = true, maxBatches = 100, parallelJobs = 3 } = await req.json().catch(() => ({}));

    console.log(`🔄 Processing thumbnail queue (limit: ${limit}, autoProcess: ${autoProcess}, maxBatches: ${maxBatches}, parallel: ${parallelJobs})`);

    let totalProcessed = 0;
    let totalSucceeded = 0;
    let totalFailed = 0;
    let batchCount = 0;
    const allDetails: any[] = [];

    // Auto-process multiple batches if enabled
    do {
      batchCount++;
      console.log(`📦 Processing batch ${batchCount}...`);

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
        console.log(`✅ No more pending jobs after ${batchCount} batches`);
        break;
      }

      console.log(`📋 Batch ${batchCount}: Found ${jobs.length} pending jobs`);

      // Process jobs in parallel for speed
      const processJob = async (job: any) => {
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

            return { name: blueprint.name, status: 'success', provider, batch: batchCount };
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

          return { name: blueprint.name, status: 'failed', error: errorMsg, batch: batchCount };
        }
      };

      // Process in parallel batches
      const results = await Promise.allSettled(jobs.map(processJob));
      
      for (const result of results) {
        totalProcessed++;
        if (result.status === 'fulfilled') {
          if (result.value.status === 'success') {
            totalSucceeded++;
          } else {
            totalFailed++;
          }
          allDetails.push(result.value);
        } else {
          totalFailed++;
          allDetails.push({ status: 'failed', error: result.reason, batch: batchCount });
        }
      }

      console.log(`✅ Batch ${batchCount}: Processed ${jobs.length}, Total: ${totalProcessed}`);

      // Small delay between batches to avoid rate limiting
      if (autoProcess && batchCount < maxBatches) {
        await new Promise(r => setTimeout(r, 1000));
      }

    } while (autoProcess && batchCount < maxBatches);

    // Check remaining pending jobs
    const { count: remainingCount } = await supabase
      .from('thumbnail_generation_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    console.log(`✅ TOTAL: Processed ${totalProcessed}, Success: ${totalSucceeded}, Failed: ${totalFailed}, Remaining: ${remainingCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: totalProcessed,
        succeeded: totalSucceeded,
        failed: totalFailed,
        batches: batchCount,
        remaining: remainingCount,
        details: allDetails.slice(-50), // Last 50 for response size
      }),
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
