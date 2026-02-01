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

// Regional endpoints
const DASHSCOPE_CHINA_URL = 'https://dashscope.aliyuncs.com/api/v1';
const DASHSCOPE_INTL_URL = 'https://dashscope-intl.aliyuncs.com/api/v1';

// ============================================================================
// MODEL CONFIGURATIONS - All Available Alibaba TTS/Audio Models
// ============================================================================

const TTS_MODELS = {
  // CosyVoice Series (China region) - High-fidelity TTS
  'cosyvoice-v2': { id: 'cosyvoice-v2', region: 'china', type: 'tts', description: 'Latest CosyVoice with enhanced quality' },
  'cosyvoice-v1': { id: 'cosyvoice-v1', region: 'china', type: 'tts', description: 'Standard CosyVoice' },
  'cosyvoice-multilingual': { id: 'cosyvoice-multilingual-v1', region: 'china', type: 'tts', description: 'Multilingual support (EN, JA, KO, etc.)' },
  'cosyvoice-clone': { id: 'cosyvoice-clone-v1', region: 'china', type: 'tts', description: 'Voice cloning from audio sample' },
  
  // Sambert Series (China region) - Classic Chinese TTS
  'sambert-zhichu': { id: 'sambert-zhichu-v1', region: 'china', type: 'tts', description: 'Chinese female voice' },
  'sambert-zhide': { id: 'sambert-zhide-v1', region: 'china', type: 'tts', description: 'Chinese male voice' },
  'sambert-zhimiao': { id: 'sambert-zhimiao-v1', region: 'china', type: 'tts', description: 'Chinese sweet female' },
  'sambert-zhiyuan': { id: 'sambert-zhiyuan-v1', region: 'china', type: 'tts', description: 'Chinese broadcasting male' },
  
  // Fun Audio Series (China region) - Music & SFX Generation
  'fun-audio-music': { id: 'fun-audio-music-v1', region: 'china', type: 'music', description: 'Text-to-music generation' },
  'fun-audio-sfx': { id: 'fun-audio-sfx-v1', region: 'china', type: 'sfx', description: 'Text-to-sound-effects' },
  'fun-audio-ambient': { id: 'fun-audio-ambient-v1', region: 'china', type: 'ambient', description: 'Ambient/background audio' },
} as const;

type TTSModelKey = keyof typeof TTS_MODELS;

// Voice presets by language for CosyVoice
const VOICE_PRESETS: Record<string, { voice: string; model: TTSModelKey }> = {
  // Chinese voices (native CosyVoice)
  'zh-CN-female': { voice: 'zhiyan', model: 'cosyvoice-v2' },
  'zh-CN-male': { voice: 'zhitian', model: 'cosyvoice-v2' },
  'zh-CN-child': { voice: 'zhitong', model: 'cosyvoice-v2' },
  'zh-CN-elder-female': { voice: 'zhimei', model: 'cosyvoice-v2' },
  'zh-CN-elder-male': { voice: 'zhida', model: 'cosyvoice-v2' },
  
  // Multilingual voices
  'en-US-female': { voice: 'jessica', model: 'cosyvoice-multilingual' },
  'en-US-male': { voice: 'michael', model: 'cosyvoice-multilingual' },
  'en-GB-female': { voice: 'emma', model: 'cosyvoice-multilingual' },
  'en-GB-male': { voice: 'james', model: 'cosyvoice-multilingual' },
  'ja-JP-female': { voice: 'yuki', model: 'cosyvoice-multilingual' },
  'ja-JP-male': { voice: 'takeshi', model: 'cosyvoice-multilingual' },
  'ko-KR-female': { voice: 'minji', model: 'cosyvoice-multilingual' },
  'ko-KR-male': { voice: 'junwoo', model: 'cosyvoice-multilingual' },
  'es-ES-female': { voice: 'carmen', model: 'cosyvoice-multilingual' },
  'fr-FR-female': { voice: 'marie', model: 'cosyvoice-multilingual' },
  'de-DE-female': { voice: 'anna', model: 'cosyvoice-multilingual' },
  'pt-BR-female': { voice: 'julia', model: 'cosyvoice-multilingual' },
  'ar-SA-male': { voice: 'ahmad', model: 'cosyvoice-multilingual' },
  'hi-IN-female': { voice: 'priya', model: 'cosyvoice-multilingual' },
};

