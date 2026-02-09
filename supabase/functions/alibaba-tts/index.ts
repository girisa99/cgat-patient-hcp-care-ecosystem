/**
 * ALIBABA TTS EDGE FUNCTION - Production Permanent Solution
 * 
 * Dual-path architecture:
 * 1. CosyVoice via WebSocket (Primary - highest quality multilingual)
 *    - wss://dashscope.aliyuncs.com/api-ws/v1/inference
 *    - Supports: cosyvoice-v3-flash, cosyvoice-v3-plus, cosyvoice-v2
 *    - CosyVoice ONLY supports WebSocket/SDK, NOT HTTP REST
 * 
 * 2. Sambert via REST API (Fallback - reliable HTTP)
 *    - POST /api/v1/services/aigc/text2audio/generation
 *    - Synchronous HTTP response
 *    - Chinese voice variants
 * 
 * 3. Fun Audio (Music/SFX generation) - Async REST
 *    - POST /api/v1/services/aigc/audio-generation/*
 * 
 * Regional Routing:
 * - China (Beijing): dashscope.aliyuncs.com (ALIBABA_CHINA_API_KEY)
 * - International (Virginia): dashscope-intl.aliyuncs.com (ALIBABA_API_KEY)
 * 
 * WHY NOT OpenAI-compatible endpoint?
 * The /compatible-mode/v1/audio/speech path does NOT exist for CosyVoice.
 * DashScope's OpenAI-compatible mode only covers /chat/completions, /embeddings, /images.
 * CosyVoice requires WebSocket protocol per official Alibaba docs.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import WebSocket from "npm:ws@8.18.0";

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
    ws: 'wss://dashscope.aliyuncs.com/api-ws/v1/inference',
    rest: 'https://dashscope.aliyuncs.com/api/v1',
    keyName: 'ALIBABA_CHINA_API_KEY',
  },
  singapore: {
    base: 'https://dashscope-intl.aliyuncs.com',
    ws: 'wss://dashscope-intl.aliyuncs.com/api-ws/v1/inference',
    rest: 'https://dashscope-intl.aliyuncs.com/api/v1',
    keyName: 'ALIBABA_SINGAPORE_API_KEY',
  },
  virginia: {
    base: 'https://dashscope-intl.aliyuncs.com',
    ws: 'wss://dashscope-intl.aliyuncs.com/api-ws/v1/inference',
    rest: 'https://dashscope-intl.aliyuncs.com/api/v1',
    keyName: 'ALIBABA_API_KEY',
  },
} as const;

// ============================================================================
// MODEL CONFIGURATIONS
// ============================================================================

const COSYVOICE_MODELS = {
  'cosyvoice-v3-flash': { description: 'Fast, cost-effective, streaming ($0.14/10K chars)' },
  'cosyvoice-v3-plus': { description: 'Highest quality, voice cloning ($0.29/10K chars)' },
  'cosyvoice-v2': { description: 'Educational, SSML support' },
} as const;

const SAMBERT_MODELS = {
  'sambert-zhichu-v1': { voice: 'zhichu', gender: 'female', lang: 'zh-CN', description: 'Chinese female' },
  'sambert-zhide-v1': { voice: 'zhide', gender: 'male', lang: 'zh-CN', description: 'Chinese male' },
  'sambert-zhimiao-v1': { voice: 'zhimiao', gender: 'female', lang: 'zh-CN', description: 'Chinese sweet female' },
  'sambert-zhiyuan-v1': { voice: 'zhiyuan', gender: 'male', lang: 'zh-CN', description: 'Chinese broadcasting male' },
  'sambert-zhixiao-v1': { voice: 'zhixiao', gender: 'female', lang: 'zh-CN', description: 'Chinese child voice' },
} as const;

// CosyVoice v3 voice presets (multilingual)
const COSYVOICE_VOICES: Record<string, string> = {
  // Chinese
  'zh-CN-female': 'longxiaoxia',
  'zh-CN-male': 'longanyang',
  'zh-CN-child': 'longxiaobai',
  'zh-CN-elder': 'longlaotie',
  'zh-TW-female': 'longxiaoxia',
  'zh-TW-male': 'longanyang',
  // Japanese
  'ja-JP-female': 'longanyang',
  'ja-JP-male': 'longanyang',
  // Korean
  'ko-KR-female': 'longanyang',
  'ko-KR-male': 'longanyang',
  // English (CosyVoice supports English too)
  'en-US-female': 'longxiaoxia',
  'en-US-male': 'longanyang',
  'en-GB-female': 'longxiaoxia',
  'en-GB-male': 'longanyang',
  // Other supported languages
  'es-ES-female': 'longanyang',
  'fr-FR-female': 'longanyang',
  'de-DE-female': 'longanyang',
  'pt-BR-female': 'longanyang',
  'ar-SA-male': 'longanyang',
  'hi-IN-female': 'longanyang',
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
  // Voice cloning
  referenceAudioUrl?: string;
  // Music/SFX
  musicPrompt?: string;
  duration?: number;
  genre?: string;
  mood?: string;
  // Method override
  method?: 'websocket' | 'rest' | 'auto';
}

interface TTSResult {
  success: boolean;
  provider: 'alibaba';
  method: 'cosyvoice-websocket' | 'sambert-rest' | 'fun-audio';
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
 * Tri-region key resolution: China → Singapore → Virginia
 * Returns ALL available configs for cross-region fallback
 */
