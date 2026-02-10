/**
 * ALIBABA TTS EDGE FUNCTION - Production Permanent Solution
 * 
 * Tri-path architecture:
 * 1. Qwen3-TTS-Flash via REST API (Primary - Singapore, best multilingual)
 *    - POST /compatible-mode/v1/audio/speech (OpenAI-compatible)
 *    - Models: qwen3-tts-flash, qwen2-tts
 *    - Available in Singapore & Virginia (international endpoints)
 * 
 * 2. Sambert via REST API (Fallback - reliable HTTP, Chinese voices)
 *    - POST /api/v1/services/aigc/text2audio/generation
 *    - Synchronous HTTP response
 *    - Chinese voice variants
 * 
 * 3. Fun Audio (Music/SFX generation) - Async REST
 *    - POST /api/v1/services/aigc/audio-generation/*
 * 
 * Regional Routing:
 * - Singapore (Primary): dashscope-intl.aliyuncs.com (ALIBABA_SINGAPORE_API_KEY)
 * - Virginia (Fallback): dashscope-intl.aliyuncs.com (ALIBABA_API_KEY)
 * - China (Beijing): dashscope.aliyuncs.com (ALIBABA_CHINA_API_KEY)
 * 
 * NOTE: CosyVoice WebSocket removed - replaced by Qwen3-TTS-Flash REST which
 * provides superior multilingual quality without WebSocket complexity.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// ENDPOINT CONFIGURATION
// ============================================================================

const ENDPOINTS = {
  china: {
    base: 'https://dashscope.aliyuncs.com',
    rest: 'https://dashscope.aliyuncs.com/api/v1',
    compatible: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    keyName: 'ALIBABA_CHINA_API_KEY',
  },
  singapore: {
    base: 'https://dashscope-intl.aliyuncs.com',
    rest: 'https://dashscope-intl.aliyuncs.com/api/v1',
    compatible: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    keyName: 'ALIBABA_SINGAPORE_API_KEY',
  },
  virginia: {
    base: 'https://dashscope-intl.aliyuncs.com',
    rest: 'https://dashscope-intl.aliyuncs.com/api/v1',
    compatible: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    keyName: 'ALIBABA_API_KEY',
  },
} as const;

// ============================================================================
// MODEL CONFIGURATIONS
// ============================================================================

const QWEN_TTS_MODELS = {
  'qwen3-tts-flash': { description: 'Latest Qwen3 TTS - fast, multilingual, Singapore available' },
  'qwen2-tts': { description: 'Qwen2 TTS - stable, multilingual' },
} as const;

const SAMBERT_MODELS = {
  'sambert-zhichu-v1': { voice: 'zhichu', gender: 'female', lang: 'zh-CN', description: 'Chinese female' },
  'sambert-zhide-v1': { voice: 'zhide', gender: 'male', lang: 'zh-CN', description: 'Chinese male' },
  'sambert-zhimiao-v1': { voice: 'zhimiao', gender: 'female', lang: 'zh-CN', description: 'Chinese sweet female' },
  'sambert-zhiyuan-v1': { voice: 'zhiyuan', gender: 'male', lang: 'zh-CN', description: 'Chinese broadcasting male' },
  'sambert-zhixiao-v1': { voice: 'zhixiao', gender: 'female', lang: 'zh-CN', description: 'Chinese child voice' },
} as const;

// Qwen TTS voice presets (multilingual) 
const QWEN_TTS_VOICES: Record<string, string> = {
  // Chinese
  'zh-CN-female': 'FunAudioLLM/CosyVoice2-0.5B:alex',
  'zh-CN-male': 'FunAudioLLM/CosyVoice2-0.5B:benjamin',
  'zh-TW-female': 'FunAudioLLM/CosyVoice2-0.5B:alex',
  // Japanese
  'ja-JP-female': 'FunAudioLLM/CosyVoice2-0.5B:alex',
  'ja-JP-male': 'FunAudioLLM/CosyVoice2-0.5B:benjamin',
  // Korean
  'ko-KR-female': 'FunAudioLLM/CosyVoice2-0.5B:alex',
  'ko-KR-male': 'FunAudioLLM/CosyVoice2-0.5B:benjamin',
  // English
  'en-US-female': 'FunAudioLLM/CosyVoice2-0.5B:alex',
  'en-US-male': 'FunAudioLLM/CosyVoice2-0.5B:benjamin',
  'en-GB-female': 'FunAudioLLM/CosyVoice2-0.5B:alex',
  'en-GB-male': 'FunAudioLLM/CosyVoice2-0.5B:benjamin',
  // Other supported languages
  'es-ES-female': 'FunAudioLLM/CosyVoice2-0.5B:alex',
  'fr-FR-female': 'FunAudioLLM/CosyVoice2-0.5B:alex',
  'de-DE-female': 'FunAudioLLM/CosyVoice2-0.5B:alex',
  'pt-BR-female': 'FunAudioLLM/CosyVoice2-0.5B:alex',
  'ar-SA-male': 'FunAudioLLM/CosyVoice2-0.5B:benjamin',
  'hi-IN-female': 'FunAudioLLM/CosyVoice2-0.5B:alex',
};

// ============================================================================
// TYPES
// ============================================================================

interface TTSRequest {
  text: string;
  model?: string;
  voice?: string;
  language?: string;
  format?: 'mp3' | 'wav' | 'pcm' | 'ogg';
  sampleRate?: number;
  speed?: number;
  pitch?: number;
  volume?: number;
  emotion?: string;
  style?: string;
  enableSSML?: boolean;
  // Music/SFX
  musicPrompt?: string;
  duration?: number;
  genre?: string;
  mood?: string;
  // Method override
  method?: 'qwen-tts' | 'sambert' | 'auto';
}

interface TTSResult {
  success: boolean;
  provider: 'alibaba';
  method: 'qwen3-tts-rest' | 'qwen2-tts-rest' | 'sambert-rest' | 'fun-audio';
  region: string;
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

// ============================================================================
// API KEY & REGION RESOLUTION
// ============================================================================

type RegionName = 'china-beijing' | 'singapore' | 'virginia';

interface ApiConfig {
  apiKey: string;
  region: RegionName;
  endpoints: typeof ENDPOINTS.china;
}

/**
 * Tri-region key resolution: Singapore → Virginia → China
 * Singapore is primary for international Qwen TTS models
 */