// API endpoints per model type
const API_ENDPOINTS = {
  tts: '/services/aigc/text2audio/generation',
  music: '/services/aigc/audio-generation/music',
  sfx: '/services/aigc/audio-generation/sound-effects',
  ambient: '/services/aigc/audio-generation/ambient',
  clone: '/services/aigc/voice-clone/synthesis',
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
  baseUrl: string; 
  region: 'china-beijing' | 'international';
} {
  const modelConfig = TTS_MODELS[modelKey];
  
  if (modelConfig.region === 'china') {
    const apiKey = Deno.env.get('ALIBABA_CHINA_API_KEY') || Deno.env.get('ALIBABA_API_KEY') || null;
    return { apiKey, baseUrl: DASHSCOPE_CHINA_URL, region: 'china-beijing' };
  } else {
    const apiKey = Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('ALIBABA_CHINA_API_KEY') || null;
    return { apiKey, baseUrl: DASHSCOPE_INTL_URL, region: 'international' };
  }
}

/**
 * Generate TTS audio with CosyVoice or Sambert
 */
async function generateTTS(request: TTSRequest): Promise<TTSResult> {
  const startTime = Date.now();
  
  // Determine model and voice from language preset or explicit values
  let modelKey: TTSModelKey = request.model || 'cosyvoice-v2';
  let voice = request.voice;
  
  // Apply language preset if specified
  if (!voice && request.language && VOICE_PRESETS[request.language]) {
    const preset = VOICE_PRESETS[request.language];
    modelKey = preset.model;
    voice = preset.voice;
  }
  
  // Default voice for Chinese
  if (!voice) {
    voice = 'zhiyan';
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
  
  const { apiKey, baseUrl, region } = getApiConfig(modelKey);
  
  console.log(`🎤 [Alibaba TTS] Model: ${modelKey}, Voice: ${voice}, Region: ${region}`);
  
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
  
  // Build payload
  const payload: Record<string, unknown> = {
    model: modelConfig.id,
    input: {
      text: request.text,
    },
    parameters: {
      voice,
      format: request.format || 'mp3',
      sample_rate: request.sampleRate || 24000,
      speech_rate: request.speed ? Math.round((request.speed - 1) * 500) : 0,
      pitch_rate: request.pitch ? Math.round(request.pitch * 42) : 0,
      volume: request.volume || 50,
      ...(request.emotion && { emotion: request.emotion }),
      ...(request.style && { style: request.style }),
      ...(request.enableSSML && { enable_ssml: true }),
    }
  };
  
  // Handle voice cloning
  if (modelKey === 'cosyvoice-clone') {
    if (request.referenceAudioUrl) {
      payload.input = { ...payload.input as object, reference_audio_url: request.referenceAudioUrl };
    } else if (request.referenceAudioBase64) {
      payload.input = { ...payload.input as object, reference_audio: request.referenceAudioBase64 };
    }
  }
  
  const endpoint = API_ENDPOINTS[modelConfig.type as keyof typeof API_ENDPOINTS] || API_ENDPOINTS.tts;
  const apiUrl = `${baseUrl}${endpoint}`;
  
  console.log(`🇨🇳 Calling DashScope: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'disable',
      },
      body: JSON.stringify(payload),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
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
    
    const result = JSON.parse(responseText);
    
    // Extract audio from response
    let audioUrl = result.output?.audio_url || result.output?.audio;
    let audioBase64: string | undefined;
    
    if (result.output?.audio && !result.output.audio.startsWith('http')) {
      audioBase64 = result.output.audio;
      audioUrl = `data:audio/${request.format || 'mp3'};base64,${audioBase64}`;
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
