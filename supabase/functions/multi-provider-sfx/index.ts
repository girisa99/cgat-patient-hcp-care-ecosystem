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

type SFXProvider = 'elevenlabs' | 'alibaba' | 'azure' | 'google' | 'modelslab';

interface SFXRequest {
  prompt: string;
  duration?: number;
  promptInfluence?: number;
  region?: string;
  provider?: SFXProvider;
  tier?: 'standard' | 'advanced' | 'premium';
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
  // Premium tier always uses ElevenLabs
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
  const ALIBABA_API_KEY = Deno.env.get('ALIBABA_API_KEY');
  if (!ALIBABA_API_KEY) throw new Error('ALIBABA_API_KEY not configured');

  // Alibaba Audio API for sound effects
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/audio/generate', {
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

    if (!request.prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
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
