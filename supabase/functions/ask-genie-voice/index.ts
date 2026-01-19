/**
 * Ask Genie Voice Edge Function
 * 
 * Language-paired bidirectional voice for Ask Genie:
 * - Speech-to-Text (transcribe) with provider fallback
 * - Text-to-Speech (speak) with provider fallback
 * 
 * Supports 20+ languages with optimal provider selection
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Provider API endpoints
const PROVIDERS = {
  // TTS
  elevenlabs: 'https://api.elevenlabs.io/v1/text-to-speech',
  openai_tts: 'https://api.openai.com/v1/audio/speech',
  google_tts: 'https://texttospeech.googleapis.com/v1/text:synthesize',
  azure_tts: 'tts.speech.microsoft.com',
  
  // STT
  whisper: 'https://api.openai.com/v1/audio/transcriptions',
  google_stt: 'https://speech.googleapis.com/v1/speech:recognize',
  elevenlabs_stt: 'https://api.elevenlabs.io/v1/speech-to-text',
};

// Language code mappings
const LANGUAGE_CODES: Record<string, { whisper: string; google: string; elevenlabs: string }> = {
  en: { whisper: 'en', google: 'en-US', elevenlabs: 'eng' },
  es: { whisper: 'es', google: 'es-ES', elevenlabs: 'spa' },
  fr: { whisper: 'fr', google: 'fr-FR', elevenlabs: 'fra' },
  de: { whisper: 'de', google: 'de-DE', elevenlabs: 'deu' },
  it: { whisper: 'it', google: 'it-IT', elevenlabs: 'ita' },
  pt: { whisper: 'pt', google: 'pt-BR', elevenlabs: 'por' },
  zh: { whisper: 'zh', google: 'zh-CN', elevenlabs: 'zho' },
  ja: { whisper: 'ja', google: 'ja-JP', elevenlabs: 'jpn' },
  ko: { whisper: 'ko', google: 'ko-KR', elevenlabs: 'kor' },
  ar: { whisper: 'ar', google: 'ar-SA', elevenlabs: 'ara' },
  hi: { whisper: 'hi', google: 'hi-IN', elevenlabs: 'hin' },
  ru: { whisper: 'ru', google: 'ru-RU', elevenlabs: 'rus' },
  tr: { whisper: 'tr', google: 'tr-TR', elevenlabs: 'tur' },
  nl: { whisper: 'nl', google: 'nl-NL', elevenlabs: 'nld' },
  pl: { whisper: 'pl', google: 'pl-PL', elevenlabs: 'pol' },
  sv: { whisper: 'sv', google: 'sv-SE', elevenlabs: 'swe' },
  th: { whisper: 'th', google: 'th-TH', elevenlabs: 'tha' },
  vi: { whisper: 'vi', google: 'vi-VN', elevenlabs: 'vie' },
  id: { whisper: 'id', google: 'id-ID', elevenlabs: 'ind' },
  uk: { whisper: 'uk', google: 'uk-UA', elevenlabs: 'ukr' },
  he: { whisper: 'he', google: 'he-IL', elevenlabs: 'heb' },
  ta: { whisper: 'ta', google: 'ta-IN', elevenlabs: 'tam' },
};

function getLanguageCode(lang: string, provider: string): string {
  const normalized = lang.toLowerCase().split('-')[0];
  const mapping = LANGUAGE_CODES[normalized] || LANGUAGE_CODES.en;
  
  switch (provider) {
    case 'whisper': return mapping.whisper;
    case 'google': return mapping.google;
    case 'elevenlabs': return mapping.elevenlabs;
    default: return normalized;
  }
}

// ============================================================================
// SPEECH-TO-TEXT PROVIDERS
// ============================================================================

async function transcribeWithWhisper(audioBase64: string, language: string): Promise<{ text: string; provider: string }> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  console.log('[ask-genie-voice] Transcribing with Whisper, language:', language);
  
  const binaryAudio = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
  const audioBlob = new Blob([binaryAudio], { type: 'audio/webm' });
  
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', getLanguageCode(language, 'whisper'));
  formData.append('response_format', 'json');

  const response = await fetch(PROVIDERS.whisper, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[ask-genie-voice] Whisper error:', response.status, error);
    throw new Error(`Whisper API error: ${response.status}`);
  }

  const result = await response.json();
  return { text: result.text, provider: 'whisper' };
}

async function transcribeWithGoogle(audioBase64: string, language: string): Promise<{ text: string; provider: string }> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GOOGLE_API_KEY not configured');

  console.log('[ask-genie-voice] Transcribing with Google STT, language:', language);

  const response = await fetch(`${PROVIDERS.google_stt}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 16000,
        languageCode: getLanguageCode(language, 'google'),
        enableAutomaticPunctuation: true,
        model: 'latest_long',
      },
      audio: { content: audioBase64 },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[ask-genie-voice] Google STT error:', response.status, error);
    throw new Error(`Google STT error: ${response.status}`);
  }

  const result = await response.json();
  const transcript = result.results
    ?.map((r: any) => r.alternatives?.[0]?.transcript)
    .filter(Boolean)
    .join(' ') || '';

  return { text: transcript, provider: 'google' };
}

async function transcribeWithElevenLabs(audioBase64: string, language: string): Promise<{ text: string; provider: string }> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');

  console.log('[ask-genie-voice] Transcribing with ElevenLabs Scribe, language:', language);

  const binaryAudio = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
  const audioBlob = new Blob([binaryAudio], { type: 'audio/webm' });
  
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model_id', 'scribe_v2');
  formData.append('language_code', getLanguageCode(language, 'elevenlabs'));

  const response = await fetch(PROVIDERS.elevenlabs_stt, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[ask-genie-voice] ElevenLabs STT error:', response.status, error);
    throw new Error(`ElevenLabs STT error: ${response.status}`);
  }

  const result = await response.json();
  return { text: result.text, provider: 'elevenlabs' };
}

// ============================================================================
// TEXT-TO-SPEECH PROVIDERS
// ============================================================================

async function speakWithElevenLabs(text: string, voiceId: string): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');

  const voice = voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Default: Sarah
  console.log('[ask-genie-voice] TTS with ElevenLabs, voice:', voice);

  const response = await fetch(`${PROVIDERS.elevenlabs}/${voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[ask-genie-voice] ElevenLabs TTS error:', response.status, error);
    throw new Error(`ElevenLabs TTS error: ${response.status}`);
  }

  return response.arrayBuffer();
}

async function speakWithOpenAI(text: string, voice?: string): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const selectedVoice = voice || 'nova';
  console.log('[ask-genie-voice] TTS with OpenAI, voice:', selectedVoice);

  const response = await fetch(PROVIDERS.openai_tts, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: selectedVoice,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[ask-genie-voice] OpenAI TTS error:', response.status, error);
    throw new Error(`OpenAI TTS error: ${response.status}`);
  }

  return response.arrayBuffer();
}

async function speakWithGoogle(text: string, language: string, voiceId?: string): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GOOGLE_API_KEY not configured');

  const languageCode = getLanguageCode(language, 'google');
  const voice = voiceId || `${languageCode}-Neural2-A`;
  console.log('[ask-genie-voice] TTS with Google, voice:', voice);

  const response = await fetch(`${PROVIDERS.google_tts}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode,
        name: voice,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 1.0,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[ask-genie-voice] Google TTS error:', response.status, error);
    throw new Error(`Google TTS error: ${response.status}`);
  }

  const result = await response.json();
  // Google returns base64 audio
  const binaryString = atob(result.audioContent);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, audio, text, language = 'en', provider, voiceId, fallbackProviders = [] } = body;

    console.log('[ask-genie-voice] Request:', { action, language, provider });

    if (action === 'transcribe') {
      // Speech-to-Text with fallback chain
      if (!audio) {
        return new Response(
          JSON.stringify({ error: 'Audio data is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const providers = [provider, ...fallbackProviders].filter(Boolean);
      let lastError: Error | null = null;

      for (const p of providers) {
        try {
          let result;
          switch (p) {
            case 'whisper':
              result = await transcribeWithWhisper(audio, language);
              break;
            case 'google':
              result = await transcribeWithGoogle(audio, language);
              break;
            case 'elevenlabs':
              result = await transcribeWithElevenLabs(audio, language);
              break;
            default:
              result = await transcribeWithWhisper(audio, language);
          }

          console.log('[ask-genie-voice] Transcription successful with:', result.provider);
          return new Response(
            JSON.stringify({ ...result, language }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          console.warn(`[ask-genie-voice] Provider ${p} failed:`, lastError.message);
          continue;
        }
      }

      throw lastError || new Error('All transcription providers failed');
    }

    if (action === 'speak') {
      // Text-to-Speech with fallback chain
      if (!text) {
        return new Response(
          JSON.stringify({ error: 'Text is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const providers = [provider, ...fallbackProviders].filter(Boolean);
      let lastError: Error | null = null;

      for (const p of providers) {
        try {
          let audioBuffer: ArrayBuffer;
          switch (p) {
            case 'elevenlabs':
              audioBuffer = await speakWithElevenLabs(text, voiceId);
              break;
            case 'openai':
              audioBuffer = await speakWithOpenAI(text, voiceId);
              break;
            case 'google':
              audioBuffer = await speakWithGoogle(text, language, voiceId);
              break;
            case 'azure':
              // Fallback to ElevenLabs for now
              audioBuffer = await speakWithElevenLabs(text, voiceId);
              break;
            default:
              audioBuffer = await speakWithElevenLabs(text, voiceId);
          }

          console.log('[ask-genie-voice] TTS successful with:', p, 'size:', audioBuffer.byteLength);
          return new Response(audioBuffer, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'audio/mpeg',
              'X-Provider': p,
            },
          });
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          console.warn(`[ask-genie-voice] TTS provider ${p} failed:`, lastError.message);
          continue;
        }
      }

      throw lastError || new Error('All TTS providers failed');
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "transcribe" or "speak"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ask-genie-voice] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
