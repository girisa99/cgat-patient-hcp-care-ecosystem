/**
 * Multi-Provider Music Edge Function
 * 
 * Regional routing for music generation across 3 active zones:
 * - ElevenLabs: Premium tier + Western fallback
 * - Alibaba: CJK (Qwen Zone)
 * - ModelsLab: Default/Budget/Global (most reliable)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Upload music to Supabase Storage (uses service role — no RLS issues) ──
async function uploadMusicToStorage(audioBuffer: ArrayBuffer, sceneKey: string, projectId?: string): Promise<string | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('[Music] Missing SUPABASE_URL or SERVICE_ROLE_KEY — cannot upload to Storage');
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const folder = projectId || 'shared';
    const path = `${folder}/music/${sceneKey}-${Date.now()}.mp3`;
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });

    const { error } = await supabase.storage.from('cast-assets').upload(path, blob, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

    if (error) {
      console.warn(`[Music] Storage upload failed for ${sceneKey}:`, error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from('cast-assets').getPublicUrl(path);
    console.log(`[Music] Uploaded to Storage: ${publicUrl.substring(0, 80)}...`);
    return publicUrl;
  } catch (err) {
    console.warn(`[Music] Storage upload error:`, err);
    return null;
  }
}

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

// South Asia, SEA, Africa regions — routed to ModelsLab (global fallback)
// Previously routed to Google Lyria which has no public API
const SOUTH_ASIA_SEA_AFRICA_REGIONS = [
  'IN', 'PK', 'BD', 'LK', 'NP', 'BT',
  'ID', 'VN', 'TH', 'PH', 'MY', 'MM', 'KH', 'LA',
  'NG', 'KE', 'GH', 'ET', 'TZ', 'UG', 'ZW', 'ZM', 'RW', 'SN', 'CI'
];

type MusicProvider = 'elevenlabs' | 'alibaba' | 'modelslab' | 'fal-beatoven';

interface MusicRequest {
  prompt: string;
  duration?: number;
  region?: string;
  provider?: MusicProvider;
  tier?: 'standard' | 'advanced' | 'premium';
  style?: string;
  instrumental?: boolean;
  projectId?: string;  // For uploading to Storage
  sceneKey?: string;   // For Storage path naming
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
  // Provider priority: fal.ai Beatoven (best quality) > ModelsLab (reliable) > Alibaba > ElevenLabs (permission issues)
  const hasAlibaba = !!(Deno.env.get('ALIBABA_SINGAPORE_API_KEY') || Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('DASHSCOPE_API_KEY') || Deno.env.get('ALIBABA_CHINA_API_KEY'));
  return [
    { id: 'fal-beatoven', available: !!(Deno.env.get('FAL_API_KEY') || Deno.env.get('FAL_AI_KEY')), priority: 0 },
    { id: 'modelslab', available: !!Deno.env.get('MODELSLAB_API_KEY'), priority: 1 },
    { id: 'alibaba', available: hasAlibaba, priority: 2 },
    { id: 'elevenlabs', available: !!Deno.env.get('ELEVENLABS_API_KEY'), priority: 3 },
  ];
}

function selectMusicProvider(region: string, tier: string = 'standard'): MusicRouting {
  const providers = getAvailableMusicProviders().filter(p => p.available);
  
  if (providers.length === 0) {
    throw new Error('No music generation API keys configured. Please add MODELSLAB_API_KEY, ALIBABA_API_KEY, or ELEVENLABS_API_KEY.');
  }
  
  // Helper to check if provider is available
  const hasProvider = (id: MusicProvider) => providers.some(p => p.id === id);
  
  // Premium/Advanced tier: fal.ai Beatoven (44.1kHz, 3M+ training samples)
  if ((tier === 'premium' || tier === 'advanced') && hasProvider('fal-beatoven')) {
    console.log(`🎵 ${tier} tier: Routing to fal.ai Beatoven`);
    return {
      provider: 'fal-beatoven',
      cost: 0.025,
      zone: 'fal-premium',
      quality: 'premium',
      maxDuration: 300 // 5 minutes
    };
  }

  // Premium tier fallback: ElevenLabs
  if (tier === 'premium' && hasProvider('elevenlabs')) {
    console.log('🎵 Premium tier: Routing to ElevenLabs');
    return {
      provider: 'elevenlabs',
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

  // South Asia/SEA/Africa Zone: Use ModelsLab (global, most reliable)
  if (SOUTH_ASIA_SEA_AFRICA_REGIONS.includes(region) && hasProvider('modelslab')) {
    console.log('🌍 South Asia/SEA/Africa Zone: Routing to ModelsLab');
    return {
      provider: 'modelslab',
      cost: 0.015,
      zone: 'global',
      quality: 'standard',
      maxDuration: 60
    };
  }

  // Default: ModelsLab MusicGen (only confirmed working music provider)
  if (hasProvider('modelslab')) {
    console.log('🎯 Default routing: ModelsLab MusicGen (confirmed working)');
    return {
      provider: 'modelslab',
      cost: 0.015,
      zone: 'modelslab',
      quality: 'standard',
      maxDuration: 30
    };
  }

  // Fallback: Alibaba (music API may not exist on all endpoints)
  if (hasProvider('alibaba')) {
    console.log('🎯 Fallback routing: Alibaba/DashScope');
    return {
      provider: 'alibaba',
      cost: 0.015,
      zone: 'alibaba',
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

async function generateFalBeatevenMusic(prompt: string, duration: number): Promise<ArrayBuffer> {
  const FAL_KEY = Deno.env.get('FAL_API_KEY') || Deno.env.get('FAL_AI_KEY');
  if (!FAL_KEY) {
    console.log('⚠️ FAL_API_KEY not configured, falling back to ModelsLab');
    return generateModelsLabMusicDirect(prompt, duration);
  }

  try {
    console.log(`🎵 fal.ai Beatoven Music: "${prompt.substring(0, 80)}..." duration=${duration}s`);

    // fal.ai queue-based API: submit → poll for result
    const submitResp = await fetch('https://queue.fal.run/fal-ai/stable-audio', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        seconds_total: Math.min(duration, 300),
        steps: 100,
      }),
    });

    if (!submitResp.ok) {
      const errText = await submitResp.text();
      console.warn(`⚠️ fal.ai Beatoven submit failed (${submitResp.status}): ${errText.substring(0, 200)}`);
      return generateModelsLabMusicDirect(prompt, duration);
    }

    const submitData = await submitResp.json();

    // Check for immediate result (audio_file in response)
    if (submitData.audio_file?.url) {
      console.log(`✅ fal.ai Beatoven: immediate result`);
      const audioResp = await fetch(submitData.audio_file.url);
      if (audioResp.ok) return audioResp.arrayBuffer();
    }

    // Queue-based: poll request_id
    const requestId = submitData.request_id;
    if (!requestId) {
      console.warn('⚠️ fal.ai Beatoven: no request_id or immediate result, falling back');
      return generateModelsLabMusicDirect(prompt, duration);
    }

    console.log(`📍 fal.ai Beatoven queued: ${requestId}, polling...`);

    // Poll for completion (max 60 attempts × 3s = 3 min)
    for (let attempt = 1; attempt <= 60; attempt++) {
      await new Promise(r => setTimeout(r, 3000));

      try {
        const statusResp = await fetch(`https://queue.fal.run/fal-ai/stable-audio/requests/${requestId}/status`, {
          headers: { 'Authorization': `Key ${FAL_KEY}` },
        });

        if (!statusResp.ok) continue;
        const statusData = await statusResp.json();
        console.log(`⏳ fal.ai Beatoven (${attempt}/60): ${statusData.status}`);

        if (statusData.status === 'COMPLETED') {
          // Fetch the result
          const resultResp = await fetch(`https://queue.fal.run/fal-ai/stable-audio/requests/${requestId}`, {
            headers: { 'Authorization': `Key ${FAL_KEY}` },
          });
          if (resultResp.ok) {
            const resultData = await resultResp.json();
            const audioUrl = resultData.audio_file?.url;
            if (audioUrl) {
              console.log(`✅ fal.ai Beatoven completed: ${audioUrl.substring(0, 60)}`);
              const audioResp = await fetch(audioUrl);
              if (audioResp.ok) return audioResp.arrayBuffer();
            }
          }
          break;
        }
        if (statusData.status === 'FAILED') {
          console.warn(`⚠️ fal.ai Beatoven FAILED: ${statusData.error || 'unknown'}`);
          break;
        }
      } catch (pollErr) {
        console.warn(`⚠️ fal.ai poll error (${attempt}):`, pollErr);
      }
    }

    console.log('⚠️ fal.ai Beatoven polling exhausted, falling back to ModelsLab');
    return generateModelsLabMusicDirect(prompt, duration);
  } catch (error) {
    console.warn('⚠️ fal.ai Beatoven error, falling back to ModelsLab:', error);
    return generateModelsLabMusicDirect(prompt, duration);
  }
}

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

// Direct ModelsLab call — uses v6/voice/text2audio (MusicGen model)
// Set _debugErrors on the module to collect error details for diagnostics
const _debugErrors: string[] = [];

async function generateModelsLabMusicDirect(prompt: string, duration: number): Promise<ArrayBuffer> {
  const MODELSLAB_API_KEY = Deno.env.get('MODELSLAB_API_KEY');

  if (!MODELSLAB_API_KEY) {
    const msg = 'MODELSLAB_API_KEY not configured';
    console.log(`⚠️ ${msg}`);
    _debugErrors.push(msg);
    return generateSilentAudioPlaceholder(duration);
  }

  try {
    // Correct endpoint: v6/voice/music_gen (MusicGen model)
    // Docs: https://docs.modelslab.com/voice-cloning/music-gen
    // max_new_token controls duration: ~640 tokens ≈ 20s, ~1280 ≈ 40s
    const tokensForDuration = Math.min(Math.round((duration / 20) * 640), 1280);
    console.log(`🎵 ModelsLab music_gen: "${prompt.substring(0, 80)}..." duration=${duration}s tokens=${tokensForDuration}`);
    const response = await fetch('https://modelslab.com/api/v6/voice/music_gen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: MODELSLAB_API_KEY,
        prompt: prompt,
        sampling_rate: 32000,
        max_new_token: tokensForDuration,
        base64: false,
        temp: false,
        webhook: null,
        track_id: null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const msg = `ModelsLab API ${response.status}: ${errorText.substring(0, 200)}`;
      console.error(msg);
      _debugErrors.push(msg);
      return generateSilentAudioPlaceholder(duration);
    }

    const result = await response.json();
    const resultStr = JSON.stringify(result).substring(0, 300);
    console.log('ModelsLab Music response:', resultStr);

    // Immediate success with output
    if (result.status === 'success' && result.output && result.output[0]) {
      console.log('✅ ModelsLab: immediate success, downloading audio from:', result.output[0]);
      const audioResponse = await fetch(result.output[0]);
      if (!audioResponse.ok) {
        _debugErrors.push(`ModelsLab audio download failed: ${audioResponse.status}`);
        return generateSilentAudioPlaceholder(duration);
      }
      return audioResponse.arrayBuffer();
    }

    // Handle direct link response
    if (result.link) {
      console.log('✅ ModelsLab: direct link, downloading from:', result.link);
      const audioResponse = await fetch(result.link);
      return audioResponse.arrayBuffer();
    }

    // Handle async processing with fetch_result URL
    if (result.fetch_result) {
      console.log('📍 ModelsLab async processing, polling:', result.fetch_result);
      return await pollModelsLabMusicResult(result.fetch_result, MODELSLAB_API_KEY);
    }

    // Handle processing status with id (v6 uses different fetch URL)
    if ((result.status === 'processing' || result.status === 'queued') && result.id) {
      const fetchUrl = result.fetch_result || `https://modelslab.com/api/v6/voice/fetch/${result.id}`;
      console.log('📍 ModelsLab processing/queued, fetch URL:', fetchUrl);
      return await pollModelsLabMusicResult(fetchUrl, MODELSLAB_API_KEY);
    }

    // If we get here, ModelsLab didn't return expected format
    const msg = `ModelsLab unexpected response: ${resultStr}`;
    console.warn(msg);
    _debugErrors.push(msg);
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

async function generateAlibabaMusic(prompt: string, duration: number): Promise<ArrayBuffer> {
  // Match key names used by ai-universal-processor (the working visual generator)
  const sgKey = Deno.env.get('ALIBABA_SINGAPORE_API_KEY');
  const intlKey = Deno.env.get('ALIBABA_API_KEY');
  const dsKey = Deno.env.get('DASHSCOPE_API_KEY');
  const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
  const ALIBABA_API_KEY = sgKey || intlKey || dsKey || chinaKey;

  if (!ALIBABA_API_KEY) {
    console.warn('No Alibaba/DashScope key configured, falling back to ElevenLabs');
    return generateElevenLabsMusic(prompt, duration);
  }

  // Route to correct endpoint — Singapore/International preferred, China as fallback
  const useChina = !sgKey && !intlKey && !dsKey && !!chinaKey;
  const baseUrl = useChina
    ? 'https://dashscope.aliyuncs.com/api/v1'
    : 'https://dashscope-intl.aliyuncs.com/api/v1';

  console.log(`🎵 Alibaba Music via ${useChina ? 'China (Beijing)' : 'International (Singapore)'}`);

  const response = await fetch(`${baseUrl}/services/audio/music-generate`, {
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
    const errText = await response.text().catch(() => 'unknown');
    console.warn(`Alibaba Music failed (${response.status}): ${errText}`);
    return generateModelsLabMusicDirect(prompt, duration);
  }

  const result = await response.json();
  console.log('🎵 Alibaba Music response keys:', Object.keys(result), 'status:', result.status_code || result.code || 'n/a');

  // DashScope async task pattern — submit then poll
  if (result.output?.task_id) {
    console.log(`📍 Alibaba Music async task: ${result.output.task_id}, polling...`);
    return await pollDashScopeMusicTask(result.output.task_id, ALIBABA_API_KEY, baseUrl);
  }

  // Direct base64 audio response
  if (result.output?.audio) {
    console.log('✅ Alibaba Music returned direct audio');
    const binaryString = atob(result.output.audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Direct URL response
  if (result.output?.audio_url) {
    console.log('✅ Alibaba Music returned audio URL:', result.output.audio_url);
    const audioResp = await fetch(result.output.audio_url);
    return audioResp.arrayBuffer();
  }

  console.warn('Alibaba Music unexpected response:', JSON.stringify(result).substring(0, 300));
  return generateModelsLabMusicDirect(prompt, duration);
}

// Poll DashScope async music task (similar to image/video pattern)
async function pollDashScopeMusicTask(taskId: string, apiKey: string, baseUrl: string): Promise<ArrayBuffer> {
  const maxAttempts = 30;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const resp = await fetch(`${baseUrl}/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      const data = await resp.json();
      const status = data.output?.task_status || 'UNKNOWN';
      console.log(`⏳ DashScope Music task ${taskId} (${attempt}/${maxAttempts}): ${status}`);

      if (status === 'SUCCEEDED') {
        if (data.output?.audio_url) {
          const audioResp = await fetch(data.output.audio_url);
          return audioResp.arrayBuffer();
        }
        if (data.output?.audio) {
          const binaryString = atob(data.output.audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          return bytes.buffer;
        }
        console.warn('DashScope Music SUCCEEDED but no audio in output:', Object.keys(data.output || {}));
        break;
      }
      if (status === 'FAILED') {
        console.warn('DashScope Music task FAILED:', data.output?.message || data.message);
        break;
      }
    } catch (e) {
      console.error(`DashScope Music poll error (attempt ${attempt}):`, e);
    }
  }
  console.log('⚠️ DashScope Music polling exhausted, using silent placeholder');
  return generateSilentAudioPlaceholder(30);
}

async function generateModelsLabMusic(prompt: string, duration: number): Promise<ArrayBuffer> {
  const MODELSLAB_API_KEY = Deno.env.get('MODELSLAB_API_KEY');

  if (!MODELSLAB_API_KEY) {
    console.warn('ModelsLab not configured, falling back to ElevenLabs');
    return generateElevenLabsMusic(prompt, duration);
  }

  // Correct endpoint: v6/voice/music_gen (MusicGen model)
  const tokensForDuration = Math.min(Math.round((duration / 20) * 640), 1280);
  const response = await fetch('https://modelslab.com/api/v6/voice/music_gen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: MODELSLAB_API_KEY,
      prompt: prompt,
      sampling_rate: 32000,
      max_new_token: tokensForDuration,
      base64: false,
      temp: false,
      webhook: null,
      track_id: null,
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
      case 'fal-beatoven':
        audioBuffer = await generateFalBeatevenMusic(request.prompt, duration);
        break;
      case 'elevenlabs':
        audioBuffer = await generateElevenLabsMusic(request.prompt, duration);
        break;
      case 'alibaba':
        audioBuffer = await generateAlibabaMusic(request.prompt, duration);
        break;
      case 'modelslab':
        audioBuffer = await generateModelsLabMusic(request.prompt, duration);
        break;
      default:
        audioBuffer = await generateModelsLabMusicDirect(request.prompt, duration);
    }

    const isSilentPlaceholder = audioBuffer.byteLength < 60000 && new Uint8Array(audioBuffer).every((b, i) => i < 4 || b === 0);
    console.log(`${isSilentPlaceholder ? '⚠️ SILENT PLACEHOLDER' : '✅ Real music'}: ${audioBuffer.byteLength} bytes via ${provider}`);

    // Upload to Supabase Storage (service role — no RLS issues)
    // Returns HTTP URL so client never has to deal with data: URIs for music
    let storageUrl: string | null = null;
    if (!isSilentPlaceholder) {
      const sceneKey = request.sceneKey || `music-${Date.now()}`;
      storageUrl = await uploadMusicToStorage(audioBuffer, sceneKey, request.projectId);
    }

    // Only include base64 as fallback if Storage upload failed
    const audioBase64 = storageUrl ? undefined : base64Encode(audioBuffer);
    const audioUrl = storageUrl || (audioBase64 ? `data:audio/mpeg;base64,${audioBase64}` : undefined);

    return new Response(
      JSON.stringify({
        success: true,
        audioContent: audioBase64,
        audioUrl,
        duration,
        provider,
        zone: routing.zone,
        cost: routing.cost,
        quality: routing.quality,
        type: request.instrumental !== false ? 'instrumental' : 'vocal',
        isSilentPlaceholder,
        debugErrors: _debugErrors.length > 0 ? _debugErrors : undefined,
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
