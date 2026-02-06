/**
 * ALIBABA TTS EDGE FUNCTION - Complete Implementation
 * 
 * Supports ALL Alibaba audio generation models:
 * - CosyVoice (High-fidelity multilingual TTS)
 * - Fun Audio (Music/SFX generation)
 * - Sambert (Chinese TTS)
 * 
 * Regional Routing:
 * - China (Beijing): dashscope.aliyuncs.com - CosyVoice, Sambert
 * - International: dashscope-intl.aliyuncs.com - Some newer models
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Regional endpoints - BASE domains (no /api/v1 suffix for OpenAI-compatible)
const DASHSCOPE_CHINA_BASE = 'https://dashscope.aliyuncs.com';
const DASHSCOPE_INTL_BASE = 'https://dashscope-intl.aliyuncs.com';
// Legacy API prefix for non-OpenAI-compatible endpoints (music, sfx, clone, task polling)
const DASHSCOPE_CHINA_API = `${DASHSCOPE_CHINA_BASE}/api/v1`;
const DASHSCOPE_INTL_API = `${DASHSCOPE_INTL_BASE}/api/v1`;

// ============================================================================
// MODEL CONFIGURATIONS - All Available Alibaba TTS/Audio Models
// ============================================================================

const TTS_MODELS = {
  // CosyVoice Series (Beijing region ONLY) - High-fidelity TTS
  // Official models: cosyvoice-v3-plus, cosyvoice-v3-flash, cosyvoice-v2
  'cosyvoice-v3-flash': { id: 'cosyvoice-v3-flash', region: 'china', type: 'tts', description: 'CosyVoice v3 Flash - fast, cost-effective, streaming' },
  'cosyvoice-v3-plus': { id: 'cosyvoice-v3-plus', region: 'china', type: 'tts', description: 'CosyVoice v3 Plus - highest quality, voice cloning' },
  'cosyvoice-v2': { id: 'cosyvoice-v2', region: 'china', type: 'tts', description: 'CosyVoice v2 - educational, SSML support' },
  
  // Sambert Series (China region) - Classic Chinese TTS (REST API)
  'sambert-zhichu': { id: 'sambert-zhichu-v1', region: 'china', type: 'sambert', description: 'Chinese female voice' },
  'sambert-zhide': { id: 'sambert-zhide-v1', region: 'china', type: 'sambert', description: 'Chinese male voice' },
  'sambert-zhimiao': { id: 'sambert-zhimiao-v1', region: 'china', type: 'sambert', description: 'Chinese sweet female' },
  'sambert-zhiyuan': { id: 'sambert-zhiyuan-v1', region: 'china', type: 'sambert', description: 'Chinese broadcasting male' },
  
  // Fun Audio Series (China region) - Music & SFX Generation
  'fun-audio-music': { id: 'fun-audio-music-v1', region: 'china', type: 'music', description: 'Text-to-music generation' },
  'fun-audio-sfx': { id: 'fun-audio-sfx-v1', region: 'china', type: 'sfx', description: 'Text-to-sound-effects' },
  'fun-audio-ambient': { id: 'fun-audio-ambient-v1', region: 'china', type: 'ambient', description: 'Ambient/background audio' },
} as const;

type TTSModelKey = keyof typeof TTS_MODELS;

// Official CosyVoice voice presets per model version
// v3-flash/v3-plus: longanyang, longlaotie, longshuo, longxiaobai, longxiaoxia, etc.
// v2: longxiaochun_v2, longhua_v2, longcheng_v2, etc.
const VOICE_PRESETS: Record<string, { voice: string; model: TTSModelKey }> = {
  // Chinese voices (CosyVoice v3-flash)
  'zh-CN-female': { voice: 'longxiaoxia', model: 'cosyvoice-v3-flash' },
  'zh-CN-male': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'zh-CN-child': { voice: 'longxiaobai', model: 'cosyvoice-v3-flash' },
  'zh-CN-elder-female': { voice: 'longxiaoxia', model: 'cosyvoice-v3-flash' },
  'zh-CN-elder-male': { voice: 'longlaotie', model: 'cosyvoice-v3-flash' },
  
  // Multilingual voices (CosyVoice v3-flash supports multilingual)
  'en-US-female': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'en-US-male': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'en-GB-female': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'en-GB-male': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'ja-JP-female': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'ja-JP-male': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'ko-KR-female': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'ko-KR-male': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'es-ES-female': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'fr-FR-female': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'de-DE-female': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'pt-BR-female': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'ar-SA-male': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
  'hi-IN-female': { voice: 'longanyang', model: 'cosyvoice-v3-flash' },
};

// CosyVoice uses DashScope WebSocket SDK natively. For HTTP REST:
// - Sambert models: /api/v1/services/aigc/text2audio/generation (synchronous REST)
// - CosyVoice: /compatible-mode/v1/audio/speech (OpenAI-compatible HTTP)
const API_ENDPOINTS = {
  tts: '/compatible-mode/v1/audio/speech',  // CosyVoice OpenAI-compatible HTTP
  sambert: '/api/v1/services/aigc/text2audio/generation',  // Sambert REST
  music: '/api/v1/services/aigc/audio-generation/music',
  sfx: '/api/v1/services/aigc/audio-generation/sound-effects',
  ambient: '/api/v1/services/aigc/audio-generation/ambient',
  clone: '/api/v1/services/audio/tts/customization',
};

interface TTSRequest {
  // Content
  text: string;
  
  // Model selection
  model?: TTSModelKey;
  voice?: string;
  language?: string;           // e.g., 'zh-CN-female', 'en-US-male'
  
  // Audio parameters
  format?: 'mp3' | 'wav' | 'pcm' | 'ogg';
  sampleRate?: 8000 | 16000 | 24000 | 44100 | 48000;
  
  // Speech parameters
  speed?: number;              // 0.5 - 2.0
  pitch?: number;              // -12 to 12 semitones
  volume?: number;             // 0-100
  
  // Advanced
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';
  style?: 'narration' | 'conversation' | 'news' | 'story';
  enableSSML?: boolean;
  
  // Voice cloning (for cosyvoice-clone)
  referenceAudioUrl?: string;
  referenceAudioBase64?: string;
  
  // Music/SFX generation (for fun-audio models)
  musicPrompt?: string;
  duration?: number;           // seconds
  genre?: string;
  mood?: string;
}

interface TTSResult {
  success: boolean;
  provider: 'alibaba';
  region: 'china-beijing' | 'international';
  model: string;
  voice?: string;
  audioUrl?: string;
  audioBase64?: string;
  duration?: number;
  metadata?: {
    characterCount?: number;
    format?: string;
    sampleRate?: number;
    processingTimeMs?: number;
    estimatedCost?: number;
  };
  error?: string;
  fallback?: boolean;
}

/**
 * Get API configuration based on model region
 */
