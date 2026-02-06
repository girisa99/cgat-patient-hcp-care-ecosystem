/**
 * Multi-Provider TTS Edge Function
 * 
 * Regional routing for text-to-speech generation:
 * - ElevenLabs: Western/EU (Claude Zone) - Primary for premium voices
 * - OpenAI: Fallback with good quality
 * - Azure: Enterprise/multilingual support
 * - Google: Wide language coverage
 * - Alibaba: CJK zone (Qwen Zone)
 * 
 * Features:
 * - Smart text chunking for long content (handles 4096 char limits)
 * - Request stitching for smooth transitions between chunks
 * - Multi-provider fallback chain
 * - Background processing with EdgeRuntime.waitUntil() for long content
 * - Job-based polling to avoid WORKER_LIMIT errors
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Initialize Supabase client for job tracking
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Threshold for background processing (chars) - content above this uses job-based async
const BACKGROUND_THRESHOLD = 3000;

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

const MENA_REGIONS = ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'LB', 'IQ', 'MA', 'TN', 'DZ'];

const GEMINI_REGIONS = [
  'IN', 'PK', 'BD', 'LK', 'NP', 'BT',
  'ID', 'VN', 'TH', 'PH', 'MY', 'MM', 'KH', 'LA',
  'NG', 'KE', 'GH', 'ET', 'TZ', 'UG', 'ZW', 'ZM', 'RW', 'SN', 'CI'
];

type TTSProvider = 'elevenlabs' | 'openai' | 'azure' | 'google' | 'alibaba';

interface TTSRequest {
  text: string;
  languageCode?: string;
  region?: string;
  provider?: TTSProvider;
  tier?: 'standard' | 'advanced' | 'premium';
  voice?: string;
  speed?: number;
  pitch?: number;
  jobId?: string; // For polling job status
}

interface TTSRouting {
  provider: TTSProvider;
  cost: number;
  zone: string;
  quality: 'standard' | 'premium';
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT CHUNKING FOR LONG CONTENT
// ═══════════════════════════════════════════════════════════════════════════════

const OPENAI_MAX_CHARS = 3800; // Leave buffer below 4096 limit
const ELEVENLABS_MAX_CHARS = 4800; // ElevenLabs limit ~5000
const GOOGLE_MAX_CHARS = 4800; // Google limit ~5000
const AZURE_MAX_CHARS = 4000; // Azure SSML limit

/**
 * Smart text chunking that preserves sentence boundaries
 * Handles multiple scripts: Latin, Devanagari (Hindi), Telugu, Arabic, CJK
 */
