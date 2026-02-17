/**
 * Multi-Language Audio Orchestrator
 * Orchestrates voice generation across multiple languages with intelligent provider routing
 * 
 * Features:
 * - Language-specific provider selection (Alibaba for CJK, Azure for Arabic/Hindi, ElevenLabs for European)
 * - Parallel generation for multiple languages
 * - Automatic fallback chains
 * - Tier-based quality routing
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type GlobalTier = 1 | 2 | 3;

interface LanguageAudioRequest {
  action: 'generate_multi_language' | 'get_provider_recommendation' | 'generate_single';
  texts: Record<string, string>; // { 'en': 'Hello', 'zh': '你好', 'ja': 'こんにちは' }
  tier?: GlobalTier;
  voiceConfig?: {
    speed?: number;
    pitch?: number;
    stability?: number;
    gender?: 'male' | 'female' | 'neutral';
  };
  // Single language params
  languageCode?: string;
  text?: string;
}

interface ProviderConfig {
  id: string;
  name: string;
  apiKeyEnv: string;
  endpoint: string;
  voiceIds: Record<string, string>;
  supportedLanguages: string[];
}

// Provider configurations
const PROVIDERS: Record<string, ProviderConfig> = {
  'elevenlabs': {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    apiKeyEnv: 'ELEVENLABS_API_KEY',
    endpoint: 'https://api.elevenlabs.io/v1/text-to-speech',
    voiceIds: {
      'en': 'JBFqnCBsd6RMkjVDRZzb',
      'en-US': 'JBFqnCBsd6RMkjVDRZzb',
      'en-GB': 'ThT5KcBeYPX3keUQqHPh',
      'es': 'EXAVITQu4vr4xnSDxMaL',
      'fr': 'CwhRBWXzGAHq8TQ4Fs17',
      'de': 'EXAVITQu4vr4xnSDxMaL',
      'it': 'EXAVITQu4vr4xnSDxMaL',
      'pt': 'EXAVITQu4vr4xnSDxMaL',
      'ja': 'iP95p4xoKVk53GoZ742B',
      'ko': 'jsCqWAovK2LkecY7zXl4',
      'zh': 'XB0fDUnXU5powFXDhCwa',
    },
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'hi', 'ar', 'zh', 'ja', 'ko'],
  },
  'openai': {
    id: 'openai',
    name: 'OpenAI TTS',
    apiKeyEnv: 'OPENAI_API_KEY',
    endpoint: 'https://api.openai.com/v1/audio/speech',
    voiceIds: {
      'default': 'alloy',
      'male': 'onyx',
      'female': 'nova',
    },
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ru', 'ar', 'hi'],
  },
  'azure': {
    id: 'azure',
    name: 'Azure Neural TTS',
    apiKeyEnv: 'AZURE_SPEECH_KEY',
    endpoint: 'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1',
    voiceIds: {
      'en-US': 'en-US-JennyNeural',
      'en-GB': 'en-GB-SoniaNeural',
      'zh-CN': 'zh-CN-XiaoxiaoNeural',
      'zh-TW': 'zh-TW-HsiaoChenNeural',
      'ja': 'ja-JP-NanamiNeural',
      'ko': 'ko-KR-SunHiNeural',
      'ar': 'ar-SA-HamedNeural',
      'hi': 'hi-IN-SwaraNeural',
      'es': 'es-ES-ElviraNeural',
      'fr': 'fr-FR-DeniseNeural',
      'de': 'de-DE-KatjaNeural',
      'it': 'it-IT-ElsaNeural',
      'pt': 'pt-BR-FranciscaNeural',
      'ru': 'ru-RU-SvetlanaNeural',
    },
    supportedLanguages: ['en', 'zh', 'ja', 'ko', 'ar', 'hi', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'th', 'vi', 'id'],
  },
  'alibaba': {
    id: 'alibaba',
    name: 'Alibaba Qwen3-TTS',
    apiKeyEnv: 'ALIBABA_API_KEY',
    endpoint: 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts',
    voiceIds: {
      'zh': 'longxiaochun',
      'zh-CN': 'longxiaochun',
      'zh-TW': 'zhiyan',
      'ja': 'tomoka',
      'ko': 'xiaoyun',
      'en': 'wendy',
    },
    supportedLanguages: ['zh', 'zh-CN', 'zh-TW', 'ja', 'ko', 'en'],
  },
  'google': {
    id: 'google',
    name: 'Google Cloud TTS',
    apiKeyEnv: 'GOOGLE_API_KEY',
    endpoint: 'https://texttospeech.googleapis.com/v1/text:synthesize',
    voiceIds: {
      'en-US': 'en-US-Neural2-F',
      'en-GB': 'en-GB-Neural2-A',
      'zh-CN': 'cmn-CN-Wavenet-A',
      'ja': 'ja-JP-Neural2-B',
      'ko': 'ko-KR-Neural2-A',
      'es': 'es-ES-Neural2-A',
      'fr': 'fr-FR-Neural2-A',
      'de': 'de-DE-Neural2-A',
      'hi': 'hi-IN-Neural2-A',
      'ar': 'ar-XA-Wavenet-A',
    },
    supportedLanguages: ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'th', 'vi', 'id', 'ms'],
  },
  'aws': {
    id: 'aws',
    name: 'Amazon Polly',
    apiKeyEnv: 'AWS_ACCESS_KEY_ID',
    endpoint: 'polly', // Uses AWS SDK
    voiceIds: {
      'en-US': 'Joanna',
      'en-GB': 'Amy',
      'zh-CN': 'Zhiyu',
      'ja': 'Mizuki',
      'ko': 'Seoyeon',
      'es': 'Lucia',
      'fr': 'Celine',
      'de': 'Marlene',
      'it': 'Carla',
      'pt': 'Vitoria',
    },
    supportedLanguages: ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ar', 'hi'],
  },
};

// Language family definitions for optimal routing
const CJK_LANGUAGES = ['zh', 'zh-CN', 'zh-TW', 'ja', 'ko'];
const INDIC_LANGUAGES = ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur'];
const MIDDLE_EASTERN_LANGUAGES = ['ar', 'he', 'fa', 'tr'];
const EUROPEAN_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'pt', 'ru', 'uk', 'cs', 'sv', 'da', 'no', 'fi'];

// Get recommended provider for language
function getRecommendedProvider(languageCode: string, tier: GlobalTier): string[] {
  const lang = languageCode.split('-')[0];
  
  // CJK Languages - Alibaba/Azure preferred
  if (CJK_LANGUAGES.includes(lang) || CJK_LANGUAGES.includes(languageCode)) {
    if (tier === 3) return ['alibaba', 'azure', 'elevenlabs', 'google'];
    if (tier === 2) return ['azure', 'google', 'openai'];
    return ['google', 'aws'];
  }
  
  // Indic Languages - Azure/Google preferred
  if (INDIC_LANGUAGES.includes(lang)) {
    if (tier >= 2) return ['azure', 'google', 'elevenlabs'];
    return ['google', 'aws'];
  }
  
  // Middle Eastern Languages - Azure preferred
  if (MIDDLE_EASTERN_LANGUAGES.includes(lang)) {
    if (tier >= 2) return ['azure', 'google'];
    return ['google', 'aws'];
  }
  
  // European Languages - ElevenLabs/Azure preferred
  if (EUROPEAN_LANGUAGES.includes(lang)) {
    if (tier === 3) return ['elevenlabs', 'azure', 'openai', 'google'];
    if (tier === 2) return ['openai', 'azure', 'google'];
    return ['google', 'aws'];
  }
  
  // Default fallback chain
  if (tier === 3) return ['elevenlabs', 'azure', 'openai', 'google'];
  if (tier === 2) return ['openai', 'azure', 'google'];
  return ['google', 'aws', 'openai'];
}

// Check if provider is available (has API key)
function isProviderAvailable(providerId: string): boolean {
  const provider = PROVIDERS[providerId];
  if (!provider) return false;
  const apiKey = Deno.env.get(provider.apiKeyEnv);
  return !!apiKey && apiKey.length > 0;
}

// Get first available provider from chain
function getAvailableProvider(chain: string[]): string | null {
  for (const providerId of chain) {
    if (isProviderAvailable(providerId)) {
      return providerId;
    }
  }
  return null;
}

// Generate voice with ElevenLabs
async function generateWithElevenLabs(
  text: string,
  voiceId: string,
  options?: { speed?: number; stability?: number }
): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) throw new Error('ElevenLabs API key not configured');
  
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: options?.stability ?? 0.5,
          similarity_boost: 0.75,
          speed: options?.speed ?? 1.0,
        },
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`ElevenLabs failed: ${response.status}`);
  }
  
  return response.arrayBuffer();
}

// Generate voice with OpenAI
async function generateWithOpenAI(
  text: string,
  voiceId: string,
  options?: { speed?: number }
): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OpenAI API key not configured');
  
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input: text,
      voice: voiceId || 'alloy',
      speed: options?.speed ?? 1.0,
      response_format: 'mp3',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI failed: ${response.status}`);
  }
  
  return response.arrayBuffer();
}

// Generate voice with Azure
async function generateWithAzure(
  text: string,
  voiceName: string,
  languageCode: string
): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('AZURE_SPEECH_KEY');
  const region = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  if (!apiKey) throw new Error('Azure Speech API key not configured');
  
  const ssml = `
    <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${languageCode}'>
      <voice name='${voiceName}'>${text}</voice>
    </speak>
  `;
  
  const response = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
      },
      body: ssml,
    }
  );
  
  if (!response.ok) {
    throw new Error(`Azure failed: ${response.status}`);
  }
  
  return response.arrayBuffer();
}

// Generate voice with Google
async function generateWithGoogle(
  text: string,
  voiceName: string,
  languageCode: string
): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  if (!apiKey) throw new Error('Google API key not configured');
  
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode, name: voiceName },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Google failed: ${response.status}`);
  }
  
  const data = await response.json();
  // Google returns base64-encoded audio
  const binaryString = atob(data.audioContent);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate voice with Alibaba Qwen3-TTS
async function generateWithAlibaba(
  text: string,
  voiceId: string,
  languageCode: string
): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('ALIBABA_API_KEY');
  const appKey = Deno.env.get('ALIBABA_APP_KEY') || '';
  if (!apiKey) throw new Error('Alibaba API key not configured');
  
  // Note: Actual Alibaba implementation requires their SDK
  // This is a placeholder that falls back to another provider
  console.log(`[Alibaba] Would generate voice for ${languageCode} with voice ${voiceId}`);
  
  // Fallback to Azure for CJK if Alibaba not fully configured
  if (isProviderAvailable('azure')) {
    const azureVoice = PROVIDERS.azure.voiceIds[languageCode] || PROVIDERS.azure.voiceIds['zh-CN'];
    return generateWithAzure(text, azureVoice, languageCode);
  }
  
  throw new Error('Alibaba TTS requires full SDK integration');
}

// Main voice generation function with fallback
async function generateVoice(
  text: string,
  languageCode: string,
  tier: GlobalTier,
  options?: { speed?: number; stability?: number; gender?: string }
): Promise<{ audio: ArrayBuffer; provider: string; voiceId: string }> {
  const providerChain = getRecommendedProvider(languageCode, tier);
  const availableProvider = getAvailableProvider(providerChain);
  
  if (!availableProvider) {
    throw new Error(`No voice provider available for ${languageCode}. Configure at least one of: ${providerChain.join(', ')}`);
  }
  
  const provider = PROVIDERS[availableProvider];
  const voiceId = provider.voiceIds[languageCode] || 
                  provider.voiceIds[languageCode.split('-')[0]] || 
                  provider.voiceIds['default'] ||
                  Object.values(provider.voiceIds)[0];
  
  console.log(`[MultiLangAudio] Generating ${languageCode} with ${availableProvider}, voice: ${voiceId}`);
  
  let audio: ArrayBuffer;
  
  switch (availableProvider) {
    case 'elevenlabs':
      audio = await generateWithElevenLabs(text, voiceId, options);
      break;
    case 'openai':
      audio = await generateWithOpenAI(text, voiceId, options);
      break;
    case 'azure':
      audio = await generateWithAzure(text, voiceId, languageCode);
      break;
    case 'google':
      audio = await generateWithGoogle(text, voiceId, languageCode);
      break;
    case 'alibaba':
      audio = await generateWithAlibaba(text, voiceId, languageCode);
      break;
    default:
      throw new Error(`Unknown provider: ${availableProvider}`);
  }
  
  return { audio, provider: availableProvider, voiceId };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: LanguageAudioRequest = await req.json();
    const { action, tier = 2, voiceConfig } = body;
    
    console.log(`[MultiLangAudioOrchestrator] Action: ${action}, Tier: ${tier}`);

    // ========== GET PROVIDER RECOMMENDATIONS ==========
    if (action === 'get_provider_recommendation') {
      const { texts } = body;
      const recommendations: Record<string, { providers: string[]; available: string | null }> = {};
      
      for (const langCode of Object.keys(texts)) {
        const chain = getRecommendedProvider(langCode, tier);
        const available = getAvailableProvider(chain);
        recommendations[langCode] = { providers: chain, available };
      }
      
      return new Response(
        JSON.stringify({ recommendations, tier }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========== GENERATE SINGLE LANGUAGE ==========
    if (action === 'generate_single') {
      const { text, languageCode } = body;
      
      if (!text || !languageCode) {
        throw new Error('text and languageCode are required');
      }
      
      const result = await generateVoice(text, languageCode, tier, voiceConfig);
      
      return new Response(result.audio, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'audio/mpeg',
          'X-Provider': result.provider,
          'X-Voice-Id': result.voiceId,
        },
      });
    }

    // ========== GENERATE MULTI-LANGUAGE (PARALLEL) ==========
    if (action === 'generate_multi_language') {
      const { texts } = body;
      
      if (!texts || Object.keys(texts).length === 0) {
        throw new Error('texts object with language codes is required');
      }
      
      const languages = Object.keys(texts);
      console.log(`[MultiLang] Generating ${languages.length} languages: ${languages.join(', ')}`);
      
      // Generate all languages in parallel
      const results = await Promise.allSettled(
        languages.map(async (langCode) => {
          const text = texts[langCode];
          if (!text || text.trim().length === 0) {
            return { langCode, success: false, error: 'Empty text' };
          }
          
          try {
            const result = await generateVoice(text, langCode, tier, voiceConfig);
            // Convert ArrayBuffer to base64 for JSON response
            const bytes = new Uint8Array(result.audio);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64Audio = btoa(binary);
            
            return {
              langCode,
              success: true,
              provider: result.provider,
              voiceId: result.voiceId,
              audioBase64: base64Audio,
              audioSize: result.audio.byteLength,
            };
          } catch (error: any) {
            console.error(`[MultiLang] Failed ${langCode}:`, error.message);
            return { langCode, success: false, error: error.message };
          }
        })
      );
      
      // Compile results
      const output: Record<string, any> = {};
      let successCount = 0;
      let failCount = 0;
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const data = result.value;
          output[data.langCode] = data;
          if (data.success) successCount++;
          else failCount++;
        } else {
          failCount++;
        }
      }
      
      return new Response(
        JSON.stringify({
          success: successCount > 0,
          generated: successCount,
          failed: failCount,
          total: languages.length,
          results: output,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: any) {
    console.error('[MultiLangAudioOrchestrator] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
