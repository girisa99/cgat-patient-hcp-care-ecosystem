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
 * Concatenate multiple audio buffers (MP3 frames are independent)
 */
async function concatenateAudioBuffers(buffers: ArrayBuffer[]): Promise<ArrayBuffer> {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
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
  return [
    { id: 'elevenlabs', available: !!Deno.env.get('ELEVENLABS_API_KEY'), priority: 1 },
    { id: 'openai', available: !!Deno.env.get('OPENAI_API_KEY'), priority: 2 },
    { id: 'azure', available: !!Deno.env.get('AZURE_SPEECH_KEY'), priority: 3 },
    { id: 'google', available: !!(Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY')), priority: 4 },
    { id: 'alibaba', available: !!Deno.env.get('ALIBABA_API_KEY'), priority: 5 },
  ];
}

function selectTTSProvider(region: string, languageCode: string, tier: string = 'standard'): TTSRouting {
  const providers = getAvailableProviders().filter(p => p.available);
  
  if (providers.length === 0) {
    throw new Error('No TTS API keys configured. Please add OPENAI_API_KEY, ELEVENLABS_API_KEY, AZURE_SPEECH_KEY, or GOOGLE_API_KEY.');
  }
  
  const hasProvider = (id: TTSProvider) => providers.some(p => p.id === id);
  
  // CJK Zone: Prefer Alibaba
  if (CJK_REGIONS.includes(region) && hasProvider('alibaba')) {
    console.log('🌏 CJK Zone: Routing to Alibaba TTS');
    return { provider: 'alibaba', cost: 0.004, zone: 'alibaba', quality: 'standard' };
  }

  // MENA Zone: Prefer Azure for Arabic support
  if (MENA_REGIONS.includes(region) && hasProvider('azure')) {
    console.log('🌍 MENA Zone: Routing to Azure TTS');
    return { provider: 'azure', cost: 0.016, zone: 'azure', quality: 'premium' };
  }

  // Premium tier: ElevenLabs for highest quality
  if (tier === 'premium' && hasProvider('elevenlabs')) {
    console.log('🎤 Premium tier: Routing to ElevenLabs');
    return { provider: 'elevenlabs', cost: 0.03, zone: 'claude', quality: 'premium' };
  }

  // Western languages: Prefer ElevenLabs, then OpenAI
  if (ELEVENLABS_REGIONS.includes(region)) {
    if (hasProvider('elevenlabs')) {
      console.log('🎤 Claude Zone: Routing to ElevenLabs');
      return { provider: 'elevenlabs', cost: 0.018, zone: 'claude', quality: 'premium' };
    }
    if (hasProvider('openai')) {
      console.log('🎤 Claude Zone fallback: Routing to OpenAI');
      return { provider: 'openai', cost: 0.015, zone: 'openai', quality: 'standard' };
    }
  }

  // South Asian/SEA: Prefer Google
  if (GEMINI_REGIONS.includes(region) && hasProvider('google')) {
    console.log('🌏 Gemini Zone: Routing to Google TTS');
    return { provider: 'google', cost: 0.016, zone: 'gemini', quality: 'standard' };
  }

  // Default fallback chain: OpenAI -> ElevenLabs -> Google -> Azure -> Alibaba
  for (const p of ['openai', 'elevenlabs', 'google', 'azure', 'alibaba'] as TTSProvider[]) {
    if (hasProvider(p)) {
      console.log(`🔊 Fallback: Routing to ${p}`);
      return {
        provider: p,
        cost: p === 'elevenlabs' ? 0.018 : p === 'azure' ? 0.016 : 0.015,
        zone: 'fallback',
        quality: p === 'elevenlabs' ? 'premium' : 'standard',
      };
    }
  }

  throw new Error('No TTS providers available');
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function generateElevenLabsTTS(text: string, voice?: string, speed?: number): Promise<ArrayBuffer> {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  if (!ELEVENLABS_API_KEY) throw new Error('ElevenLabs API key not configured');

  const voiceId = voice || 'JBFqnCBsd6RMkjVDRZzb'; // George
  
  // Chunk if needed
  const chunks = chunkTextBySentences(text, ELEVENLABS_MAX_CHARS);
  console.log(`🎤 ElevenLabs: Processing ${chunks.length} chunk(s), total ${text.length} chars`);
  
  const audioBuffers: ArrayBuffer[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`🎤 ElevenLabs chunk ${i + 1}/${chunks.length}: ${chunk.length} chars`);
    
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
        // Request stitching for smooth transitions
        ...(i > 0 && { previous_text: chunks[i - 1].slice(-200) }),
        ...(i < chunks.length - 1 && { next_text: chunks[i + 1].slice(0, 200) }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs TTS error: ${error}`);
    }

    audioBuffers.push(await response.arrayBuffer());
  }
  
  return chunks.length === 1 ? audioBuffers[0] : await concatenateAudioBuffers(audioBuffers);
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

  // Map language to Azure voice
  const voiceMap: Record<string, string> = {
    'en-US': 'en-US-JennyNeural',
    'en-GB': 'en-GB-SoniaNeural',
    'ar-SA': 'ar-SA-HamedNeural',
    'ar-AE': 'ar-AE-FatimaNeural',
    'de-DE': 'de-DE-KatjaNeural',
    'fr-FR': 'fr-FR-DeniseNeural',
    'es-ES': 'es-ES-ElviraNeural',
    'zh-CN': 'zh-CN-XiaoxiaoNeural',
    'ja-JP': 'ja-JP-NanamiNeural',
    'hi-IN': 'hi-IN-SwaraNeural',
    'te-IN': 'te-IN-ShrutiNeural',
  };
  
  const lang = languageCode || 'en-US';
  const selectedVoice = voice || voiceMap[lang] || 'en-US-JennyNeural';

  const ssml = `
    <speak version='1.0' xml:lang='${lang}'>
      <voice name='${selectedVoice}'>
        ${text}
      </voice>
    </speak>
  `;

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

  return response.arrayBuffer();
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
  const ALIBABA_API_KEY = Deno.env.get('ALIBABA_API_KEY');
  if (!ALIBABA_API_KEY) throw new Error('Alibaba API key not configured');

  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/tts/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ALIBABA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'cosyvoice-v1',
      input: { text },
      parameters: {
        voice: voice || 'zhitian_emo',
        format: 'mp3',
        sample_rate: 24000,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Alibaba TTS error: ${error}`);
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

  throw new Error('No audio returned from Alibaba TTS');
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

    if (!request.text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const region = request.region || 'US';
    const languageCode = request.languageCode || 'en-US';
    const tier = request.tier || 'standard';

    console.log(`📢 TTS Request: text="${request.text.substring(0, 50)}...", region=${region}, lang=${languageCode}, tier=${tier}, chars=${request.text.length}`);

    // Determine optimal provider
    let routing: TTSRouting;
    if (request.provider) {
      const providers = getAvailableProviders();
      const available = providers.find(p => p.id === request.provider && p.available);
      if (!available) {
        console.warn(`Requested provider ${request.provider} not available, using fallback`);
        routing = selectTTSProvider(region, languageCode, tier);
      } else {
        routing = { provider: request.provider, cost: 0.015, zone: 'manual', quality: 'standard' };
      }
    } else {
      routing = selectTTSProvider(region, languageCode, tier);
    }

    console.log(`🎯 Selected provider: ${routing.provider} (zone: ${routing.zone})`);

    // Generate audio based on provider
    let audioBuffer: ArrayBuffer;
    
    try {
      switch (routing.provider) {
        case 'elevenlabs':
          audioBuffer = await generateElevenLabsTTS(request.text, request.voice, request.speed);
          break;
        case 'openai':
          audioBuffer = await generateOpenAITTS(request.text, request.voice, request.speed);
          break;
        case 'azure':
          audioBuffer = await generateAzureTTS(request.text, languageCode, request.voice);
          break;
        case 'google':
          audioBuffer = await generateGoogleTTS(request.text, languageCode, request.voice);
          break;
        case 'alibaba':
          audioBuffer = await generateAlibabaTTS(request.text, languageCode, request.voice);
          break;
        default:
          audioBuffer = await generateOpenAITTS(request.text, request.voice, request.speed);
      }
    } catch (primaryError) {
      console.warn(`Primary provider ${routing.provider} failed:`, primaryError);
      
      // Try OpenAI as universal fallback
      if (routing.provider !== 'openai' && Deno.env.get('OPENAI_API_KEY')) {
        console.log('🔄 Falling back to OpenAI TTS');
        audioBuffer = await generateOpenAITTS(request.text, request.voice, request.speed);
        routing.provider = 'openai';
      } else if (routing.provider !== 'elevenlabs' && Deno.env.get('ELEVENLABS_API_KEY')) {
        console.log('🔄 Falling back to ElevenLabs TTS');
        audioBuffer = await generateElevenLabsTTS(request.text, request.voice, request.speed);
        routing.provider = 'elevenlabs';
      } else {
        throw primaryError;
      }
    }

    // Encode to base64
    const base64Audio = base64Encode(audioBuffer);

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
      JSON.stringify({ error: error.message || 'TTS generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