function getApiConfig(modelKey: TTSModelKey): { 
  apiKey: string | null; 
  baseDomain: string;
  apiBase: string;
  region: 'china-beijing' | 'international';
} {
  const modelConfig = TTS_MODELS[modelKey];
  
  // CosyVoice is Beijing-only per Alibaba docs
  const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
  const intlKey = Deno.env.get('ALIBABA_API_KEY');
  
  if (modelConfig.region === 'china') {
    const apiKey = chinaKey || intlKey || null;
    const baseDomain = chinaKey ? DASHSCOPE_CHINA_BASE : DASHSCOPE_INTL_BASE;
    const apiBase = chinaKey ? DASHSCOPE_CHINA_API : DASHSCOPE_INTL_API;
    return { apiKey, baseDomain, apiBase, region: chinaKey ? 'china-beijing' : 'international' };
  } else {
    const apiKey = intlKey || chinaKey || null;
    const baseDomain = intlKey ? DASHSCOPE_INTL_BASE : DASHSCOPE_CHINA_BASE;
    const apiBase = intlKey ? DASHSCOPE_INTL_API : DASHSCOPE_CHINA_API;
    return { apiKey, baseDomain, apiBase, region: intlKey ? 'international' : 'china-beijing' };
  }
}

/**
 * Generate TTS audio with CosyVoice or Sambert
 */
