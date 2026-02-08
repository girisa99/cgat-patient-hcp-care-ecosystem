/**
 * VOICE-TO-TEXT — Speech-to-Text Demo Edge Function
 * 
 * ROUTING ORDER (per master-provider-routing-registry):
 *   DEMO (REST): Whisper → Google STT → ElevenLabs Scribe
 *   PRODUCTION: Use deepgram-stt function instead (Deepgram Nova 2 primary)
 * 
 * SECURITY: Database-backed rate limiting, input-validated, public endpoint (no JWT)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MAX_AUDIO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB max audio

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || req.headers.get('x-real-ip')
    || 'unknown';
}

// Valid language codes for STT
const VALID_STT_LANGUAGES = new Set([
  'en', 'ar', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml',
  'ja', 'zh', 'ko', 'de', 'fr', 'es', 'pt', 'it', 'nl', 'pl',
  'sv', 'tr', 'ru', 'uk', 'th', 'vi', 'id', 'sw', 'yo', 'ha',
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);

  // ============================================
  // DATABASE-BACKED RATE LIMITING
  // ============================================
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: rateResult } = await supabase.rpc('check_rate_limit', {
      p_client_ip: clientIP,
      p_endpoint: 'voice-to-text',
      p_max_requests: 10,
      p_window_seconds: 60,
    });

    if (rateResult && !rateResult.allowed) {
      console.warn(`[voice-to-text] Rate limited IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait and try again.', retryAfter: rateResult.reset_in_seconds }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rateResult.reset_in_seconds) } }
      );
    }
  } catch (rlError) {
    console.warn('[voice-to-text] Rate limit check failed, proceeding:', rlError);
  }

  try {
    const { audio, language = 'en' } = await req.json();

    // Input validation
    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'Audio data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate language code
    const langShort = language.split('-')[0].toLowerCase();
    if (!VALID_STT_LANGUAGES.has(langShort)) {
      return new Response(
        JSON.stringify({ error: `Unsupported language: ${language}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate audio size (base64 is ~33% larger than binary)
    if (audio.length > MAX_AUDIO_SIZE_BYTES * 1.37) {
      return new Response(
        JSON.stringify({ error: 'Audio too large. Maximum 5MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[voice-to-text] Processing STT request from ${clientIP}, lang=${language}, size=${Math.round(audio.length/1024)}KB`);

    // ============================================
    // STT PROVIDER CHAIN (per master registry adapted for REST demo)
    // Production: Deepgram Nova 2 → Azure STT → Whisper
    // Demo (REST): Whisper → Google STT → ElevenLabs Scribe
    // ============================================

    // 1. PRIMARY (demo): OpenAI Whisper
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      console.log('[voice-to-text] Using OpenAI Whisper (demo primary)');
      
      const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
      
      const formData = new FormData();
      const audioBlob = new Blob([binaryAudio], { type: 'audio/mp3' });
      formData.append('file', audioBlob, 'audio.mp3');
      formData.append('model', 'whisper-1');
      formData.append('language', langShort);
      formData.append('response_format', 'json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}` },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[voice-to-text] Whisper transcription successful, length:', result.text?.length);

        return new Response(
          JSON.stringify({ 
            text: result.text,
            provider: 'openai_whisper',
            language,
            routing: 'Demo REST chain: Whisper(1) > Google(2) > ElevenLabs(3). Production uses Deepgram Nova 2 primary.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('[voice-to-text] OpenAI Whisper error:', response.status, await response.text());
    }

    // 2. SECONDARY: Google Speech-to-Text
    const googleKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
    if (googleKey) {
      console.log('[voice-to-text] Falling back to Google STT');

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${googleKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              encoding: 'MP3',
              languageCode: language === 'en' ? 'en-US' : language,
              enableAutomaticPunctuation: true,
              model: 'latest_long',
            },
            audio: { content: audio },
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const transcript = result.results
          ?.map((r: any) => r.alternatives?.[0]?.transcript)
          .filter(Boolean)
          .join(' ') || '';

        console.log('[voice-to-text] Google STT successful, length:', transcript.length);

        return new Response(
          JSON.stringify({ 
            text: transcript,
            provider: 'google_stt',
            language,
            routing: 'Fallback: Google STT (secondary)'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('[voice-to-text] Google STT error:', response.status, await response.text());
    }

    // 3. TERTIARY: ElevenLabs Scribe
    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (elevenLabsKey) {
      console.log('[voice-to-text] Falling back to ElevenLabs Scribe');

      const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
      
      const formData = new FormData();
      const audioBlob = new Blob([binaryAudio], { type: 'audio/mp3' });
      formData.append('file', audioBlob, 'audio.mp3');
      formData.append('model_id', 'scribe_v1');
      formData.append('language_code', langShort === 'en' ? 'eng' : langShort);

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: { 'xi-api-key': elevenLabsKey },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[voice-to-text] ElevenLabs Scribe successful');

        return new Response(
          JSON.stringify({ 
            text: result.text,
            provider: 'elevenlabs_scribe',
            language,
            words: result.words,
            routing: 'Fallback: ElevenLabs Scribe (tertiary)'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('[voice-to-text] ElevenLabs error:', response.status, await response.text());
    }

    throw new Error('No speech-to-text provider configured. Please add OPENAI_API_KEY, GOOGLE_API_KEY, or ELEVENLABS_API_KEY.');

  } catch (error) {
    console.error('[voice-to-text] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Transcription failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
