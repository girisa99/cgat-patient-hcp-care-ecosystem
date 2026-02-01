/**
 * ALIBABA STT EDGE FUNCTION - Complete Implementation
 * 
 * Supports ALL Alibaba speech recognition models:
 * - Paraformer (Real-time & batch transcription)
 * - Paraformer-MTL (Multilingual - 50+ languages)
 * - SenseVoice (Advanced speech understanding)
 * 
 * Regional Routing:
 * - China (Beijing): dashscope.aliyuncs.com - All STT models
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Regional endpoints
const DASHSCOPE_CHINA_URL = 'https://dashscope.aliyuncs.com/api/v1';

// ============================================================================
// MODEL CONFIGURATIONS - All Available Alibaba STT Models
// ============================================================================

const STT_MODELS = {
  // Paraformer Series - Standard transcription
  'paraformer-v2': { 
    id: 'paraformer-v2', 
    endpoint: '/services/audio/asr/transcription',
    description: 'Latest Paraformer with enhanced accuracy',
    languages: ['zh', 'en', 'ja', 'ko'],
    features: ['punctuation', 'timestamps', 'diarization'],
  },
  'paraformer-realtime': { 
    id: 'paraformer-realtime-v1', 
    endpoint: '/services/audio/asr/realtime',
    description: 'Real-time streaming transcription',
    languages: ['zh', 'en'],
    features: ['streaming', 'low-latency'],
  },
  'paraformer-mtl': { 
    id: 'paraformer-mtl-v1', 
    endpoint: '/services/audio/asr/transcription',
    description: 'Multilingual (50+ languages)',
    languages: ['multilingual'],
    features: ['auto-language-detection', 'punctuation', 'timestamps'],
  },
  'paraformer-8k': { 
    id: 'paraformer-8k-v1', 
    endpoint: '/services/audio/asr/transcription',
    description: '8kHz audio (phone calls, VoIP)',
    languages: ['zh', 'en'],
    features: ['telephony', 'noise-reduction'],
  },
  
  // SenseVoice - Advanced speech understanding
  'sensevoice-large': { 
    id: 'sensevoice-large-v1', 
    endpoint: '/services/audio/asr/sensevoice',
    description: 'Large model with emotion & event detection',
    languages: ['zh', 'en', 'ja', 'ko', 'cantonese'],
    features: ['emotion', 'sound-events', 'high-accuracy'],
  },
  'sensevoice-small': { 
    id: 'sensevoice-small-v1', 
    endpoint: '/services/audio/asr/sensevoice',
    description: 'Fast & efficient transcription',
    languages: ['zh', 'en'],
    features: ['low-latency', 'cost-effective'],
  },
} as const;

type STTModelKey = keyof typeof STT_MODELS;

// Language detection hints
const LANGUAGE_HINTS: Record<string, string> = {
  'chinese': 'zh',
  'mandarin': 'zh',
  'english': 'en',
  'japanese': 'ja',
  'korean': 'ko',
  'cantonese': 'yue',
  'spanish': 'es',
  'french': 'fr',
  'german': 'de',
  'arabic': 'ar',
  'hindi': 'hi',
  'portuguese': 'pt',
  'russian': 'ru',
};

interface STTRequest {
  // Audio input (one required)
  audio?: string;              // Base64 encoded audio
  audioUrl?: string;           // URL to audio file
  
  // Model selection
  model?: STTModelKey;
  
  // Language configuration
  language?: string;           // ISO code or language name
  autoDetectLanguage?: boolean;
  
  // Audio parameters
  sampleRate?: number;         // 8000, 16000, 24000, 44100, 48000
  format?: 'wav' | 'mp3' | 'pcm' | 'ogg' | 'flac' | 'opus' | 'm4a';
  channels?: 1 | 2;
  
  // Feature flags
  enablePunctuation?: boolean;
  enableTimestamps?: boolean;
  enableWordTimestamps?: boolean;
  enableSpeakerDiarization?: boolean;
  enableEmotionDetection?: boolean;     // SenseVoice only
  enableSoundEventDetection?: boolean;  // SenseVoice only
  
  // Processing options
  maxSpeakers?: number;        // For diarization
  vocabularyHints?: string[];  // Custom vocabulary
  hotWords?: string[];         // Boost specific words
}

interface STTResult {
  success: boolean;
  provider: 'alibaba';
  region: 'china-beijing';
  model: string;
  text?: string;
  words?: Array<{
    word: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }>;
  speakers?: Array<{
    speakerId: string;
    text: string;
    startTime: number;
    endTime: number;
  }>;
  emotions?: Array<{
    emotion: string;
    confidence: number;
    startTime: number;
    endTime: number;
  }>;
  soundEvents?: Array<{
    event: string;
    confidence: number;
    startTime: number;
    endTime: number;
  }>;
  language?: string;
  confidence?: number;
  metadata?: {
    durationSeconds?: number;
    wordCount?: number;
    processingTimeMs?: number;
    estimatedCost?: number;
  };
  taskId?: string;
  error?: string;
  fallback?: boolean;
}

/**
 * Get API key (China region required for all STT)
 */