async function generateTTS(request: TTSRequest): Promise<TTSResult> {
  const startTime = Date.now();
  
  // Determine model and voice from language preset or explicit values
  let modelKey: TTSModelKey = request.model || 'cosyvoice-v3-flash';
  let voice = request.voice;
  
  // Apply language preset if specified
  if (!voice && request.language && VOICE_PRESETS[request.language]) {
    const preset = VOICE_PRESETS[request.language];
    modelKey = preset.model;
    voice = preset.voice;
  }
  
  // Default voice based on model version
  if (!voice) {
    if (modelKey.startsWith('cosyvoice-v3')) {
      voice = 'longanyang'; // Official v3 voice
    } else if (modelKey === 'cosyvoice-v2') {
      voice = 'longxiaochun_v2'; // Official v2 voice
    } else {
      voice = 'zhiyan'; // Sambert default
    }
  }
  
  const modelConfig = TTS_MODELS[modelKey];
  if (!modelConfig) {
    return {
      success: false,
      provider: 'alibaba',
      region: 'china-beijing',
      model: modelKey,
      error: `Invalid model. Available: ${Object.keys(TTS_MODELS).join(', ')}`,
    };
  }
  
  const { apiKey, baseDomain, apiBase, region } = getApiConfig(modelKey);
  
  console.log(`🎤 [Alibaba TTS] Model: ${modelKey} (${modelConfig.id}), Voice: ${voice}, Region: ${region}`);
  
  if (!apiKey) {
    return {
      success: false,
      provider: 'alibaba',
      region,
      model: modelKey,
      error: `API key not configured for ${region} region`,
      fallback: true
    };
  }
  
  // Build endpoint URL based on model type
  // CosyVoice: uses OpenAI-compatible endpoint at BASE_DOMAIN/compatible-mode/v1/audio/speech
  // Sambert: uses DashScope REST at BASE_DOMAIN/api/v1/services/aigc/text2audio/generation
  const endpoint = API_ENDPOINTS[modelConfig.type as keyof typeof API_ENDPOINTS] || API_ENDPOINTS.tts;
  // CosyVoice endpoint uses baseDomain (no /api/v1), Sambert/music use apiBase (with /api/v1)
  const isCosyVoice = modelConfig.type === 'tts';
  const apiUrl = isCosyVoice ? `${baseDomain}${endpoint}` : `${apiBase.replace('/api/v1', '')}${endpoint}`;
  
  console.log(`🇨🇳 Calling DashScope: ${apiUrl}`);
  
  try {
    let response: Response;
    
    if (endpoint === API_ENDPOINTS.tts) {
      // OpenAI-compatible format for CosyVoice
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelConfig.id,
          input: request.text,
          voice: voice,
          response_format: request.format || 'mp3',
          speed: request.speed || 1.0,
        }),
      });
    } else {
      // Legacy DashScope format for music/sfx/clone
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'disable',
        },
        body: JSON.stringify({
          model: modelConfig.id,
          input: { text: request.text },
          parameters: {
            voice,
            format: request.format || 'mp3',
            sample_rate: request.sampleRate || 24000,
          },
        }),
      });
    }
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`DashScope TTS error (${response.status}):`, responseText);
      
      try {
        const errorJson = JSON.parse(responseText);
        return {
          success: false,
          provider: 'alibaba',
          region,
          model: modelKey,
          voice,
          error: errorJson.message || `API error: ${response.status}`,
          fallback: true
        };
      } catch {
        return {
          success: false,
          provider: 'alibaba',
          region,
          model: modelKey,
          error: `API error: ${response.status}`,
          fallback: true
        };
      }
    }
    
    // OpenAI-compatible returns audio binary directly
    const contentType = response.headers.get('content-type') || '';
    let audioUrl: string | undefined;
    let audioBase64: string | undefined;
    
    if (contentType.includes('audio') || contentType.includes('octet-stream')) {
      const arrayBuffer = await response.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      // Convert to base64
      let binary = '';
      for (let i = 0; i < uint8.length; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      audioBase64 = btoa(binary);
      audioUrl = `data:audio/${request.format || 'mp3'};base64,${audioBase64}`;
    } else {
      // JSON response (legacy format)
      const responseText = await response.text();
      const result = JSON.parse(responseText);
      audioUrl = result.output?.audio_url || result.output?.audio;
      if (result.output?.audio && !result.output.audio.startsWith('http')) {
        audioBase64 = result.output.audio;
        audioUrl = `data:audio/${request.format || 'mp3'};base64,${audioBase64}`;
      }
    }
    
    // Estimate duration
    const isChinese = /[\u4e00-\u9fa5]/.test(request.text);
    const estimatedDuration = isChinese 
      ? request.text.length / 4 
      : request.text.split(/\s+/).length / 3;
    
    const processingTimeMs = Date.now() - startTime;
    
    console.log(`✅ [Alibaba TTS] Generated in ${processingTimeMs}ms`);
    
    return {
      success: true,
      provider: 'alibaba',
      region,
      model: modelKey,
      voice,
      audioUrl,
      audioBase64,
      duration: estimatedDuration,
      metadata: {
        characterCount: request.text.length,
        format: request.format || 'mp3',
        sampleRate: request.sampleRate || 24000,
        processingTimeMs,
        estimatedCost: 0.002 * (request.text.length / 1000), // ~$0.002/1K chars
      }
    };
    
  } catch (error) {
    console.error('[Alibaba TTS] Error:', error);
    return {
      success: false,
      provider: 'alibaba',
      region,
      model: modelKey,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    };
  }
}

