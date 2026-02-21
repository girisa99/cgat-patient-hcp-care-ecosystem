/**
 * Guide TTS — Dedicated lightweight TTS for Ori/Arc guide voiceover
 * 
 * Follows the same 4-zone routing as multi-provider-tts but optimized
 * for short guide messages (<500 chars). No chunking, no job queue.
 * 
 * Fallback chain: ElevenLabs → Azure → Google → OpenAI
 * Regional routing: same zones as multi-provider-tts
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type TTSProvider = 'elevenlabs' | 'azure' | 'google' | 'openai';

interface GuideTTSRequest {
  text: string;
  agent: 'ori' | 'arc';
  languageCode?: string;
  region?: string;
  speed?: number;
}

// ── Zone definitions (matching multi-provider-tts) ───────────────────────────

const CJK_LANGUAGES = ['ja', 'ko', 'zh', 'zh-CN', 'zh-TW', 'zh-HK'];
const ARABIC_LANGUAGES = ['ar', 'ar-SA', 'ar-AE', 'ar-EG', 'ar-MA', 'ar-JO'];
const SOUTH_ASIAN = ['hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur'];

// Character-specific voice mapping (warm/friendly for Ori, precise/clear for Arc)
const AGENT_VOICES: Record<string, Record<TTSProvider, string>> = {
  ori: {
    elevenlabs: 'EXAVITQu4vr4xnSDxMaL', // Sarah — warm, encouraging
    azure: 'en-US-JennyNeural',
    google: 'en-US-Neural2-C',
    openai: 'nova',
  },
  arc: {
    elevenlabs: 'JBFqnCBsd6RMkjVDRZzb', // George — authoritative, clear
    azure: 'en-US-GuyNeural',
    google: 'en-US-Neural2-D',
    openai: 'onyx',
  },
};

// ── Provider detection ───────────────────────────────────────────────────────

function getAvailableProviders(): TTSProvider[] {
  const providers: TTSProvider[] = [];
  if (Deno.env.get('ELEVENLABS_API_KEY')) providers.push('elevenlabs');
  if (Deno.env.get('AZURE_SPEECH_KEY')) providers.push('azure');
  if (Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY')) providers.push('google');
  if (Deno.env.get('OPENAI_API_KEY')) providers.push('openai');
  return providers;
}

function selectProvider(languageCode: string): TTSProvider {
  const available = getAvailableProviders();
  if (available.length === 0) throw new Error('No TTS API keys configured');

  const lang = languageCode.split('-')[0];
  const has = (p: TTSProvider) => available.includes(p);

  // CJK → Azure (Alibaba not in this lightweight function)
  if (CJK_LANGUAGES.some(l => l === languageCode || l === lang)) {
    if (has('azure')) return 'azure';
    if (has('google')) return 'google';
  }

  // Arabic/MENA → Azure
  if (ARABIC_LANGUAGES.some(l => l === languageCode || lang === 'ar')) {
    if (has('azure')) return 'azure';
    if (has('google')) return 'google';
  }

  // South Asian → Azure → Google
  if (SOUTH_ASIAN.includes(lang)) {
    if (has('azure')) return 'azure';
    if (has('google')) return 'google';
  }

  // Western/default → ElevenLabs → Azure → Google → OpenAI
  return available[0];
}

// ── Provider implementations ─────────────────────────────────────────────────

async function generateElevenLabs(text: string, voiceId: string, speed: number): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY')!;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.3, speed },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs: ${res.status} ${await res.text()}`);
  return res.arrayBuffer();
}

async function generateAzure(text: string, voiceId: string, speed: number): Promise<ArrayBuffer> {
  const key = Deno.env.get('AZURE_SPEECH_KEY')!;
  const region = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  
  // Get token
  const tokenRes = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Length': '0' },
  });
  const token = await tokenRes.text();

  const rate = speed !== 1 ? `rate="${Math.round((speed - 1) * 100)}%"` : '';
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="${voiceId}"><prosody ${rate}>${text}</prosody></voice>
  </speak>`;

  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
    },
    body: ssml,
  });
  if (!res.ok) throw new Error(`Azure: ${res.status}`);
  return res.arrayBuffer();
}

async function generateGoogle(text: string, voiceId: string, speed: number): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY')!;
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { name: voiceId, languageCode: voiceId.split('-').slice(0, 2).join('-') },
      audioConfig: { audioEncoding: 'MP3', speakingRate: speed },
    }),
  });
  if (!res.ok) throw new Error(`Google: ${res.status} ${await res.text()}`);
  const data = await res.json();
  // Decode base64
  const binary = atob(data.audioContent);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function generateOpenAI(text: string, voice: string, speed: number): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')!;
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'tts-1', input: text, voice, speed, response_format: 'mp3' }),
  });
  if (!res.ok) throw new Error(`OpenAI: ${res.status} ${await res.text()}`);
  return res.arrayBuffer();
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, agent = 'ori', languageCode = 'en-US', speed = 1.0 }: GuideTTSRequest = await req.json();

    if (!text || text.length === 0) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cap text length for guide messages (prevent abuse)
    const safeText = text.slice(0, 1000);
    const provider = selectProvider(languageCode);
    const voices = AGENT_VOICES[agent] || AGENT_VOICES.ori;
    const voiceId = voices[provider];

    console.log(`🎙️ Guide TTS: agent=${agent}, provider=${provider}, voice=${voiceId}, chars=${safeText.length}`);

    // Try primary provider, fallback on error
    const providers = getAvailableProviders();
    let audioBuffer: ArrayBuffer | null = null;
    let usedProvider = provider;

    for (const p of [provider, ...providers.filter(x => x !== provider)]) {
      try {
        const v = voices[p];
        switch (p) {
          case 'elevenlabs': audioBuffer = await generateElevenLabs(safeText, v, speed); break;
          case 'azure': audioBuffer = await generateAzure(safeText, v, speed); break;
          case 'google': audioBuffer = await generateGoogle(safeText, v, speed); break;
          case 'openai': audioBuffer = await generateOpenAI(safeText, v, speed); break;
        }
        usedProvider = p;
        break;
      } catch (err) {
        console.warn(`⚠️ Guide TTS fallback: ${p} failed — ${err.message}`);
        continue;
      }
    }

    if (!audioBuffer) {
      return new Response(JSON.stringify({ error: 'All TTS providers failed' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return audio as base64 with metadata
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return new Response(JSON.stringify({
      audio: base64Audio,
      provider: usedProvider,
      agent,
      format: 'mp3',
      chars: safeText.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Guide TTS error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