function getAllApiConfigs(): ApiConfig[] {
  const configs: ApiConfig[] = [];
  const sgKey = Deno.env.get('ALIBABA_SINGAPORE_API_KEY');
  const vaKey = Deno.env.get('ALIBABA_API_KEY');
  const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');

  // Singapore first (primary for Qwen TTS)
  if (sgKey) configs.push({ apiKey: sgKey, region: 'singapore', endpoints: ENDPOINTS.singapore });
  if (vaKey) configs.push({ apiKey: vaKey, region: 'virginia', endpoints: ENDPOINTS.virginia });
  if (chinaKey) configs.push({ apiKey: chinaKey, region: 'china-beijing', endpoints: ENDPOINTS.china });

  return configs;
}

function getApiConfig(): {
  apiKey: string | null;
  region: RegionName;
  endpoints: typeof ENDPOINTS.china;
} {
  const configs = getAllApiConfigs();
  if (configs.length > 0) return configs[0];
  return { apiKey: null, region: 'singapore', endpoints: ENDPOINTS.singapore };
}

// ============================================================================
// PATH 1: QWEN TTS VIA REST API (Primary - Singapore)
// ============================================================================

/**
 * Generate TTS using Qwen3-TTS-Flash or Qwen2-TTS via DashScope native REST API.
 * 
 * Endpoint: POST /api/v1/services/aigc/multimodal-generation/generation
 * Uses DashScope's multimodal generation endpoint (the official Qwen TTS API).
 * Returns base64 audio in response JSON.
 */