/**
 * Generate music or sound effects with Fun Audio
 */
async function generateAudio(request: TTSRequest): Promise<TTSResult> {
  const startTime = Date.now();
  
  const modelKey = request.model || 'fun-audio-music';
  const modelConfig = TTS_MODELS[modelKey as TTSModelKey];
  
  if (!modelConfig || !['music', 'sfx', 'ambient'].includes(modelConfig.type)) {
    return {
      success: false,
      provider: 'alibaba',
      region: 'china-beijing',
      model: modelKey,
      error: `Invalid music model. Available: fun-audio-music, fun-audio-sfx, fun-audio-ambient`,
    };
  }
  
  const { apiKey, baseUrl, region } = getApiConfig(modelKey as TTSModelKey);
  
  console.log(`🎵 [Fun Audio] Model: ${modelKey}, Type: ${modelConfig.type}`);
  
  if (!apiKey) {
    return {
      success: false,
      provider: 'alibaba',
      region,
      model: modelKey,
      error: `API key not configured for ${region} region`,
      fallback: true
    };
  }
  
  const payload = {
    model: modelConfig.id,
    input: {
      prompt: request.musicPrompt || request.text,
      ...(request.genre && { genre: request.genre }),
      ...(request.mood && { mood: request.mood }),
    },
    parameters: {
      duration: request.duration || 30,
      format: request.format || 'mp3',
      sample_rate: request.sampleRate || 44100,
    }
  };
  
  const endpoint = API_ENDPOINTS[modelConfig.type as keyof typeof API_ENDPOINTS];
  const apiUrl = `${baseUrl}${endpoint}`;
  
  console.log(`🇨🇳 Calling DashScope: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable', // Music generation is async
      },
      body: JSON.stringify(payload),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`DashScope Fun Audio error (${response.status}):`, responseText);
      return {
        success: false,
        provider: 'alibaba',
        region,
        model: modelKey,
        error: `API error: ${response.status}`,
        fallback: true
      };
    }
    
    const result = JSON.parse(responseText);
    const taskId = result.output?.task_id;
    
    if (taskId) {
      // Poll for completion
      const statusUrl = `${baseUrl}/tasks/${taskId}`;
      
      for (let i = 0; i < 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const statusResponse = await fetch(statusUrl, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        
        if (!statusResponse.ok) continue;
        
        const statusData = await statusResponse.json();
        
        if (statusData.output?.task_status === 'SUCCEEDED') {
          const audioUrl = statusData.output?.audio_url;
          const processingTimeMs = Date.now() - startTime;
          
          console.log(`✅ [Fun Audio] Generated in ${processingTimeMs}ms`);
          
          return {
            success: true,
            provider: 'alibaba',
            region,
            model: modelKey,
            audioUrl,
            duration: request.duration || 30,
            metadata: {
              format: request.format || 'mp3',
              sampleRate: request.sampleRate || 44100,
              processingTimeMs,
              estimatedCost: 0.01 * (request.duration || 30), // ~$0.01/second
            }
          };
        } else if (statusData.output?.task_status === 'FAILED') {
          return {
            success: false,
            provider: 'alibaba',
            region,
            model: modelKey,
            error: statusData.output?.message || 'Audio generation failed',
            fallback: true
          };
        }
      }
      
      return {
        success: false,
        provider: 'alibaba',
        region,
        model: modelKey,
        error: 'Audio generation timed out',
        fallback: true
      };
    }
    
    return {
      success: false,
      provider: 'alibaba',
      region,
      model: modelKey,
      error: 'No task ID returned',
      fallback: true
    };
    
  } catch (error) {
    console.error('[Fun Audio] Error:', error);
    return {
      success: false,
      provider: 'alibaba',
      region,
      model: modelKey,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: TTSRequest = await req.json();
    
    if (!request.text && !request.musicPrompt) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Text or musicPrompt required',
          availableModels: Object.entries(TTS_MODELS).map(([key, config]) => ({
            id: key,
            type: config.type,
            description: config.description,
            region: config.region,
          })),
          voicePresets: Object.keys(VOICE_PRESETS),
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Route to appropriate generator
    const modelKey = request.model as TTSModelKey;
    const modelConfig = modelKey ? TTS_MODELS[modelKey] : null;
    
    let result: TTSResult;
    
    if (modelConfig && ['music', 'sfx', 'ambient'].includes(modelConfig.type)) {
      result = await generateAudio(request);
    } else {
      result = await generateTTS(request);
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[Alibaba TTS] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        provider: 'alibaba',
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