function chunkTextBySentences(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  
  const chunks: string[] = [];
  // Split on sentence endings for multiple scripts:
  // - Latin: . ! ?
  // - Hindi/Devanagari: । (Devanagari Danda)
  // - Telugu: ।
  // - Chinese/Japanese: 。！？
  // - Arabic: ؟
  const sentences = text.split(/(?<=[.!?।॥。！？؟])\s*/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const testLength = currentChunk ? currentChunk.length + 1 + sentence.length : sentence.length;
    
    if (testLength > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      
      // Handle very long sentences by word splitting
      if (sentence.length > maxChars) {
        const words = sentence.split(/\s+/);
        let wordChunk = '';
        for (const word of words) {
          const wordTestLength = wordChunk ? wordChunk.length + 1 + word.length : word.length;
          if (wordTestLength > maxChars) {
            if (wordChunk) chunks.push(wordChunk.trim());
            // If single word exceeds limit, force split by characters
            if (word.length > maxChars) {
              for (let i = 0; i < word.length; i += maxChars) {
                chunks.push(word.slice(i, i + maxChars));
              }
              wordChunk = '';
            } else {
              wordChunk = word;
            }
          } else {
            wordChunk = wordChunk ? wordChunk + ' ' + word : word;
          }
        }
        currentChunk = wordChunk;
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
    }
  }
  
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  
  console.log(`📝 Chunked ${text.length} chars into ${chunks.length} chunks`);
  return chunks;
}

/**
 * Stream-friendly base64 encoding for large buffers
 * Encodes chunk by chunk to avoid memory spikes
 */
function encodeBase64Chunked(buffer: ArrayBuffer, chunkSize = 1024 * 1024): string {
  const bytes = new Uint8Array(buffer);
  const totalSize = bytes.length;
  
  if (totalSize < chunkSize) {
    return base64Encode(bytes);
  }
  
  // For large buffers, encode in chunks to avoid memory issues
  const chunks: string[] = [];
  for (let i = 0; i < totalSize; i += chunkSize) {
    const slice = bytes.slice(i, Math.min(i + chunkSize, totalSize));
    chunks.push(base64Encode(slice));
  }
  
  console.log(`📦 Encoded ${totalSize} bytes in ${chunks.length} chunks`);
  return chunks.join('');
}

/**
 * Concatenate multiple audio buffers with memory limits
 * Uses streaming approach to avoid hitting memory limits
 * Max total size: 8MB to stay within Edge Function memory limits
 */
const MAX_AUDIO_SIZE = 8 * 1024 * 1024; // 8MB limit

async function concatenateAudioBuffers(buffers: ArrayBuffer[]): Promise<ArrayBuffer> {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
  
  // Check if we're within memory limits
  if (totalLength > MAX_AUDIO_SIZE) {
    console.warn(`⚠️ Audio too large (${(totalLength / 1024 / 1024).toFixed(2)}MB), truncating to first ${MAX_AUDIO_SIZE / 1024 / 1024}MB`);
    
    // Take only as many buffers as fit within limit
    let currentSize = 0;
    const limitedBuffers: ArrayBuffer[] = [];
    for (const buffer of buffers) {
      if (currentSize + buffer.byteLength > MAX_AUDIO_SIZE) break;
      limitedBuffers.push(buffer);
      currentSize += buffer.byteLength;
    }
    
    const result = new Uint8Array(currentSize);
    let offset = 0;
    for (const buffer of limitedBuffers) {
      result.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }
    console.log(`🔗 Concatenated ${limitedBuffers.length}/${buffers.length} audio buffers: ${currentSize} bytes`);
    return result.buffer;
  }
  
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  
  console.log(`🔗 Concatenated ${buffers.length} audio buffers: ${totalLength} bytes`);
  return result.buffer;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SMART REGIONAL ROUTING
// ═══════════════════════════════════════════════════════════════════════════════

function getAvailableProviders(): { id: TTSProvider; available: boolean; priority: number }[] {
  // Priority order: ElevenLabs (Western) -> Azure (multilingual) -> Alibaba (CJK) -> Google
  // NOTE: OpenAI TTS removed from production - use ElevenLabs/Azure/Alibaba/Google per 4-zone strategy
  return [
    { id: 'elevenlabs', available: !!Deno.env.get('ELEVENLABS_API_KEY'), priority: 1 },
    { id: 'azure', available: !!Deno.env.get('AZURE_SPEECH_KEY'), priority: 2 },
    { id: 'alibaba', available: !!(Deno.env.get('ALIBABA_CHINA_API_KEY') || Deno.env.get('ALIBABA_API_KEY')), priority: 3 },
    { id: 'google', available: !!(Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY')), priority: 4 },
    // OpenAI intentionally excluded - not part of 4-zone TTS routing strategy
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANGUAGE ZONE DEFINITIONS (4-Zone Architecture)
// ═══════════════════════════════════════════════════════════════════════════════

// GEMINI ZONE - India/South Asia/SEA/Africa: Azure Neural PRIMARY (Viseme support)
const GEMINI_LANGUAGES = [
  // South Asian
  'hi', 'hi-IN', 'bn', 'bn-BD', 'bn-IN', 'te', 'te-IN', 'ta', 'ta-IN', 
  'mr', 'mr-IN', 'gu', 'gu-IN', 'kn', 'kn-IN', 'ml', 'ml-IN', 'pa', 'pa-IN',
  'ur', 'ur-PK', 'ur-IN', // Urdu (Pakistan/India)
  // Southeast Asian
  'id', 'id-ID', 'ms', 'ms-MY', 'th', 'th-TH', 'vi', 'vi-VN', 'fil', 'fil-PH',
  // African
  'sw', 'sw-KE', 'sw-TZ', 'yo', 'yo-NG', 'am', 'am-ET', 'zu', 'zu-ZA',
  'af', 'af-ZA', 'ha', 'ig', 'xh',
];

// ALIBABA ZONE - CJK: Alibaba CosyVoice PRIMARY
const CJK_LANGUAGES = ['ja', 'ja-JP', 'ko', 'ko-KR', 'zh', 'zh-CN', 'zh-TW', 'zh-HK', 'zh-SG'];

// MENA ZONE - Arabic (7 dialects): Azure Neural PRIMARY
const ARABIC_LANGUAGES = [
  'ar', 'ar-SA', 'ar-AE', 'ar-EG', 'ar-MA', 'ar-JO', 'ar-IQ', 'ar-KW',
  'ar-QA', 'ar-BH', 'ar-OM', 'ar-YE', 'ar-LB', 'ar-SY', 'ar-TN', 'ar-DZ',
];

// CLAUDE ZONE - Western/EU: ElevenLabs PRIMARY
const WESTERN_LANGUAGES = [
  'en', 'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-NZ', 'en-ZA', 'en-IE',
  'de', 'de-DE', 'de-AT', 'de-CH',
  'fr', 'fr-FR', 'fr-CA', 'fr-BE', 'fr-CH',
  'es', 'es-ES', 'es-MX', 'es-AR', 'es-CO', 'es-CL', 'es-VE',
  'it', 'it-IT',
  'pt', 'pt-BR', 'pt-PT',
  'nl', 'nl-NL', 'nl-BE',
  'pl', 'pl-PL',
  'ru', 'ru-RU',
  'tr', 'tr-TR',
  'cs', 'cs-CZ',
  'da', 'da-DK',
  'fi', 'fi-FI',
  'el', 'el-GR',
  'hu', 'hu-HU',
  'no', 'nb', 'nb-NO',
  'ro', 'ro-RO',
  'sk', 'sk-SK',
  'sv', 'sv-SE',
  'uk', 'uk-UA',
];

function selectTTSProvider(region: string, languageCode: string, tier: string = 'standard'): TTSRouting {
  const providers = getAvailableProviders().filter(p => p.available);
  
  if (providers.length === 0) {
    throw new Error('No TTS API keys configured. Please add AZURE_SPEECH_KEY, ALIBABA_API_KEY, ELEVENLABS_API_KEY, GOOGLE_API_KEY, or OPENAI_API_KEY.');
  }
  
  const hasProvider = (id: TTSProvider) => providers.some(p => p.id === id);
  const langBase = languageCode.split('-')[0]; // Extract base language (e.g., 'hi' from 'hi-IN')
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // ZONE-BASED ROUTING (Per Architecture Document)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // GEMINI ZONE (India/SEA/Africa): Azure Neural PRIMARY - best Viseme support for these regions
  if (GEMINI_LANGUAGES.includes(languageCode) || GEMINI_LANGUAGES.includes(langBase)) {
    if (hasProvider('azure')) {
      console.log(`🌏 Gemini Zone: Routing to Azure Neural TTS [${languageCode}]`);
      return { provider: 'azure', cost: 0.016, zone: 'gemini', quality: 'premium' };
    }
    if (hasProvider('google')) {
      console.log(`🌏 Gemini Zone fallback: Routing to Google TTS [${languageCode}]`);
      return { provider: 'google', cost: 0.016, zone: 'gemini', quality: 'standard' };
    }
  }

  // ALIBABA ZONE (CJK): Alibaba CosyVoice PRIMARY
  if (CJK_LANGUAGES.includes(languageCode) || CJK_LANGUAGES.includes(langBase)) {
    if (hasProvider('alibaba')) {
      console.log(`🌸 Alibaba Zone (CJK): Routing to Alibaba CosyVoice [${languageCode}]`);
      return { provider: 'alibaba', cost: 0.004, zone: 'alibaba', quality: 'premium' };
    }
    if (hasProvider('azure')) {
      console.log(`🌸 Alibaba Zone (CJK) fallback: Routing to Azure Neural [${languageCode}]`);
      return { provider: 'azure', cost: 0.016, zone: 'alibaba', quality: 'premium' };
    }
  }

  // MENA ZONE (Arabic): Azure Neural PRIMARY (7 dialects support)
  if (ARABIC_LANGUAGES.includes(languageCode) || langBase === 'ar') {
    if (hasProvider('azure')) {
      console.log(`🌍 MENA Zone (Arabic): Routing to Azure Neural TTS [${languageCode}]`);
      return { provider: 'azure', cost: 0.016, zone: 'mena', quality: 'premium' };
    }
    if (hasProvider('google')) {
      console.log(`🌍 MENA Zone (Arabic) fallback: Routing to Google TTS [${languageCode}]`);
      return { provider: 'google', cost: 0.016, zone: 'mena', quality: 'standard' };
    }
  }

  // CLAUDE ZONE (Western/EU): ElevenLabs PRIMARY
  if (WESTERN_LANGUAGES.includes(languageCode) || WESTERN_LANGUAGES.includes(langBase)) {
    if (tier === 'premium' && hasProvider('elevenlabs')) {
      console.log(`🎤 Claude Zone (Premium): Routing to ElevenLabs [${languageCode}]`);
      return { provider: 'elevenlabs', cost: 0.03, zone: 'claude', quality: 'premium' };
    }
    if (hasProvider('elevenlabs')) {
      console.log(`🎤 Claude Zone (Western): Routing to ElevenLabs [${languageCode}]`);
      return { provider: 'elevenlabs', cost: 0.018, zone: 'claude', quality: 'premium' };
    }
    if (hasProvider('azure')) {
      console.log(`🎤 Claude Zone (Western) fallback: Routing to Azure Neural [${languageCode}]`);
      return { provider: 'azure', cost: 0.016, zone: 'claude', quality: 'premium' };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // FALLBACK CHAIN: ElevenLabs -> Azure -> Alibaba -> Google (4-Zone strategy)
  // NOTE: OpenAI TTS intentionally excluded from production routing
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log(`🔊 Unknown language [${languageCode}], using fallback chain`);
  
  if (hasProvider('elevenlabs')) {
    console.log(`🔊 Fallback: Routing to ElevenLabs (Premium Western voices)`);
    return { provider: 'elevenlabs', cost: 0.018, zone: 'fallback', quality: 'premium' };
  }
  if (hasProvider('azure')) {
    console.log(`🔊 Fallback: Routing to Azure Neural TTS (Multilingual)`);
    return { provider: 'azure', cost: 0.016, zone: 'fallback', quality: 'premium' };
  }
  if (hasProvider('alibaba')) {
    console.log(`🔊 Fallback: Routing to Alibaba CosyVoice (CJK)`);
    return { provider: 'alibaba', cost: 0.004, zone: 'fallback', quality: 'standard' };
  }
  if (hasProvider('google')) {
    console.log(`🔊 Fallback: Routing to Google TTS`);
    return { provider: 'google', cost: 0.016, zone: 'fallback', quality: 'standard' };
  }

  throw new Error('No TTS providers available. Configure ELEVENLABS_API_KEY, AZURE_SPEECH_KEY, ALIBABA_API_KEY, or GOOGLE_API_KEY.');
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function generateElevenLabsTTS(text: string, voice?: string, speed?: number): Promise<ArrayBuffer> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  if (!ELEVENLABS_API_KEY) throw new Error('ElevenLabs API key not configured');

  const voiceId = voice || 'JBFqnCBsd6RMkjVDRZzb'; // George
  
  // Use smaller chunk size to reduce per-chunk memory
  const effectiveChunkSize = Math.min(ELEVENLABS_MAX_CHARS, 3000);
  const chunks = chunkTextBySentences(text, effectiveChunkSize);
  console.log(`🎤 ElevenLabs: Processing ${chunks.length} chunk(s), total ${text.length} chars`);
  
  // For very long content (>5 chunks), process sequentially and limit total
  const maxChunks = 10; // Limit to ~30k chars to stay within memory
  const processChunks = chunks.slice(0, maxChunks);
  
  if (chunks.length > maxChunks) {
    console.warn(`⚠️ Text too long, processing first ${maxChunks} of ${chunks.length} chunks`);
  }
  
  const audioBuffers: ArrayBuffer[] = [];
  
  for (let i = 0; i < processChunks.length; i++) {
    const chunk = processChunks[i];
    console.log(`🎤 ElevenLabs chunk ${i + 1}/${processChunks.length}: ${chunk.length} chars`);
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: chunk,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          speed: speed || 1.0,
        },
        // Request stitching for smooth transitions (using shorter context to save memory)
        ...(i > 0 && { previous_text: processChunks[i - 1].slice(-100) }),
        ...(i < processChunks.length - 1 && { next_text: processChunks[i + 1].slice(0, 100) }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs TTS error: ${error}`);
    }

    const buffer = await response.arrayBuffer();
    audioBuffers.push(buffer);
    
    // Check accumulated size to prevent memory overflow
    const currentTotal = audioBuffers.reduce((sum, b) => sum + b.byteLength, 0);
    if (currentTotal > MAX_AUDIO_SIZE * 0.9) {
      console.warn(`⚠️ Approaching memory limit at chunk ${i + 1}, stopping early`);
      break;
    }
  }
  
  return processChunks.length === 1 ? audioBuffers[0] : await concatenateAudioBuffers(audioBuffers);
}

async function generateOpenAITTS(text: string, voice?: string, speed?: number): Promise<ArrayBuffer> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  const selectedVoice = validVoices.includes(voice || '') ? voice : 'alloy';

  // Chunk long text to avoid 4096 char limit
  const chunks = chunkTextBySentences(text, OPENAI_MAX_CHARS);
  console.log(`🔊 OpenAI: Processing ${chunks.length} chunk(s), total ${text.length} chars`);
  
  const audioBuffers: ArrayBuffer[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`🔊 OpenAI chunk ${i + 1}/${chunks.length}: ${chunk.length} chars`);
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: chunk,
        voice: selectedVoice,
        speed: speed || 1.0,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI TTS error (chunk ${i + 1}): ${error}`);
    }

    audioBuffers.push(await response.arrayBuffer());
  }
  
  return chunks.length === 1 ? audioBuffers[0] : await concatenateAudioBuffers(audioBuffers);
}

async function generateAzureTTS(text: string, languageCode?: string, voice?: string): Promise<ArrayBuffer> {
  const AZURE_SPEECH_KEY = Deno.env.get('AZURE_SPEECH_KEY');
  const AZURE_SPEECH_REGION = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  if (!AZURE_SPEECH_KEY) throw new Error('Azure Speech key not configured');

  // ═══════════════════════════════════════════════════════════════════════════════
  // LANGUAGE CODE NORMALIZATION
  // Map short codes (hi, ar, te) to full locale codes (hi-IN, ar-SA, te-IN)
  // This ensures Indian languages get proper Azure Neural voices, not English fallback
  // ═══════════════════════════════════════════════════════════════════════════════
  const localeNormalization: Record<string, string> = {
    // Indian languages - map to full IN locale
    'hi': 'hi-IN',
    'te': 'te-IN', 
    'ta': 'ta-IN',
    'bn': 'bn-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    // Arabic dialects
    'ar': 'ar-SA',
    // CJK
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    // European
    'en': 'en-US',
    'de': 'de-DE',
    'fr': 'fr-FR',
    'es': 'es-ES',
    'pt': 'pt-BR',
    'it': 'it-IT',
    // SEA
    'id': 'id-ID',
    'vi': 'vi-VN',
    'th': 'th-TH',
    'ms': 'ms-MY',
    'fil': 'fil-PH',
  };

  // Normalize language code
  const inputLang = languageCode || 'en-US';
  const normalizedLang = localeNormalization[inputLang] || inputLang;
  
  console.log(`🌐 Azure TTS: Input lang "${inputLang}" → Normalized "${normalizedLang}"`);

  // Comprehensive voice mapping for Indic and global languages
  const voiceMap: Record<string, string> = {
    'en-US': 'en-US-JennyNeural',
    'en-GB': 'en-GB-SoniaNeural',
    'en-AU': 'en-AU-NatashaNeural',
    // Arabic dialects - 7 variants
    'ar-SA': 'ar-SA-HamedNeural',
    'ar-AE': 'ar-AE-FatimaNeural',
    'ar-EG': 'ar-EG-SalmaNeural',
    'ar-JO': 'ar-JO-SanaNeural',
    'ar-KW': 'ar-KW-NouraNeural',
    'ar-MA': 'ar-MA-MounaNeural',
    'ar-QA': 'ar-QA-AmalNeural',
    // European
    'de-DE': 'de-DE-KatjaNeural',
    'fr-FR': 'fr-FR-DeniseNeural',
    'fr-CA': 'fr-CA-SylvieNeural',
    'es-ES': 'es-ES-ElviraNeural',
    'es-MX': 'es-MX-DaliaNeural',
    'it-IT': 'it-IT-ElsaNeural',
    'pt-BR': 'pt-BR-FranciscaNeural',
    'pt-PT': 'pt-PT-RaquelNeural',
    // CJK
    'zh-CN': 'zh-CN-XiaoxiaoNeural',
    'zh-TW': 'zh-TW-HsiaoChenNeural',
    'ja-JP': 'ja-JP-NanamiNeural',
    'ko-KR': 'ko-KR-SunHiNeural',
    // ═══════════════════════════════════════════════════════════════════════════════
    // INDIAN LANGUAGES - Full neural voice support (22 languages)
    // These are the NATIVE Indian voices - NOT English!
    // ═══════════════════════════════════════════════════════════════════════════════
    'hi-IN': 'hi-IN-SwaraNeural',      // Hindi - Swara (warm, natural)
    'te-IN': 'te-IN-ShrutiNeural',     // Telugu - Shruti
    'ta-IN': 'ta-IN-PallaviNeural',    // Tamil - Pallavi  
    'bn-IN': 'bn-IN-TanishaaNeural',   // Bengali - Tanishaa
    'mr-IN': 'mr-IN-AarohiNeural',     // Marathi - Aarohi
    'gu-IN': 'gu-IN-DhwaniNeural',     // Gujarati - Dhwani
    'kn-IN': 'kn-IN-SapnaNeural',      // Kannada - Sapna
    'ml-IN': 'ml-IN-SobhanaNeural',    // Malayalam - Sobhana
    'pa-IN': 'pa-IN-VaaniNeural',      // Punjabi - Vaani
    'or-IN': 'or-IN-SubhasiniNeural',  // Odia - Subhasini
    'as-IN': 'as-IN-PriyomNeural',     // Assamese - Priyom
    // SEA languages
    'id-ID': 'id-ID-GadisNeural',
    'vi-VN': 'vi-VN-HoaiMyNeural',
    'th-TH': 'th-TH-PremwadeeNeural',
    'ms-MY': 'ms-MY-YasminNeural',
    'fil-PH': 'fil-PH-BlessicaNeural',
    // African languages
    'sw-KE': 'sw-KE-ZuriNeural',       // Swahili (Kenya)
    'sw-TZ': 'sw-TZ-RehemaNeural',     // Swahili (Tanzania)
    'am-ET': 'am-ET-MekdesNeural',     // Amharic (Ethiopia)
    'zu-ZA': 'zu-ZA-ThandoNeural',     // Zulu (South Africa)
  };
  
  const selectedVoice = voice || voiceMap[normalizedLang] || voiceMap['en-US'];
  
  console.log(`🎤 Azure TTS: Using voice "${selectedVoice}" for language "${normalizedLang}"`);
  
  // Use normalized language for SSML
  const lang = normalizedLang;

  // Chunk long text for Azure SSML limit
  const chunks = chunkTextBySentences(text, AZURE_MAX_CHARS);
  console.log(`☁️ Azure: Processing ${chunks.length} chunk(s), total ${text.length} chars`);

  const audioBuffers: ArrayBuffer[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`☁️ Azure chunk ${i + 1}/${chunks.length}: ${chunk.length} chars`);

    // Escape XML special characters in the text
    const escapedText = chunk
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const ssml = `<speak version='1.0' xml:lang='${lang}'><voice name='${selectedVoice}'>${escapedText}</voice></speak>`;

    const response = await fetch(
      `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: ssml,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Azure TTS error: ${error}`);
    }

    audioBuffers.push(await response.arrayBuffer());
  }

  return chunks.length === 1 ? audioBuffers[0] : await concatenateAudioBuffers(audioBuffers);
}

async function generateGoogleTTS(text: string, languageCode?: string, voice?: string): Promise<ArrayBuffer> {
  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!GOOGLE_API_KEY) throw new Error('Google API key not configured');

  const lang = languageCode || 'en-US';
  const selectedVoice = voice || `${lang}-Neural2-D`;

  // Chunk if needed
  const chunks = chunkTextBySentences(text, GOOGLE_MAX_CHARS);
  console.log(`🌐 Google: Processing ${chunks.length} chunk(s), total ${text.length} chars`);
  
  const audioBuffers: ArrayBuffer[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`🌐 Google chunk ${i + 1}/${chunks.length}: ${chunk.length} chars`);
    
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: chunk },
          voice: { languageCode: lang, name: selectedVoice },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google TTS error: ${error}`);
    }

    const data = await response.json();
    
    if (!data.audioContent) {
      throw new Error('No audio content returned from Google TTS');
    }

    // Google returns base64, decode it
    const binaryString = atob(data.audioContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let j = 0; j < binaryString.length; j++) {
      bytes[j] = binaryString.charCodeAt(j);
    }
    
    audioBuffers.push(bytes.buffer);
  }
  
  return chunks.length === 1 ? audioBuffers[0] : await concatenateAudioBuffers(audioBuffers);
}

async function generateAlibabaTTS(text: string, languageCode?: string, voice?: string): Promise<ArrayBuffer> {
  // CosyVoice requires API key - try both China and International
  const ALIBABA_CHINA_KEY = Deno.env.get('ALIBABA_CHINA_API_KEY');
  const ALIBABA_INTL_KEY = Deno.env.get('ALIBABA_API_KEY');
  
  const apiKey = ALIBABA_CHINA_KEY || ALIBABA_INTL_KEY;
  if (!apiKey) throw new Error('Alibaba API key not configured');
  
  // Use OpenAI-compatible endpoint for CosyVoice speech synthesis
  // China key → Beijing endpoint, International key → Virginia endpoint
  const baseUrl = ALIBABA_CHINA_KEY 
    ? 'https://dashscope.aliyuncs.com'
    : 'https://dashscope-intl.aliyuncs.com';
  const endpoint = `${baseUrl}/compatible-mode/v1/audio/speech`;
  
  // Voice selection based on language - CosyVoice v2 voices
  const voiceMap: Record<string, string> = {
    'zh': 'longxiaochun',      // Chinese female
    'zh-CN': 'longxiaochun',
    'zh-TW': 'longxiaochun',
    'ja': 'longyue',           // Japanese
    'ja-JP': 'longyue',
    'ko': 'longyue',           // Korean
    'ko-KR': 'longyue',
    'en': 'loongstella',       // English female
    'en-US': 'loongstella',
    'en-GB': 'loongstella',
  };
  
  const langBase = (languageCode || 'zh').split('-')[0];
  const selectedVoice = voice || voiceMap[languageCode || 'zh'] || voiceMap[langBase] || 'loongstella';
  
  console.log(`🌸 Alibaba CosyVoice: Using voice "${selectedVoice}" for language "${languageCode}", endpoint: ${baseUrl}, key type: ${ALIBABA_CHINA_KEY ? 'China' : 'International'}`);

  // Use OpenAI-compatible API format (returns audio binary directly)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'cosyvoice-v1',
      input: text,
      voice: selectedVoice,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Alibaba CosyVoice error (${response.status}):`, errorText);
    
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Alibaba CosyVoice authentication failed (${response.status}). Check API key and account status.`);
    }
    throw new Error(`Alibaba TTS error (${response.status}): ${errorText}`);
  }

  // OpenAI-compatible endpoint returns audio binary directly
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('audio') || contentType.includes('octet-stream')) {
    const audioBuffer = await response.arrayBuffer();
    console.log(`✅ Alibaba CosyVoice: Generated ${audioBuffer.byteLength} bytes audio (binary response)`);
    return audioBuffer;
  }
  
  // Fallback: try parsing as JSON (legacy format)
  const result = await response.json();
  
  if (result.output?.audio) {
    const binaryString = atob(result.output.audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    console.log(`✅ Alibaba CosyVoice: Generated ${bytes.length} bytes audio (JSON response)`);
    return bytes.buffer;
  }
  
  if (result.output?.audio_url) {
    console.log(`⬇️ Alibaba CosyVoice: Downloading from ${result.output.audio_url}`);
    const audioResponse = await fetch(result.output.audio_url);
    if (!audioResponse.ok) throw new Error('Failed to download Alibaba audio');
    return await audioResponse.arrayBuffer();
  }

  console.error('Alibaba response:', JSON.stringify(result));
  throw new Error('No audio returned from Alibaba TTS');
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUND TTS PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

interface TTSJob {
  id: string;
  status: 'processing' | 'complete' | 'failed';
  progress: number;
  audioContent?: string;
  audioUrl?: string;
  provider?: string;
  zone?: string;
  quality?: string;
  cost?: number;
  charCount?: number;
  error?: string;
}

/**
 * Process TTS in background and store result in tts_jobs table
 */
async function processTTSBackground(
  jobId: string, 
  request: TTSRequest, 
  routing: TTSRouting,
  providers: { id: TTSProvider; available: boolean; priority: number }[]
) {
  try {
    const generateWithProvider = async (provider: TTSProvider): Promise<ArrayBuffer> => {
      switch (provider) {
        case 'elevenlabs':
          return await generateElevenLabsTTS(request.text, request.voice, request.speed);
        case 'openai':
          return await generateOpenAITTS(request.text, request.voice, request.speed);
        case 'azure':
          return await generateAzureTTS(request.text, request.languageCode || 'en-US', request.voice);
        case 'google':
          return await generateGoogleTTS(request.text, request.languageCode || 'en-US', request.voice);
        case 'alibaba':
          return await generateAlibabaTTS(request.text, request.languageCode || 'en-US', request.voice);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    };

    // Update progress
    await supabase.from('tts_jobs').update({ progress: 10 }).eq('id', jobId);

    let audioBuffer: ArrayBuffer;
    let finalProvider = routing.provider;
    let finalZone = routing.zone;
    
    try {
      audioBuffer = await generateWithProvider(routing.provider);
      await supabase.from('tts_jobs').update({ progress: 70 }).eq('id', jobId);
    } catch (primaryError) {
      console.warn(`⚠️ Background: Primary provider ${routing.provider} failed:`, (primaryError as Error).message);
      
      // Build fallback chain
      let fallbackChain: TTSProvider[];
      if (routing.zone === 'gemini') {
        fallbackChain = ['azure', 'alibaba', 'google', 'elevenlabs', 'openai'];
      } else if (routing.zone === 'alibaba') {
        fallbackChain = ['alibaba', 'azure', 'elevenlabs', 'openai', 'google'];
      } else if (routing.zone === 'azure') {
        fallbackChain = ['azure', 'google', 'alibaba', 'elevenlabs', 'openai'];
      } else {
        fallbackChain = ['elevenlabs', 'openai', 'azure', 'google'];
      }
      
      const availableProviderIds = providers.filter(p => p.available).map(p => p.id);
      const remainingProviders = fallbackChain.filter(
        p => p !== routing.provider && availableProviderIds.includes(p)
      );
      
      let lastError: Error = primaryError as Error;
      let fallbackSucceeded = false;
      
      for (const fallbackProvider of remainingProviders) {
        try {
          console.log(`🔄 Background fallback: ${fallbackProvider}`);
          audioBuffer = await generateWithProvider(fallbackProvider);
          finalProvider = fallbackProvider;
          finalZone = 'fallback';
          fallbackSucceeded = true;
          break;
        } catch (fallbackError) {
          lastError = fallbackError as Error;
        }
      }
      
      if (!fallbackSucceeded) {
        throw lastError;
      }
    }

    await supabase.from('tts_jobs').update({ progress: 90 }).eq('id', jobId);

    // Encode to base64 - use smaller chunks to avoid memory issues
    const base64Audio = encodeBase64Chunked(audioBuffer, 512 * 1024);
    
    // Update job as complete
    await supabase.from('tts_jobs').update({
      status: 'complete',
      progress: 100,
      audio_content: base64Audio,
      audio_url: `data:audio/mpeg;base64,${base64Audio}`,
      provider: finalProvider,
      zone: finalZone,
      quality: routing.quality,
      cost: routing.cost,
      char_count: request.text.length
    }).eq('id', jobId);

    console.log(`✅ Background TTS complete: job ${jobId}, ${base64Audio.length} chars base64`);

  } catch (error) {
    console.error(`❌ Background TTS failed: job ${jobId}`, error);
    await supabase.from('tts_jobs').update({
      status: 'failed',
      error: (error as Error).message || 'TTS generation failed'
    }).eq('id', jobId);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: TTSRequest = await req.json();

    // Handle job status polling
    if (request.jobId) {
      const { data: job, error } = await supabase
        .from('tts_jobs')
        .select('*')
        .eq('id', request.jobId)
        .single();
      
      if (error || !job) {
        return new Response(
          JSON.stringify({ error: 'Job not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          jobId: job.id,
          status: job.status,
          progress: job.progress,
          ...(job.status === 'complete' && {
            audioContent: job.audio_content,
            audioUrl: job.audio_url,
            provider: job.provider,
            zone: job.zone,
            quality: job.quality,
            cost: job.cost,
            charCount: job.char_count
          }),
          ...(job.status === 'failed' && { error: job.error })
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!request.text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const region = request.region || 'US';
    // Support both 'languageCode' and 'language' field names for caller flexibility
    const languageCode = request.languageCode || (request as any).language || 'en-US';
    const tier = request.tier || 'standard';
    const providers = getAvailableProviders();

    // Enhanced logging for debugging
    console.log(`📢 TTS Request Details:
  - Text Length: ${request.text.length} chars
  - Text Preview: "${request.text.substring(0, 80)}..."
  - Region: ${region}
  - Language: ${languageCode}
  - Tier: ${tier}
  - Zone Detection:
    - Is CJK Region: ${CJK_REGIONS.includes(region)}
    - Is MENA Region: ${MENA_REGIONS.includes(region)}
    - Is Gemini Region: ${GEMINI_REGIONS.includes(region)}
    - Is ElevenLabs Region: ${ELEVENLABS_REGIONS.includes(region)}
  - Available Providers: ${providers.filter(p => p.available).map(p => p.id).join(', ')}`);

    // Determine optimal provider
    let routing: TTSRouting;
    if (request.provider) {
      const available = providers.find(p => p.id === request.provider && p.available);
      if (!available) {
        console.warn(`⚠️ Requested provider ${request.provider} not available, using fallback`);
        routing = selectTTSProvider(region, languageCode, tier);
      } else {
        routing = { provider: request.provider, cost: 0.015, zone: 'manual', quality: 'standard' };
      }
    } else {
      routing = selectTTSProvider(region, languageCode, tier);
    }

    console.log(`🎯 Selected provider: ${routing.provider} (zone: ${routing.zone})`);

    // ═══════════════════════════════════════════════════════════════════════════════
    // BACKGROUND PROCESSING FOR LONG CONTENT
    // ═══════════════════════════════════════════════════════════════════════════════
    if (request.text.length > BACKGROUND_THRESHOLD) {
      console.log(`📋 Long content (${request.text.length} chars), using background processing`);
      
      // Create job record
      const jobId = crypto.randomUUID();
      const { error: insertError } = await supabase.from('tts_jobs').insert({
        id: jobId,
        status: 'processing',
        progress: 0,
        text_length: request.text.length,
        language_code: languageCode,
        provider: routing.provider,
        created_at: new Date().toISOString()
      });

      if (insertError) {
        console.error('Failed to create TTS job:', insertError);
        // Fall back to sync processing if job creation fails
      } else {
        // Start background processing using EdgeRuntime.waitUntil
        // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
        EdgeRuntime.waitUntil(
          processTTSBackground(jobId, request, routing, providers)
        );

        // Return immediately with job ID
        return new Response(
          JSON.stringify({ 
            jobId,
            status: 'processing',
            progress: 0,
            message: 'TTS generation started. Poll with jobId to check status.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SYNCHRONOUS PROCESSING FOR SHORT CONTENT
    // ═══════════════════════════════════════════════════════════════════════════════
    let audioBuffer: ArrayBuffer;
    
    const generateWithProvider = async (provider: TTSProvider): Promise<ArrayBuffer> => {
      switch (provider) {
        case 'elevenlabs':
          return await generateElevenLabsTTS(request.text, request.voice, request.speed);
        case 'openai':
          return await generateOpenAITTS(request.text, request.voice, request.speed);
        case 'azure':
          return await generateAzureTTS(request.text, languageCode, request.voice);
        case 'google':
          return await generateGoogleTTS(request.text, languageCode, request.voice);
        case 'alibaba':
          return await generateAlibabaTTS(request.text, languageCode, request.voice);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    };
    
    try {
      audioBuffer = await generateWithProvider(routing.provider);
    } catch (primaryError) {
      console.warn(`⚠️ Primary provider ${routing.provider} failed:`, (primaryError as Error).message);
      
      // Build fallback chain based on zone
      let fallbackChain: TTSProvider[];
      
      if (routing.zone === 'gemini') {
        fallbackChain = ['azure', 'alibaba', 'google', 'elevenlabs', 'openai'];
      } else if (routing.zone === 'alibaba') {
        fallbackChain = ['alibaba', 'azure', 'elevenlabs', 'openai', 'google'];
      } else if (routing.zone === 'azure') {
        fallbackChain = ['azure', 'google', 'alibaba', 'elevenlabs', 'openai'];
      } else {
        fallbackChain = ['elevenlabs', 'openai', 'azure', 'google'];
      }
      
      const availableProviderIds = providers.filter(p => p.available).map(p => p.id);
      const remainingProviders = fallbackChain.filter(
        p => p !== routing.provider && availableProviderIds.includes(p)
      );
      
      console.log(`🔄 Fallback chain: ${remainingProviders.join(' → ')}`);
      
      let lastError: Error = primaryError as Error;
      let fallbackSucceeded = false;
      
      for (const fallbackProvider of remainingProviders) {
        try {
          console.log(`🔄 Trying fallback: ${fallbackProvider}`);
          audioBuffer = await generateWithProvider(fallbackProvider);
          routing.provider = fallbackProvider;
          routing.zone = 'fallback';
          console.log(`✅ Fallback to ${fallbackProvider} succeeded`);
          fallbackSucceeded = true;
          break;
        } catch (fallbackError) {
          console.warn(`⚠️ Fallback ${fallbackProvider} failed:`, (fallbackError as Error).message);
          lastError = fallbackError as Error;
        }
      }
      
      if (!fallbackSucceeded) {
        throw lastError;
      }
    }

    // Encode to base64 using chunked encoder to avoid memory spikes
    const base64Audio = encodeBase64Chunked(audioBuffer);

    console.log(`✅ TTS generated: ${base64Audio.length} chars base64, provider: ${routing.provider}`);

    return new Response(
      JSON.stringify({
        audioContent: base64Audio,
        audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
        provider: routing.provider,
        zone: routing.zone,
        quality: routing.quality,
        cost: routing.cost,
        charCount: request.text.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('TTS Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'TTS generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