function getAllApiConfigs(): ApiConfig[] {
  const configs: ApiConfig[] = [];
  const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
  const sgKey = Deno.env.get('ALIBABA_SINGAPORE_API_KEY');
  const vaKey = Deno.env.get('ALIBABA_API_KEY');

  if (chinaKey) configs.push({ apiKey: chinaKey, region: 'china-beijing', endpoints: ENDPOINTS.china });
  if (sgKey) configs.push({ apiKey: sgKey, region: 'singapore', endpoints: ENDPOINTS.singapore });
  if (vaKey) configs.push({ apiKey: vaKey, region: 'virginia', endpoints: ENDPOINTS.virginia });

  return configs;
}

function getApiConfig(): {
  apiKey: string | null;
  region: RegionName;
  endpoints: typeof ENDPOINTS.china;
} {
  const configs = getAllApiConfigs();
  if (configs.length > 0) return configs[0];
  return { apiKey: null, region: 'china-beijing', endpoints: ENDPOINTS.china };
}

// ============================================================================
// PATH 1: COSYVOICE VIA WEBSOCKET (Primary - Best Quality)
// ============================================================================

/**
 * Generate TTS using CosyVoice via DashScope WebSocket API.
 * 
 * Protocol:
 * 1. Connect to wss://dashscope.aliyuncs.com/api-ws/v1/inference
 * 2. Send run-task JSON with model, voice, text
 * 3. Receive binary audio frames + JSON status messages
 * 4. Collect audio chunks until task-finished event
 * 
 * Auth: API key passed as Bearer token in WebSocket handshake headers.
 * Deno's WebSocket doesn't support custom headers directly, so we pass
 * the token as a URL query parameter which DashScope accepts.
 */