function getApiKey(): string | null {
  return Deno.env.get('ALIBABA_CHINA_API_KEY') || Deno.env.get('ALIBABA_API_KEY') || null;
}

/**
 * Poll for async task completion
 */
async function pollTaskStatus(
  taskId: string,
  apiKey: string,
  maxAttempts: number = 60,
  intervalMs: number = 2000
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  const statusUrl = `${DASHSCOPE_CHINA_URL}/tasks/${taskId}`;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    
    try {
      const response = await fetch(statusUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      
      if (!response.ok) continue;
      
      const statusData = await response.json();
      const taskStatus = statusData.output?.task_status;
      
      console.log(`📊 STT task ${taskId}: ${taskStatus} (${attempt + 1}/${maxAttempts})`);
      
      if (taskStatus === 'SUCCEEDED') {
        return { success: true, data: statusData.output };
      } else if (taskStatus === 'FAILED') {
        return { success: false, error: statusData.output?.message || 'Transcription failed' };
      }
    } catch (error) {
      console.error(`Poll attempt ${attempt + 1} failed:`, error);
    }
  }
  
  return { success: false, error: 'Transcription timed out' };
}

/**
 * Transcribe audio with Paraformer or SenseVoice
 */
async function transcribeAudio(request: STTRequest): Promise<STTResult> {
  const startTime = Date.now();
  
  const modelKey: STTModelKey = request.model || 'paraformer-v2';
  const modelConfig = STT_MODELS[modelKey];
  
  if (!modelConfig) {
    return {
      success: false,
      provider: 'alibaba',
      region: 'china-beijing',
      model: modelKey,
      error: `Invalid model. Available: ${Object.keys(STT_MODELS).join(', ')}`,
    };
  }
  
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return {
      success: false,
      provider: 'alibaba',
      region: 'china-beijing',
      model: modelKey,
      error: 'ALIBABA_CHINA_API_KEY not configured',
      fallback: true
    };
  }
  
  if (!request.audio && !request.audioUrl) {
    return {
      success: false,
      provider: 'alibaba',
      region: 'china-beijing',
      model: modelKey,
      error: 'Audio data or URL required',
    };
  }
  
  console.log(`🎙️ [Alibaba STT] Model: ${modelKey}`);
  
  // Resolve language hint
  let languageHint = request.language;
  if (languageHint && LANGUAGE_HINTS[languageHint.toLowerCase()]) {
    languageHint = LANGUAGE_HINTS[languageHint.toLowerCase()];
  }
  
  // Build payload
  const payload: Record<string, unknown> = {
    model: modelConfig.id,
    input: {},
    parameters: {
      sample_rate: request.sampleRate || 16000,
      format: request.format || 'wav',
      enable_punctuation_prediction: request.enablePunctuation !== false,
      enable_words: request.enableWordTimestamps || request.enableTimestamps || false,
      enable_speaker_diarization: request.enableSpeakerDiarization || false,
      ...(request.maxSpeakers && { max_speakers: request.maxSpeakers }),
      ...(languageHint && { language_hints: [languageHint] }),
      ...(request.vocabularyHints && { vocabulary_hints: request.vocabularyHints }),
      ...(request.hotWords && { hot_words: request.hotWords }),
    }
  };
  
  // Add audio source
  if (request.audioUrl) {
    payload.input = { file_urls: [request.audioUrl] };
  } else if (request.audio) {
    payload.input = { audio: request.audio };
  }
  
  // SenseVoice-specific features
  if (modelKey.startsWith('sensevoice')) {
    (payload.parameters as Record<string, unknown>).enable_emotion = request.enableEmotionDetection || false;
    (payload.parameters as Record<string, unknown>).enable_sound_event = request.enableSoundEventDetection || false;
  }
  
  const apiUrl = `${DASHSCOPE_CHINA_URL}${modelConfig.endpoint}`;
  console.log(`🇨🇳 Calling DashScope: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify(payload),
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`DashScope STT error (${response.status}):`, responseText);
      
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          provider: 'alibaba',
          region: 'china-beijing',
          model: modelKey,
          error: 'Authentication failed - check API key',
          fallback: true
        };
      }
      
      try {
        const errorJson = JSON.parse(responseText);
        return {
          success: false,
          provider: 'alibaba',
          region: 'china-beijing',
          model: modelKey,
          error: errorJson.message || `API error: ${response.status}`,
          fallback: true
        };
      } catch {
        return {
          success: false,
          provider: 'alibaba',
          region: 'china-beijing',
          model: modelKey,
          error: `API error: ${response.status}`,
          fallback: true
        };
      }
    }
    
    const result = JSON.parse(responseText);
    const taskId = result.output?.task_id;
    
    if (taskId) {
      // Poll for completion
      const pollResult = await pollTaskStatus(taskId, apiKey);
      
      if (!pollResult.success) {
        return {
          success: false,
          provider: 'alibaba',
          region: 'china-beijing',
          model: modelKey,
          taskId,
          error: pollResult.error,
          fallback: true
        };
      }
      
      result.output = pollResult.data;
    }
    
    // Parse transcription results
    const transcription = result.output?.results?.[0] || result.output;
    
    const text = transcription?.transcription_text || 
                 transcription?.sentences?.map((s: any) => s.text).join(' ') ||
                 transcription?.text || '';
    
    // Parse word-level timestamps
    const words = transcription?.words?.map((w: any) => ({
      word: w.text || w.word,
      startTime: (w.begin_time || w.start_time || 0) / 1000,
      endTime: (w.end_time || 0) / 1000,
      confidence: w.confidence || 0.9,
    }));
    
    // Parse speaker diarization
    const speakers = transcription?.speaker_info?.map((s: any) => ({
      speakerId: s.speaker_id || `speaker_${s.speaker}`,
      text: s.text,
      startTime: (s.begin_time || s.start_time || 0) / 1000,
      endTime: (s.end_time || 0) / 1000,
    }));
    
    // Parse emotions (SenseVoice)
    const emotions = transcription?.emotions?.map((e: any) => ({
      emotion: e.emotion || e.label,
      confidence: e.confidence || e.score,
      startTime: (e.begin_time || 0) / 1000,
      endTime: (e.end_time || 0) / 1000,
    }));
    
    // Parse sound events (SenseVoice)
    const soundEvents = transcription?.sound_events?.map((e: any) => ({
      event: e.event || e.label,
      confidence: e.confidence || e.score,
      startTime: (e.begin_time || 0) / 1000,
      endTime: (e.end_time || 0) / 1000,
    }));
    
    const processingTimeMs = Date.now() - startTime;
    const durationSeconds = transcription?.duration_ms ? transcription.duration_ms / 1000 : 0;
    
    console.log(`✅ [Alibaba STT] Transcribed ${text.length} chars in ${processingTimeMs}ms`);
    
    return {
      success: true,
      provider: 'alibaba',
      region: 'china-beijing',
      model: modelKey,
      text,
      words,
      speakers,
      emotions,
      soundEvents,
      language: transcription?.language || languageHint,
      confidence: transcription?.confidence || 0.9,
      taskId,
      metadata: {
        durationSeconds,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        processingTimeMs,
        estimatedCost: 0.001 * (durationSeconds / 60), // ~$0.001/minute
      },
    };
    
  } catch (error) {
    console.error('[Alibaba STT] Error:', error);
    return {
      success: false,
      provider: 'alibaba',
      region: 'china-beijing',
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
    const request: STTRequest = await req.json();
    
    if (!request.audio && !request.audioUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Audio data (base64) or audioUrl required',
          availableModels: Object.entries(STT_MODELS).map(([key, config]) => ({
            id: key,
            description: config.description,
            languages: config.languages,
            features: config.features,
          })),
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await transcribeAudio(request);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[Alibaba STT] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        provider: 'alibaba',
        region: 'china-beijing',
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
