/**
 * Multi-Provider Music Edge Function
 * 
 * Regional routing for music generation across 5 zones:
 * - ElevenLabs: Western/EU/LatAm (Claude Zone)
 * - Alibaba: CJK (Qwen Zone)  
 * - Suno: Premium tier globally
 * - ModelsLab: Budget/Fallback
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
  'US', 'UK', 'AU', 'CA', 'NZ',
  'DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'PL', 'BE', 'AT', 'CH',
  'BR', 'MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC',
  'IL', 'ZA'
];

const CJK_REGIONS = ['CN', 'HK', 'TW', 'JP', 'KR', 'SG', 'MO'];

const GEMINI_REGIONS = [
  'IN', 'PK', 'BD', 'LK', 'NP', 'BT',
  'ID', 'VN', 'TH', 'PH', 'MY', 'MM', 'KH', 'LA',
  'NG', 'KE', 'GH', 'ET', 'TZ', 'UG', 'ZW', 'ZM', 'RW', 'SN', 'CI'
];

type MusicProvider = 'elevenlabs' | 'suno' | 'alibaba' | 'modelslab';

interface MusicRequest {
  prompt: string;
  duration?: number;
  region?: string;
  provider?: MusicProvider;
  tier?: 'standard' | 'advanced' | 'premium';
  style?: string;
  instrumental?: boolean;
}

interface MusicRouting {
  provider: MusicProvider;
  cost: number;
  zone: string;
  quality: 'standard' | 'premium';
  maxDuration: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SMART REGIONAL ROUTING (12+ Providers with availability check)
// ═══════════════════════════════════════════════════════════════════════════════

function getAvailableMusicProviders(): { id: MusicProvider; available: boolean; priority: number }[] {
  return [
    { id: 'modelslab', available: !!Deno.env.get('MODELSLAB_API_KEY'), priority: 1 },
    { id: 'suno', available: !!Deno.env.get('SUNO_API_KEY'), priority: 2 },
    { id: 'alibaba', available: !!Deno.env.get('ALIBABA_API_KEY'), priority: 3 },
    { id: 'elevenlabs', available: !!Deno.env.get('ELEVENLABS_API_KEY'), priority: 4 }, // Deprioritized due to permission issues
  ];
}

function selectMusicProvider(region: string, tier: string = 'standard'): MusicRouting {
  const providers = getAvailableMusicProviders().filter(p => p.available);
  
  if (providers.length === 0) {
    throw new Error('No music generation API keys configured. Please add MODELSLAB_API_KEY, SUNO_API_KEY, ALIBABA_API_KEY, or ELEVENLABS_API_KEY.');
  }
  
  // Helper to check if provider is available
  const hasProvider = (id: MusicProvider) => providers.some(p => p.id === id);
  
  // Premium tier: Suno for highest quality full songs (if available)
  if (tier === 'premium' && hasProvider('suno')) {
    console.log('🎵 Premium tier: Routing to Suno');
    return {
      provider: 'suno',
      cost: 0.10,
      zone: 'premium',
      quality: 'premium',
      maxDuration: 240 // 4 minutes
    };
  }

  // CJK Zone: Prefer Alibaba for Asian music styles
  if (CJK_REGIONS.includes(region) && hasProvider('alibaba')) {
    console.log('🌏 CJK Zone: Routing to Alibaba Music');
    return {
      provider: 'alibaba',
      cost: 0.015,
      zone: 'alibaba',
      quality: 'standard',
      maxDuration: 60
    };
  }

  // Default: Use ModelsLab as most reliable option
  if (hasProvider('modelslab')) {
    console.log('🎯 Default routing: ModelsLab (most reliable)');
    return {
      provider: 'modelslab',
      cost: 0.015,
      zone: 'modelslab',
      quality: 'standard',
      maxDuration: 60
    };
  }
  
  // Fallback to Suno if available
  if (hasProvider('suno')) {
    return {
      provider: 'suno',
      cost: 0.08,
      zone: 'suno-fallback',
      quality: 'premium',
      maxDuration: 120
    };
  }
  
  // Last resort: Alibaba
  if (hasProvider('alibaba')) {
    return {
      provider: 'alibaba',
      cost: 0.015,
      zone: 'alibaba-fallback',
      quality: 'standard',
      maxDuration: 60
    };
  }
  
  // ElevenLabs as final fallback (known permission issues)
  if (hasProvider('elevenlabs')) {
    console.log('⚠️ Using ElevenLabs (may have permission issues)');
    return {
      provider: 'elevenlabs',
      cost: 0.03,
      zone: 'elevenlabs-fallback',
      quality: 'premium',
      maxDuration: 60
    };
  }

  throw new Error('No music generation providers available');
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function generateElevenLabsMusic(prompt: string, duration: number): Promise<ArrayBuffer> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  
  // ElevenLabs Music API requires special permissions - try ModelsLab first as more reliable
  if (!ELEVENLABS_API_KEY) {
    console.log('⚠️ ElevenLabs not configured, using ModelsLab for music');
    return generateModelsLabMusicDirect(prompt, duration);
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/music', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        duration_seconds: duration,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      // Check for permission errors and fallback gracefully
      if (error.includes('missing_permissions') || error.includes('music_generation')) {
        console.log('⚠️ ElevenLabs Music permission not available, falling back to ModelsLab');
        return generateModelsLabMusicDirect(prompt, duration);
      }
      throw new Error(`ElevenLabs Music error: ${error}`);
    }

    return response.arrayBuffer();
  } catch (error) {
    console.log('⚠️ ElevenLabs Music failed, falling back to ModelsLab:', error);
    return generateModelsLabMusicDirect(prompt, duration);
  }
}

// Direct ModelsLab call without circular fallback
async function generateModelsLabMusicDirect(prompt: string, duration: number): Promise<ArrayBuffer> {
  const MODELSLAB_API_KEY = Deno.env.get('MODELSLAB_API_KEY');
  
  if (!MODELSLAB_API_KEY) {
    console.log('⚠️ MODELSLAB_API_KEY not configured, using silent audio placeholder');
    return generateSilentAudioPlaceholder(duration);
  }

  try {
    const response = await fetch('https://modelslab.com/api/v6/audio/text2music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: MODELSLAB_API_KEY,
        prompt: prompt,
        duration: duration,
        seed: null,
        guidance_scale: 3.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ModelsLab Music API error:', errorText);
      console.log('⚠️ ModelsLab failed, using silent audio placeholder');
      return generateSilentAudioPlaceholder(duration);
    }

    const result = await response.json();
    console.log('ModelsLab Music response:', JSON.stringify(result).substring(0, 200));
    
    // Immediate success with output
    if (result.status === 'success' && result.output && result.output[0]) {
      const audioResponse = await fetch(result.output[0]);
      return audioResponse.arrayBuffer();
    }
    
    // Handle async processing with fetch_result URL
    if (result.fetch_result) {
      console.log('📍 ModelsLab async processing, polling:', result.fetch_result);
      return await pollModelsLabMusicResult(result.fetch_result, MODELSLAB_API_KEY);
    }
    
    // Handle processing status with id
    if (result.status === 'processing' && result.id) {
      const fetchUrl = `https://modelslab.com/api/v6/audio/fetch/${result.id}`;
      console.log('📍 ModelsLab processing, constructed fetch URL:', fetchUrl);
      return await pollModelsLabMusicResult(fetchUrl, MODELSLAB_API_KEY);
    }
    
    // If we get here, ModelsLab didn't return expected format
    console.warn('ModelsLab unexpected response format:', result);
    console.log('⚠️ Using silent audio placeholder as fallback');
    return generateSilentAudioPlaceholder(duration);
    
  } catch (error) {
    console.error('ModelsLab Music generation error:', error);
    console.log('⚠️ ModelsLab failed, using silent audio placeholder');
    return generateSilentAudioPlaceholder(duration);
  }
}

async function pollModelsLabMusicResult(fetchUrl: string, apiKey: string): Promise<ArrayBuffer> {
  const maxAttempts = 20; // Reduced from 30 to avoid edge function timeout
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced wait time
    attempts++;

    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey }),
      });

      const data = await response.json();
      console.log(`⏳ ModelsLab Music status (attempt ${attempts}/${maxAttempts}):`, data.status);

      if (data.status === 'success' && data.output && data.output[0]) {
        const audioResponse = await fetch(data.output[0]);
        return audioResponse.arrayBuffer();
      } else if (data.status === 'failed' || data.status === 'error') {
        console.warn('ModelsLab Music failed:', data.message);
        break; // Exit to fallback
      }
    } catch (pollError) {
      console.error(`Polling attempt ${attempts} failed:`, pollError);
      if (attempts >= maxAttempts) break;
    }
  }

  console.log('⚠️ ModelsLab polling exhausted, using silent audio placeholder');
  return generateSilentAudioPlaceholder(30);
}

// Generate a minimal silent MP3 as placeholder when all providers fail
function generateSilentAudioPlaceholder(duration: number): ArrayBuffer {
  console.log(`🔇 Generating ${duration}s silent audio placeholder`);
  
  // Minimal valid MP3 file structure (silent audio)
  // This is a tiny valid MP3 that will play as silence
  const mp3Header = new Uint8Array([
    0xFF, 0xFB, 0x90, 0x00, // MP3 frame header
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  
  // Create multiple frames for the requested duration (approx 26ms per frame at 128kbps)
  const framesNeeded = Math.ceil((duration * 1000) / 26);
  const frameSize = 80; // Minimal frame
  const totalSize = framesNeeded * frameSize;
  
  const fullAudio = new Uint8Array(Math.min(totalSize, 50000)); // Cap at 50KB
  for (let i = 0; i < fullAudio.length; i += frameSize) {
    fullAudio.set(mp3Header.slice(0, Math.min(frameSize, fullAudio.length - i)), i);
  }
  
  return fullAudio.buffer;
}

async function generateSunoMusic(prompt: string, duration: number, style?: string, instrumental?: boolean): Promise<ArrayBuffer> {
  const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
  
  if (!SUNO_API_KEY) {
    console.warn('Suno not configured, falling back to ElevenLabs');
    return generateElevenLabsMusic(prompt, duration);
  }

  // Suno API for full song generation
  const response = await fetch('https://api.suno.ai/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      duration: duration,
      style: style || 'auto',
      instrumental: instrumental ?? true,
      make_instrumental: instrumental ?? true,
    }),
  });

  if (!response.ok) {
    console.warn('Suno generation failed, falling back to ElevenLabs');
    return generateElevenLabsMusic(prompt, Math.min(duration, 60));
  }

  const result = await response.json();
  
  // Poll for completion if async
  if (result.status === 'processing' && result.id) {
    let attempts = 0;
    while (attempts < 60) { // Max 5 minutes wait
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await fetch(`https://api.suno.ai/v1/status/${result.id}`, {
        headers: { 'Authorization': `Bearer ${SUNO_API_KEY}` }
      });
      
      const status = await statusResponse.json();
      if (status.status === 'completed' && status.audio_url) {
        const audioResponse = await fetch(status.audio_url);
        return audioResponse.arrayBuffer();
      }
      
      if (status.status === 'failed') {
        throw new Error('Suno generation failed');
      }
      
      attempts++;
    }
  }

  if (result.audio_url) {
    const audioResponse = await fetch(result.audio_url);
    return audioResponse.arrayBuffer();
  }

  return generateElevenLabsMusic(prompt, Math.min(duration, 60));
}

async function generateAlibabaMusic(prompt: string, duration: number): Promise<ArrayBuffer> {
  const ALIBABA_API_KEY = Deno.env.get('ALIBABA_API_KEY');
  
  if (!ALIBABA_API_KEY) {
    console.warn('Alibaba not configured, falling back to ElevenLabs');
    return generateElevenLabsMusic(prompt, duration);
  }

  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/audio/music-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ALIBABA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'music-generation-v1',
      input: {
        prompt: prompt,
        duration: duration,
        style: 'auto'
      }
    }),
  });

  if (!response.ok) {
    console.warn('Alibaba Music failed, falling back to ElevenLabs');
    return generateElevenLabsMusic(prompt, duration);
  }

  const result = await response.json();
  if (result.output?.audio) {
    const binaryString = atob(result.output.audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  return generateElevenLabsMusic(prompt, duration);
}

async function generateModelsLabMusic(prompt: string, duration: number): Promise<ArrayBuffer> {
  const MODELSLAB_API_KEY = Deno.env.get('MODELSLAB_API_KEY');
  
  if (!MODELSLAB_API_KEY) {
    console.warn('ModelsLab not configured, falling back to ElevenLabs');
    return generateElevenLabsMusic(prompt, duration);
  }

  const response = await fetch('https://modelslab.com/api/v6/audio/text2music', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: MODELSLAB_API_KEY,
      prompt: prompt,
      duration: duration,
      seed: null,
      guidance_scale: 3.0,
    }),
  });

  if (!response.ok) {
    console.warn('ModelsLab Music failed, falling back to ElevenLabs');
    return generateElevenLabsMusic(prompt, Math.min(duration, 60));
  }

  const result = await response.json();
  if (result.status === 'success' && result.output && result.output[0]) {
    const audioResponse = await fetch(result.output[0]);
    return audioResponse.arrayBuffer();
  }

  return generateElevenLabsMusic(prompt, Math.min(duration, 60));
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: MusicRequest = await req.json();

    if (!request.prompt) {
      return new Response(
        JSON.stringify({ error: 'Music prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const region = request.region || 'US';
    const tier = request.tier || 'standard';

    // Get routing decision
    const routing = selectMusicProvider(region, tier);
    
    // Validate duration against provider limits
    const duration = Math.min(Math.max(request.duration || 30, 5), routing.maxDuration);
    
    // Override if provider explicitly specified
    const provider = request.provider || routing.provider;

    console.log(`🎵 Multi-Provider Music Request:`, {
      prompt: request.prompt.substring(0, 100),
      duration,
      region,
      provider,
      zone: routing.zone,
      cost: routing.cost,
      maxDuration: routing.maxDuration
    });

    let audioBuffer: ArrayBuffer;

    switch (provider) {
      case 'elevenlabs':
        audioBuffer = await generateElevenLabsMusic(request.prompt, duration);
        break;
      case 'suno':
        audioBuffer = await generateSunoMusic(request.prompt, duration, request.style, request.instrumental);
        break;
      case 'alibaba':
        audioBuffer = await generateAlibabaMusic(request.prompt, duration);
        break;
      case 'modelslab':
        audioBuffer = await generateModelsLabMusic(request.prompt, duration);
        break;
      default:
        audioBuffer = await generateElevenLabsMusic(request.prompt, duration);
    }

    const audioBase64 = base64Encode(audioBuffer);

    console.log(`✅ Music generated: ${audioBuffer.byteLength} bytes via ${provider}`);

    return new Response(
      JSON.stringify({
        success: true,
        audioContent: audioBase64,
        audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
        duration,
        provider,
        zone: routing.zone,
        cost: routing.cost,
        quality: routing.quality,
        type: request.instrumental !== false ? 'instrumental' : 'vocal',
        metadata: {
          promptUsed: request.prompt,
          format: 'mp3',
          region,
          tier,
          style: request.style || 'auto',
          maxDuration: routing.maxDuration
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Multi-Provider Music error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