async function generateCosyVoiceWebSocket(
  text: string,
  voice: string,
  model: string,
  apiKey: string,
  wsUrl: string,
  format: string = 'mp3',
  sampleRate: number = 22050,
  speed: number = 1.0,
): Promise<Uint8Array> {
  const taskId = crypto.randomUUID();

  console.log(`🎤 [CosyVoice WS] Connecting to ${wsUrl} via npm:ws (custom headers)`);
  console.log(`🎤 [CosyVoice WS] Model: ${model}, Voice: ${voice}, Format: ${format}`);

  return new Promise<Uint8Array>((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const audioChunks: Uint8Array[] = [];
    let totalBytes = 0;
    let taskStarted = false;

    // Use npm:ws which supports custom headers for Authorization
    const ws = new WebSocket(wsUrl, {
      headers: {
        'Authorization': `bearer ${apiKey}`,
      },
    });

    // Set 30-second timeout
    timeoutId = setTimeout(() => {
      console.error(`❌ [CosyVoice WS] Timeout after 30s`);
      try { ws.close(); } catch (_) { /* ignore */ }
      reject(new Error('CosyVoice WebSocket timeout (30s)'));
    }, 30000);

    ws.onopen = () => {
      console.log(`✅ [CosyVoice WS] Connected, sending run-task`);

      // Send the synthesis request per DashScope WebSocket protocol
      const runTask = {
        header: {
          action: 'run-task',
          task_id: taskId,
          streaming: 'out',
        },
        payload: {
          task_group: 'audio',
          task: 'tts',
          function: 'SpeechSynthesizer',
          model: model,
          parameters: {
            text_type: 'PlainText',
            voice: voice,
            format: format,
            sample_rate: sampleRate,
            volume: 50,
            rate: speed,
            pitch: 1.0,
          },
          input: {
            text: text,
          },
        },
      };

      ws.send(JSON.stringify(runTask));
    };

    ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        // Binary frame = audio data
        const chunk = new Uint8Array(event.data);
        audioChunks.push(chunk);
        totalBytes += chunk.length;
      } else if (event.data instanceof Blob) {
        // Blob frame = audio data (convert to ArrayBuffer)
        event.data.arrayBuffer().then((buffer) => {
          const chunk = new Uint8Array(buffer);
          audioChunks.push(chunk);
          totalBytes += chunk.length;
        });
      } else if (typeof event.data === 'string') {
        // Text frame = JSON status message
        try {
          const msg = JSON.parse(event.data);
          const headerEvent = msg.header?.event;

          if (headerEvent === 'task-started') {
            taskStarted = true;
            console.log(`🎤 [CosyVoice WS] Task started: ${taskId}`);
          } else if (headerEvent === 'task-finished') {
            console.log(`✅ [CosyVoice WS] Task finished: ${totalBytes} bytes in ${audioChunks.length} chunks`);
            clearTimeout(timeoutId);
            try { ws.close(); } catch (_) { /* ignore */ }

            // Combine all audio chunks
            const combined = new Uint8Array(totalBytes);
            let offset = 0;
            for (const chunk of audioChunks) {
              combined.set(chunk, offset);
              offset += chunk.length;
            }
            resolve(combined);
          } else if (headerEvent === 'task-failed') {
            const errorMsg = msg.payload?.message || msg.header?.error_message || 'CosyVoice task failed';
            const errorCode = msg.header?.error_code || 'UNKNOWN';
            console.error(`❌ [CosyVoice WS] Task failed: ${errorCode} - ${errorMsg}`);
            clearTimeout(timeoutId);
            try { ws.close(); } catch (_) { /* ignore */ }
            reject(new Error(`CosyVoice error (${errorCode}): ${errorMsg}`));
          } else {
            console.log(`📨 [CosyVoice WS] Event: ${headerEvent}`);
          }
        } catch (parseError) {
          console.warn(`⚠️ [CosyVoice WS] Non-JSON text message:`, event.data);
        }
      }
    };

    ws.onerror = (error: Event) => {
      console.error(`❌ [CosyVoice WS] WebSocket error:`, error);
      clearTimeout(timeoutId);
      reject(new Error(`CosyVoice WebSocket connection error`));
    };

    ws.onclose = (event: CloseEvent) => {
      clearTimeout(timeoutId);
      if (!taskStarted && audioChunks.length === 0) {
        console.error(`❌ [CosyVoice WS] Connection closed before task started: ${event.code} ${event.reason}`);
        reject(new Error(`CosyVoice WebSocket closed (${event.code}): ${event.reason || 'No reason'}`));
      }
      // If task was finished, resolve was already called
    };
  });
}

// ============================================================================
// PATH 2: SAMBERT VIA REST API (Fallback - Reliable HTTP)
// ============================================================================

/**
 * Generate TTS using Sambert via DashScope REST API.
 * 
 * Endpoint: POST /api/v1/services/aigc/text2audio/generation
 * This is a synchronous HTTP call - returns audio directly.
 * Sambert supports Chinese voices with good quality.
 */