async function generateQwenTTSRest(
  text: string,
  voice: string,
  model: string,
  apiKey: string,
  restBase: string,
  format: string = 'mp3',
  speed: number = 1.0,
): Promise<Uint8Array> {
  const endpoint = `${restBase}/services/aigc/multimodal-generation/generation`;

  console.log(`🎤 [Qwen TTS REST] Model: ${model}, Voice: ${voice}, Endpoint: ${endpoint}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'disable',
    },
    body: JSON.stringify({
      model: model,
      input: {
        text: text,
      },
      parameters: {
        voice: voice,
        speed: speed,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ [Qwen TTS REST] Error (${response.status}):`, errorText);
    throw new Error(`Qwen TTS API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  
  console.log(`📦 [Qwen TTS REST] Response keys:`, JSON.stringify(Object.keys(result)));
  if (result.output) console.log(`📦 [Qwen TTS REST] Output keys:`, JSON.stringify(Object.keys(result.output)));
  
  // Qwen TTS can return audio in multiple locations depending on streaming mode:
  // Non-streaming: output.audio.audio_url (URL to wav file)
  // Streaming: output.choices[].message.audio_content (base64 PCM chunks)
  const audioData = result.output?.audio?.data;
  const audioUrl = result.output?.audio?.url 
    || result.output?.audio_url 
    || result.output?.results?.[0]?.url;

  if (audioData && audioData.length > 0) {
    // Decode base64
    const binaryString = atob(audioData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    if (bytes.length === 0) {
      throw new Error('Qwen TTS returned empty audio data');
    }
    console.log(`✅ [Qwen TTS REST] Generated ${bytes.length} bytes (base64 response)`);
    return bytes;
  }

  if (audioUrl) {
    console.log(`⬇️ [Qwen TTS REST] Downloading from ${audioUrl}`);
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) throw new Error('Failed to download Qwen TTS audio');
    const buffer = await audioResponse.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes.length === 0) {
      throw new Error('Qwen TTS audio download empty');
    }
    console.log(`✅ [Qwen TTS REST] Downloaded ${bytes.length} bytes`);
    return bytes;
  }

  console.error(`❌ [Qwen TTS REST] Unexpected response:`, JSON.stringify(result));
  throw new Error('No audio in Qwen TTS response');
}

// ============================================================================
// PATH 2: SAMBERT VIA REST API (Fallback - Chinese voices)
// ============================================================================

async function generateSambertREST(
  text: string,
  voice: string,
  apiKey: string,
  restBase: string,
  format: string = 'mp3',
  sampleRate: number = 48000,
): Promise<Uint8Array> {
  const endpoint = `${restBase}/services/aigc/text2audio/generation`;

  const sambertModel = voice.startsWith('sambert-') ? voice : `sambert-${voice}-v1`;
  const validModels = Object.keys(SAMBERT_MODELS);
  const selectedModel = validModels.includes(sambertModel) ? sambertModel : 'sambert-zhichu-v1';

  console.log(`🔊 [Sambert REST] Model: ${selectedModel}, Endpoint: ${endpoint}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'disable',
    },
    body: JSON.stringify({
      model: selectedModel,
      input: { text: text },
      parameters: {
        format: format,
        sample_rate: sampleRate,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ [Sambert REST] Error (${response.status}):`, errorText);
    throw new Error(`Sambert API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();

  if (result.output?.audio) {
    const binaryString = atob(result.output.audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    console.log(`✅ [Sambert REST] Generated ${bytes.length} bytes (base64 response)`);
    return bytes;
  }

  if (result.output?.audio_url) {
    console.log(`⬇️ [Sambert REST] Downloading from ${result.output.audio_url}`);
    const audioResponse = await fetch(result.output.audio_url);
    if (!audioResponse.ok) throw new Error('Failed to download Sambert audio');
    const buffer = await audioResponse.arrayBuffer();
    console.log(`✅ [Sambert REST] Downloaded ${buffer.byteLength} bytes`);
    return new Uint8Array(buffer);
  }

  console.error(`❌ [Sambert REST] Unexpected response:`, JSON.stringify(result));
  throw new Error('No audio in Sambert response');
}

// ============================================================================
// MAIN TTS GENERATION (Qwen TTS → Sambert fallback)
// ============================================================================

async function generateTTS(request: TTSRequest): Promise<TTSResult> {
  const startTime = Date.now();
  const allConfigs = getAllApiConfigs();

  if (allConfigs.length === 0) {
    return {
      success: false,
      provider: 'alibaba',
      method: 'qwen3-tts-rest',
      region: 'singapore',
      model: 'none',
      error: 'No Alibaba API key configured (ALIBABA_SINGAPORE_API_KEY, ALIBABA_API_KEY, or ALIBABA_CHINA_API_KEY)',
      fallback: true,
    };
  }

  // Determine voice from language preset
  const langKey = request.language || 'en-US-female';
  const voice = request.voice || QWEN_TTS_VOICES[langKey] || 'FunAudioLLM/CosyVoice2-0.5B:alex';
  const format = request.format || 'mp3';
  const speed = request.speed || 1.0;
  const method = request.method || 'auto';

  // Determine model: prefer qwen3-tts-flash, fallback to qwen2-tts
  const requestedModel = request.model;
  const qwenModels = ['qwen3-tts-flash', 'qwen2-tts'];
  
  console.log(`🎯 [Alibaba TTS] Language: ${langKey}, Voice: ${voice}, Method: ${method}`);

  // Try Qwen TTS REST on ALL regions (unless method=sambert forced)
  if (method !== 'sambert') {
    for (const model of qwenModels) {
      // If a specific model is requested, only try that one
      if (requestedModel && requestedModel in QWEN_TTS_MODELS && requestedModel !== model) continue;
      
      for (const config of allConfigs) {
        try {
          console.log(`🎤 [Path 1] Attempting ${model} REST on ${config.region}...`);
          const audioData = await generateQwenTTSRest(
            request.text, voice, model, config.apiKey, config.endpoints.rest, format, speed
          );

          const processingTimeMs = Date.now() - startTime;
          console.log(`✅ [Path 1] ${model} REST succeeded on ${config.region} in ${processingTimeMs}ms`);

          let binary = '';
          for (let i = 0; i < audioData.length; i++) {
            binary += String.fromCharCode(audioData[i]);
          }
          const audioBase64 = btoa(binary);

          const methodName = model === 'qwen3-tts-flash' ? 'qwen3-tts-rest' : 'qwen2-tts-rest';

          return {
            success: true,
            provider: 'alibaba',
            method: methodName as TTSResult['method'],
            region: config.region,
            model,
            voice,
            audioUrl: `data:audio/${format};base64,${audioBase64}`,
            audioBase64,
            duration: estimateDuration(request.text),
            metadata: {
              characterCount: request.text.length,
              format,
              sampleRate: request.sampleRate || 22050,
              processingTimeMs,
              estimatedCost: 0.014 * (request.text.length / 10000),
            },
          };
        } catch (restError) {
          console.warn(`⚠️ [Path 1] ${model} REST failed on ${config.region}:`, (restError as Error).message);
        }
      }
    }
    console.log(`🔄 All Qwen TTS REST attempts failed, falling back to Sambert REST...`);
  }

  // Fallback to Sambert REST (Chinese voices only)
  if (method !== 'qwen-tts') {
    for (const config of allConfigs) {
      try {
        console.log(`🔊 [Path 2] Attempting Sambert REST on ${config.region}...`);

        const sambertVoice = selectSambertVoice(langKey);
        const audioData = await generateSambertREST(
          request.text, sambertVoice, config.apiKey, config.endpoints.rest, format, 48000
        );

        const processingTimeMs = Date.now() - startTime;
        console.log(`✅ [Path 2] Sambert REST succeeded on ${config.region} in ${processingTimeMs}ms`);

        let binary = '';
        for (let i = 0; i < audioData.length; i++) {
          binary += String.fromCharCode(audioData[i]);
        }
        const audioBase64 = btoa(binary);

        return {
          success: true,
          provider: 'alibaba',
          method: 'sambert-rest',
          region: config.region,
          model: sambertVoice,
          voice: sambertVoice,
          audioUrl: `data:audio/${format};base64,${audioBase64}`,
          audioBase64,
          duration: estimateDuration(request.text),
          metadata: {
            characterCount: request.text.length,
            format,
            sampleRate: 48000,
            processingTimeMs,
            estimatedCost: 0.01 * (request.text.length / 10000),
          },
          fallback: method === 'auto',
        };
      } catch (restError) {
        console.warn(`⚠️ [Path 2] Sambert REST failed on ${config.region}:`, (restError as Error).message);
      }
    }
  }

  return {
    success: false,
    provider: 'alibaba',
    method: 'qwen3-tts-rest',
    region: allConfigs[0].region,
    model: 'qwen3-tts-flash',
    error: 'All Alibaba TTS attempts failed across all regions (Qwen TTS REST + Sambert REST)',
    fallback: true,
  };
}

// ============================================================================
// MUSIC/SFX GENERATION (Fun Audio - Async REST)
// ============================================================================

async function generateAudio(request: TTSRequest): Promise<TTSResult> {
  const startTime = Date.now();
  const { apiKey, region, endpoints } = getApiConfig();

  if (!apiKey) {
    return {
      success: false,
      provider: 'alibaba',
      method: 'fun-audio',
      region,
      model: request.model || 'fun-audio-music',
      error: 'No Alibaba API key configured',
      fallback: true,
    };
  }

  const modelMap: Record<string, { id: string; endpoint: string }> = {
    'fun-audio-music': { id: 'fun-audio-music-v1', endpoint: '/services/aigc/audio-generation/music' },
    'fun-audio-sfx': { id: 'fun-audio-sfx-v1', endpoint: '/services/aigc/audio-generation/sound-effects' },
    'fun-audio-ambient': { id: 'fun-audio-ambient-v1', endpoint: '/services/aigc/audio-generation/ambient' },
  };

  const modelKey = request.model || 'fun-audio-music';
  const modelConfig = modelMap[modelKey];

  if (!modelConfig) {
    return {
      success: false,
      provider: 'alibaba',
      method: 'fun-audio',
      region,
      model: modelKey,
      error: `Invalid music model. Available: ${Object.keys(modelMap).join(', ')}`,
    };
  }

  const apiUrl = `${endpoints.rest}${modelConfig.endpoint}`;
  console.log(`🎵 [Fun Audio] Model: ${modelConfig.id}, Endpoint: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
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
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Fun Audio] Error (${response.status}):`, errorText);
      return {
        success: false, provider: 'alibaba', method: 'fun-audio', region,
        model: modelKey, error: `API error: ${response.status}`, fallback: true,
      };
    }

    const result = await response.json();
    const taskId = result.output?.task_id;

    if (!taskId) {
      return {
        success: false, provider: 'alibaba', method: 'fun-audio', region,
        model: modelKey, error: 'No task ID returned', fallback: true,
      };
    }

    // Poll for completion (max 2 minutes)
    const statusUrl = `${endpoints.rest}/tasks/${taskId}`;
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
          success: true, provider: 'alibaba', method: 'fun-audio', region,
          model: modelKey, audioUrl,
          duration: request.duration || 30,
          metadata: {
            format: request.format || 'mp3',
            sampleRate: request.sampleRate || 44100,
            processingTimeMs,
            estimatedCost: 0.01 * (request.duration || 30),
          },
        };
      } else if (statusData.output?.task_status === 'FAILED') {
        return {
          success: false, provider: 'alibaba', method: 'fun-audio', region,
          model: modelKey, error: statusData.output?.message || 'Audio generation failed',
          fallback: true,
        };
      }
    }

    return {
      success: false, provider: 'alibaba', method: 'fun-audio', region,
      model: modelKey, error: 'Audio generation timed out', fallback: true,
    };
  } catch (error) {
    console.error('[Fun Audio] Error:', error);
    return {
      success: false, provider: 'alibaba', method: 'fun-audio', region,
      model: modelKey, error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true,
    };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function estimateDuration(text: string): number {
  const isChinese = /[\u4e00-\u9fa5]/.test(text);
  return isChinese ? text.length / 4 : text.split(/\s+/).length / 3;
}

function selectSambertVoice(langKey: string): string {
  if (langKey.includes('male') || langKey.includes('Male')) return 'sambert-zhide-v1';
  if (langKey.includes('child') || langKey.includes('Child')) return 'sambert-zhixiao-v1';
  if (langKey.includes('elder') || langKey.includes('broadcast')) return 'sambert-zhiyuan-v1';
  return 'sambert-zhichu-v1';
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

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
          error: 'text or musicPrompt required',
          availableModels: {
            qwenTTS: Object.entries(QWEN_TTS_MODELS).map(([id, info]) => ({ id, ...info })),
            sambert: Object.entries(SAMBERT_MODELS).map(([id, info]) => ({ id, ...info })),
            funAudio: ['fun-audio-music', 'fun-audio-sfx', 'fun-audio-ambient'],
          },
          voicePresets: Object.keys(QWEN_TTS_VOICES),
          architecture: {
            primary: 'Qwen3-TTS-Flash via REST (OpenAI-compatible /audio/speech endpoint)',
            secondary: 'Qwen2-TTS via REST (same endpoint)',
            fallback: 'Sambert via REST (/api/v1/services/aigc/text2audio/generation)',
            note: 'CosyVoice WebSocket removed - Qwen TTS REST provides superior multilingual quality.',
          },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route to music/sfx or TTS
    const isMusicModel = request.model && ['fun-audio-music', 'fun-audio-sfx', 'fun-audio-ambient'].includes(request.model);
    const result = isMusicModel ? await generateAudio(request) : await generateTTS(request);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Alibaba TTS] Unhandled error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        provider: 'alibaba',
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
