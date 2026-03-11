/**
 * Multi-Provider SFX Edge Function
 * 
 * Regional routing for sound effects generation across 5 zones:
 * - ElevenLabs: Western/EU/LatAm (Claude Zone)
 * - Alibaba: CJK (Qwen Zone)
 * - Azure: MENA/Arabic (GPT-4o Zone)
 * - Google: India/SEA/Africa (Gemini Zone)
 * - DeepSeek/ModelsLab: Fallback
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ═══════════════════════════════════════════════════════════════════════════════
// REGION ZONE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

const ELEVENLABS_REGIONS = [
  'US', 'UK', 'AU', 'CA', 'NZ', // English
  'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', 'BE', 'AT', 'CH', // Europe
  'BR', 'MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', // LatAm
  'IL', 'ZA' // Other
];

const CJK_REGIONS = ['CN', 'HK', 'TW', 'JP', 'KR', 'SG', 'MO'];

const ARABIC_REGIONS = [
  'SA', 'AE', 'EG', 'MA', 'JO', 'IQ', 'KW', 'QA', 'BH', 'OM',
  'LB', 'TN', 'DZ', 'LY', 'SY', 'YE', 'SD', 'PS'
];

const GEMINI_REGIONS = [
  'IN', 'PK', 'BD', 'LK', 'NP', 'BT', // South Asia
  'ID', 'VN', 'TH', 'PH', 'MY', 'MM', 'KH', 'LA', // SEA
  'NG', 'KE', 'GH', 'ET', 'TZ', 'UG', 'ZW', 'ZM', 'RW', 'SN', 'CI' // Africa
];

type SFXProvider = 'elevenlabs' | 'alibaba' | 'azure' | 'google' | 'modelslab' | 'fal-beatoven' | 'mirelo';

interface SFXRequest {
  prompt: string;
  duration?: number;
  promptInfluence?: number;
  region?: string;
  provider?: SFXProvider;
  tier?: 'standard' | 'advanced' | 'premium';
  videoUrl?: string;       // When provided, uses Mirelo video-to-audio sync
  numSamples?: number;     // Mirelo: number of audio samples to generate (2-8)
  projectId?: string;      // For uploading result to Supabase Storage
  sceneKey?: string;       // For Storage path naming
}

interface SFXRouting {
  provider: SFXProvider;
  cost: number;
  zone: string;
  quality: 'standard' | 'premium';
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGIONAL ROUTING
// ═══════════════════════════════════════════════════════════════════════════════

function selectSFXProvider(region: string, tier: string = 'standard'): SFXRouting {
  const hasFal = !!(Deno.env.get('FAL_API_KEY') || Deno.env.get('FAL_AI_KEY'));

  // Premium/Advanced tier: fal.ai Beatoven SFX (44.1kHz, 3M+ training samples)
  if ((tier === 'premium' || tier === 'advanced') && hasFal) {
    return {
      provider: 'fal-beatoven',
      cost: 0.005,
      zone: 'fal-premium',
      quality: 'premium'
    };
  }

  // Premium fallback: ElevenLabs
  if (tier === 'premium') {
    return {
      provider: 'elevenlabs',
      cost: 0.008,
      zone: 'premium',
      quality: 'premium'
    };
  }

  // ElevenLabs Zone: Western/EU/LatAm
  if (ELEVENLABS_REGIONS.includes(region)) {
    return {
      provider: 'elevenlabs',
      cost: 0.005,
      zone: 'elevenlabs',
      quality: 'premium'
    };
  }

  // CJK Zone: Alibaba
  if (CJK_REGIONS.includes(region)) {
    return {
      provider: 'alibaba',
      cost: 0.002,
      zone: 'alibaba',
      quality: 'standard'
    };
  }

  // Arabic Zone: Azure (best dialect support)
  if (ARABIC_REGIONS.includes(region)) {
    return {
      provider: 'azure',
      cost: 0.003,
      zone: 'azure',
      quality: 'standard'
    };
  }

  // India/SEA/Africa Zone: Google
  if (GEMINI_REGIONS.includes(region)) {
    return {
      provider: 'google',
      cost: 0.002,
      zone: 'google',
      quality: 'standard'
    };
  }

  // Fallback: ModelsLab
  return {
    provider: 'modelslab',
    cost: 0.003,
    zone: 'fallback',
    quality: 'standard'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function generateMireloVideoSync(videoUrl: string, prompt: string, duration: number, numSamples: number = 2): Promise<{ audioUrls: string[]; provider: string }> {
  const FAL_KEY = Deno.env.get('FAL_API_KEY') || Deno.env.get('FAL_AI_KEY');
  if (!FAL_KEY) throw new Error('FAL_API_KEY not configured for Mirelo');

  console.log(`🎬 Mirelo SFX v1.5: video-to-audio sync, duration=${duration}s, samples=${numSamples}`);
  console.log(`   video: ${videoUrl.substring(0, 80)}`);
  if (prompt) console.log(`   prompt: ${prompt.substring(0, 80)}`);

  // Submit to fal.ai queue
  const submitResp = await fetch('https://queue.fal.run/mirelo-ai/sfx-v1.5/video-to-audio', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_url: videoUrl,
      text_prompt: prompt || '',
      duration: Math.min(Math.max(duration, 1), 10),
      num_samples: Math.min(Math.max(numSamples, 2), 8),
    }),
  });

  if (!submitResp.ok) {
    const errText = await submitResp.text();
    throw new Error(`Mirelo submit failed (${submitResp.status}): ${errText.substring(0, 200)}`);
  }

  const submitData = await submitResp.json();

  // Check immediate result
  if (submitData.audio && Array.isArray(submitData.audio)) {
    console.log(`✅ Mirelo: immediate result, ${submitData.audio.length} samples`);
    return {
      audioUrls: submitData.audio.map((a: { url: string }) => a.url),
      provider: 'mirelo',
    };
  }

  // Queue-based polling
  const requestId = submitData.request_id;
  if (!requestId) throw new Error('Mirelo: no request_id in response');

  console.log(`📍 Mirelo queued: ${requestId}, polling...`);
  for (let attempt = 1; attempt <= 60; attempt++) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const statusResp = await fetch(`https://queue.fal.run/mirelo-ai/sfx-v1.5/video-to-audio/requests/${requestId}/status`, {
        headers: { 'Authorization': `Key ${FAL_KEY}` },
      });
      if (!statusResp.ok) continue;
      const statusData = await statusResp.json();
      console.log(`⏳ Mirelo (${attempt}/60): ${statusData.status}`);

      if (statusData.status === 'COMPLETED') {
        const resultResp = await fetch(`https://queue.fal.run/mirelo-ai/sfx-v1.5/video-to-audio/requests/${requestId}`, {
          headers: { 'Authorization': `Key ${FAL_KEY}` },
        });
        if (resultResp.ok) {
          const resultData = await resultResp.json();
          if (resultData.audio && Array.isArray(resultData.audio)) {
            console.log(`✅ Mirelo completed: ${resultData.audio.length} audio samples`);
            return {
              audioUrls: resultData.audio.map((a: { url: string }) => a.url),
              provider: 'mirelo',
            };
          }
        }
        break;
      }
      if (statusData.status === 'FAILED') {
        throw new Error(`Mirelo FAILED: ${statusData.error || 'unknown'}`);
      }
    } catch (pollErr) {
      if (attempt >= 60) throw pollErr;
      console.warn(`⚠️ Mirelo poll error (${attempt}):`, pollErr);
    }
  }
  throw new Error('Mirelo polling exhausted after 3 minutes');
}

async function generateFalBeatevenSFX(prompt: string, duration: number): Promise<ArrayBuffer> {
  const FAL_KEY = Deno.env.get('FAL_API_KEY') || Deno.env.get('FAL_AI_KEY');
  if (!FAL_KEY) {
    console.log('⚠️ FAL_API_KEY not configured, falling back to ElevenLabs SFX');
    return generateElevenLabsSFX(prompt, duration, 0.3);
  }

  try {
    console.log(`🔊 fal.ai Beatoven SFX: "${prompt.substring(0, 80)}..." duration=${duration}s`);

    const submitResp = await fetch('https://queue.fal.run/fal-ai/stable-audio', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `sound effect: ${prompt}`,
        seconds_total: Math.min(duration, 30),
        steps: 50,  // Fewer steps for SFX (faster)
      }),
    });

    if (!submitResp.ok) {
      const errText = await submitResp.text();
      console.warn(`⚠️ fal.ai SFX submit failed (${submitResp.status}): ${errText.substring(0, 200)}`);
      return generateElevenLabsSFX(prompt, duration, 0.3);
    }

    const submitData = await submitResp.json();

    // Immediate result
    if (submitData.audio_file?.url) {
      console.log(`✅ fal.ai SFX: immediate result`);
      const audioResp = await fetch(submitData.audio_file.url);
      if (audioResp.ok) return audioResp.arrayBuffer();
    }

    // Queue-based polling
    const requestId = submitData.request_id;
    if (!requestId) {
      console.warn('⚠️ fal.ai SFX: no request_id, falling back to ElevenLabs');
      return generateElevenLabsSFX(prompt, duration, 0.3);
    }

    console.log(`📍 fal.ai SFX queued: ${requestId}, polling...`);
    for (let attempt = 1; attempt <= 30; attempt++) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const statusResp = await fetch(`https://queue.fal.run/fal-ai/stable-audio/requests/${requestId}/status`, {
          headers: { 'Authorization': `Key ${FAL_KEY}` },
        });
        if (!statusResp.ok) continue;
        const statusData = await statusResp.json();
        console.log(`⏳ fal.ai SFX (${attempt}/30): ${statusData.status}`);

        if (statusData.status === 'COMPLETED') {
          const resultResp = await fetch(`https://queue.fal.run/fal-ai/stable-audio/requests/${requestId}`, {
            headers: { 'Authorization': `Key ${FAL_KEY}` },
          });
          if (resultResp.ok) {
            const resultData = await resultResp.json();
            const audioUrl = resultData.audio_file?.url;
            if (audioUrl) {
              console.log(`✅ fal.ai SFX completed: ${audioUrl.substring(0, 60)}`);
              const audioResp = await fetch(audioUrl);
              if (audioResp.ok) return audioResp.arrayBuffer();
            }
          }
          break;
        }
        if (statusData.status === 'FAILED') {
          console.warn(`⚠️ fal.ai SFX FAILED: ${statusData.error || 'unknown'}`);
          break;
        }
      } catch (pollErr) {
        console.warn(`⚠️ fal.ai SFX poll error (${attempt}):`, pollErr);
      }
    }

    console.log('⚠️ fal.ai SFX polling exhausted, falling back to ElevenLabs');
    return generateElevenLabsSFX(prompt, duration, 0.3);
  } catch (error) {
    console.warn('⚠️ fal.ai SFX error, falling back to ElevenLabs:', error);
    return generateElevenLabsSFX(prompt, duration, 0.3);
  }
}

async function generateElevenLabsSFX(prompt: string, duration: number, promptInfluence: number): Promise<ArrayBuffer> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY not configured');

  const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: duration,
      prompt_influence: promptInfluence,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs SFX error: ${error}`);
  }

  return response.arrayBuffer();
}

async function generateAlibabaSFX(prompt: string, duration: number): Promise<ArrayBuffer> {
  // Try both API keys - China (Beijing) preferred for audio models, International (Virginia) as fallback
  const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
  const intlKey = Deno.env.get('ALIBABA_API_KEY');
  const ALIBABA_API_KEY = chinaKey || intlKey;
  if (!ALIBABA_API_KEY) throw new Error('Neither ALIBABA_CHINA_API_KEY nor ALIBABA_API_KEY configured');

  // Route to correct endpoint based on which key is being used
  const useChina = !!chinaKey;
  const baseUrl = useChina
    ? 'https://dashscope.aliyuncs.com/api/v1'
    : 'https://dashscope-intl.aliyuncs.com/api/v1';

  console.log(`🔊 Alibaba SFX via ${useChina ? 'China (Beijing)' : 'International (Virginia)'}`);

  const response = await fetch(`${baseUrl}/services/audio/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ALIBABA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'audio-generation-v1',
      input: {
        prompt: prompt,
        duration: duration,
        type: 'sfx'
      }
    }),
  });

  if (!response.ok) {
    // Fallback to ElevenLabs if Alibaba fails
    console.warn('Alibaba SFX failed, falling back to ElevenLabs');
    return generateElevenLabsSFX(prompt, duration, 0.3);
  }

  const result = await response.json();
  // Convert base64 from response to ArrayBuffer
  const binaryString = atob(result.output.audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function generateAzureSFX(prompt: string, duration: number): Promise<ArrayBuffer> {
  const AZURE_SPEECH_KEY = Deno.env.get('AZURE_SPEECH_KEY');
  const AZURE_SPEECH_REGION = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  
  if (!AZURE_SPEECH_KEY) {
    console.warn('Azure not configured, falling back to ElevenLabs');
    return generateElevenLabsSFX(prompt, duration, 0.3);
  }

  // Azure Custom Neural Voice for SFX-style audio
  // Note: Azure doesn't have native SFX, so we fall back to ElevenLabs
  console.log('Azure SFX not natively available, using ElevenLabs');
  return generateElevenLabsSFX(prompt, duration, 0.3);
}

async function generateGoogleSFX(prompt: string, duration: number): Promise<ArrayBuffer> {
  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
  
  if (!GOOGLE_API_KEY) {
    console.warn('Google not configured, falling back to ElevenLabs');
    return generateElevenLabsSFX(prompt, duration, 0.3);
  }

  // Google doesn't have native SFX API, fall back to ElevenLabs
  console.log('Google SFX not available, using ElevenLabs');
  return generateElevenLabsSFX(prompt, duration, 0.3);
}

async function generateModelsLabSFX(prompt: string, duration: number): Promise<ArrayBuffer> {
  const MODELSLAB_API_KEY = Deno.env.get('MODELSLAB_API_KEY');
  
  if (!MODELSLAB_API_KEY) {
    console.warn('ModelsLab not configured, falling back to ElevenLabs');
    return generateElevenLabsSFX(prompt, duration, 0.3);
  }

  const response = await fetch('https://modelslab.com/api/v6/audio/text2sfx', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: MODELSLAB_API_KEY,
      prompt: prompt,
      duration: duration,
      seed: null,
      guidance_scale: 3.5,
    }),
  });

  if (!response.ok) {
    console.warn('ModelsLab SFX failed, falling back to ElevenLabs');
    return generateElevenLabsSFX(prompt, duration, 0.3);
  }

  const result = await response.json();
  if (result.status === 'success' && result.output && result.output[0]) {
    const audioResponse = await fetch(result.output[0]);
    return audioResponse.arrayBuffer();
  }

  return generateElevenLabsSFX(prompt, duration, 0.3);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: SFXRequest = await req.json();

    // ── Mirelo Video-to-Audio Sync (special path) ──
    // When videoUrl is provided, use Mirelo to generate synced SFX from the video
    if (request.videoUrl) {
      console.log(`🎬 Mirelo video-sync mode: ${request.videoUrl.substring(0, 80)}`);
      try {
        const mireloResult = await generateMireloVideoSync(
          request.videoUrl,
          request.prompt || '',
          Math.min(request.duration || 10, 10),
          request.numSamples || 2,
        );
        return new Response(
          JSON.stringify({
            success: true,
            audioUrls: mireloResult.audioUrls,
            audioUrl: mireloResult.audioUrls[0] || undefined,
            duration: request.duration || 10,
            provider: 'mirelo',
            zone: 'fal-mirelo',
            cost: 0.01,
            quality: 'premium',
            mode: 'video-sync',
            metadata: {
              promptUsed: request.prompt || '(video-driven)',
              videoUrl: request.videoUrl,
              numSamples: request.numSamples || 2,
              format: 'wav',
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (mireloErr) {
        console.warn('⚠️ Mirelo video-sync failed, falling back to text-based SFX:', mireloErr);
        // Fall through to text-based SFX generation
      }
    }

    // ── Text-based SFX generation ──
    if (!request.prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required (or provide videoUrl for Mirelo sync)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const duration = Math.min(Math.max(request.duration || 5, 0.5), 22);
    const promptInfluence = Math.min(Math.max(request.promptInfluence || 0.3, 0), 1);
    const region = request.region || 'US';
    const tier = request.tier || 'standard';

    // Get routing decision
    const routing = selectSFXProvider(region, tier);

    // Override if provider explicitly specified
    const provider = request.provider || routing.provider;

    console.log(`🔊 Multi-Provider SFX Request:`, {
      prompt: request.prompt.substring(0, 100),
      duration,
      region,
      provider,
      zone: routing.zone,
      cost: routing.cost
    });

    let audioBuffer: ArrayBuffer;

    switch (provider) {
      case 'fal-beatoven':
        audioBuffer = await generateFalBeatevenSFX(request.prompt, duration);
        break;
      case 'elevenlabs':
        audioBuffer = await generateElevenLabsSFX(request.prompt, duration, promptInfluence);
        break;
      case 'alibaba':
        audioBuffer = await generateAlibabaSFX(request.prompt, duration);
        break;
      case 'azure':
        audioBuffer = await generateAzureSFX(request.prompt, duration);
        break;
      case 'google':
        audioBuffer = await generateGoogleSFX(request.prompt, duration);
        break;
      case 'modelslab':
        audioBuffer = await generateModelsLabSFX(request.prompt, duration);
        break;
      default:
        audioBuffer = await generateElevenLabsSFX(request.prompt, duration, promptInfluence);
    }

    const audioBase64 = base64Encode(audioBuffer);
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    console.log(`✅ SFX generated: ${audioBuffer.byteLength} bytes via ${provider}`);

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl,
        audioBase64,
        duration,
        provider,
        zone: routing.zone,
        cost: routing.cost,
        quality: routing.quality,
        metadata: {
          promptUsed: request.prompt,
          promptInfluence,
          format: 'mp3',
          region,
          tier
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Multi-Provider SFX error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