async function generateSambertREST(
  text: string,
  voice: string,
  apiKey: string,
  restBase: string,
  format: string = 'mp3',
  sampleRate: number = 48000,
): Promise<Uint8Array> {
  const endpoint = `${restBase}/services/aigc/text2audio/generation`;

  // Map voice shorthand to full Sambert model ID
  const sambertModel = voice.startsWith('sambert-') ? voice : `sambert-${voice}-v1`;
  const validModels = Object.keys(SAMBERT_MODELS);
  const selectedModel = validModels.includes(sambertModel) ? sambertModel : 'sambert-zhichu-v1';

  console.log(`🔊 [Sambert REST] Model: ${selectedModel}, Endpoint: ${endpoint}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'disable', // Synchronous mode
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

  // Sambert returns audio as base64 in output.audio or as URL in output.audio_url
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
// MAIN TTS GENERATION (CosyVoice → Sambert fallback)
// ============================================================================

async function generateTTS(request: TTSRequest): Promise<TTSResult> {
  const startTime = Date.now();
  const allConfigs = getAllApiConfigs();

  if (allConfigs.length === 0) {
    return {
      success: false,
      provider: 'alibaba',
      method: 'cosyvoice-websocket',
      region: 'china-beijing',
      model: 'none',
      error: 'No Alibaba API key configured (ALIBABA_CHINA_API_KEY, ALIBABA_SINGAPORE_API_KEY, or ALIBABA_API_KEY)',
      fallback: true,
    };
  }

  // Determine voice from language preset
  const langKey = request.language || 'zh-CN-female';
  const voice = request.voice || COSYVOICE_VOICES[langKey] || 'longanyang';
  const model = request.model || 'cosyvoice-v3-flash';
  const format = request.format || 'mp3';
  const sampleRate = request.sampleRate || 22050;
  const speed = request.speed || 1.0;
  const method = request.method || 'auto';

  console.log(`🎯 [Alibaba TTS] Language: ${langKey}, Voice: ${voice}, Model: ${model}, Method: ${method}`);

  // Try CosyVoice WebSocket on ALL regions (unless method=rest forced)
  if (method !== 'rest' && model in COSYVOICE_MODELS) {
    for (const config of allConfigs) {
      try {
        console.log(`🎤 [Path 1] Attempting CosyVoice WebSocket on ${config.region}...`);
        const audioData = await generateCosyVoiceWebSocket(
          request.text, voice, model, config.apiKey, config.endpoints.ws, format, sampleRate, speed
        );

        const processingTimeMs = Date.now() - startTime;
        console.log(`✅ [Path 1] CosyVoice WebSocket succeeded on ${config.region} in ${processingTimeMs}ms`);

        let binary = '';
        for (let i = 0; i < audioData.length; i++) {
          binary += String.fromCharCode(audioData[i]);
        }
        const audioBase64 = btoa(binary);

        return {
          success: true,
          provider: 'alibaba',
          method: 'cosyvoice-websocket',
          region: config.region,
          model,
          voice,
          audioUrl: `data:audio/${format};base64,${audioBase64}`,
          audioBase64,
          duration: estimateDuration(request.text),
          metadata: {
            characterCount: request.text.length,
            format,
            sampleRate,
            processingTimeMs,
            estimatedCost: model === 'cosyvoice-v3-plus' ? 0.029 * (request.text.length / 10000) : 0.014 * (request.text.length / 10000),
          },
        };
      } catch (wsError) {
        console.warn(`⚠️ [Path 1] CosyVoice WebSocket failed on ${config.region}:`, (wsError as Error).message);
      }
    }
    console.log(`🔄 All CosyVoice WebSocket attempts failed, falling back to Sambert REST...`);
  }

  // Fallback to Sambert REST
  if (method !== 'websocket') {
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

    // All Sambert REST attempts failed
    return {
      success: false,
      provider: 'alibaba',
      method: 'sambert-rest',
      region: allConfigs[0].region,
      model,
      error: 'All Alibaba TTS attempts failed across all regions (CosyVoice WS + Sambert REST)',
      fallback: true,
    };
  }

  return {
    success: false,
    provider: 'alibaba',
    method: 'cosyvoice-websocket',
    region: allConfigs[0].region,
    model,
    error: 'CosyVoice WebSocket failed and REST method was not allowed',
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
  // Sambert is Chinese-only, pick voice by gender hint
  if (langKey.includes('male') || langKey.includes('Male')) return 'sambert-zhide-v1';
  if (langKey.includes('child') || langKey.includes('Child')) return 'sambert-zhixiao-v1';
  if (langKey.includes('elder') || langKey.includes('broadcast')) return 'sambert-zhiyuan-v1';
  return 'sambert-zhichu-v1'; // Default: female
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
            cosyvoice: Object.entries(COSYVOICE_MODELS).map(([id, info]) => ({ id, ...info })),
            sambert: Object.entries(SAMBERT_MODELS).map(([id, info]) => ({ id, ...info })),
            funAudio: ['fun-audio-music', 'fun-audio-sfx', 'fun-audio-ambient'],
          },
          voicePresets: Object.keys(COSYVOICE_VOICES),
          architecture: {
            primary: 'CosyVoice via WebSocket (wss://dashscope.aliyuncs.com/api-ws/v1/inference)',
            fallback: 'Sambert via REST (/api/v1/services/aigc/text2audio/generation)',
            note: 'CosyVoice does NOT support HTTP REST. Only WebSocket/SDK per Alibaba docs.',
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
