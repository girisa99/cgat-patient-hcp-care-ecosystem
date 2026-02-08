/**
 * DEEPGRAM STT — Production Speech-to-Text Edge Function
 * 
 * Uses Deepgram Nova 2 as PRIMARY provider (per master-provider-routing-registry)
 * with OpenAI Whisper as SECONDARY fallback.
 * 
 * This is the PRODUCTION STT endpoint that complements the demo voice-to-text function.
 * Supports both REST (pre-recorded) and WebSocket-ready architecture.
 * 
 * ROUTING (per master registry):
 *   1. Deepgram Nova 2 (PRIMARY — <100ms latency, real-time capable)
 *   2. Azure STT (SECONDARY)
 *   3. Alibaba Paraformer (TERTIARY)
 *   4. OpenAI Whisper (FALLBACK)
 * 
 * SECURITY: Database-backed rate limiting, input validation, public endpoint
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Valid language codes for STT
const VALID_STT_LANGUAGES = new Set([
  'en', 'ar', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml',
  'ja', 'zh', 'ko', 'de', 'fr', 'es', 'pt', 'it', 'nl', 'pl',
  'sv', 'tr', 'ru', 'uk', 'th', 'vi', 'id', 'sw', 'yo', 'ha',
  'he', 'fa', 'ur', 'pa', 'ms', 'fil', 'ro', 'cs', 'hu', 'el',
  'da', 'fi', 'no', 'bg', 'hr', 'sk', 'sl', 'lt', 'lv', 'et',
]);

const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10MB for production

// Deepgram language mapping
const DEEPGRAM_LANG_MAP: Record<string, string> = {
  en: 'en-US', ar: 'ar', hi: 'hi', ta: 'ta', te: 'te',
  bn: 'bn', ja: 'ja', zh: 'zh', ko: 'ko', de: 'de',
  fr: 'fr', es: 'es', pt: 'pt', it: 'it', nl: 'nl',
  pl: 'pl', sv: 'sv', tr: 'tr', ru: 'ru', uk: 'uk',
  th: 'th', vi: 'vi', id: 'id', ms: 'ms', fil: 'tl',
  da: 'da', fi: 'fi', no: 'no', el: 'el', cs: 'cs',
  hu: 'hu', ro: 'ro', bg: 'bg', hr: 'hr', sk: 'sk',
};

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || req.headers.get('x-real-ip')
    || 'unknown';
}

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
      p_endpoint: 'deepgram-stt',
      p_max_requests: 15,
      p_window_seconds: 60,
    });

    if (rateResult && !rateResult.allowed) {
      console.warn(`[deepgram-stt] Rate limited IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please wait and try again.',
          retryAfter: rateResult.reset_in_seconds 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateResult.reset_in_seconds),
          } 
        }
      );
    }
  } catch (rlError) {
    console.warn('[deepgram-stt] Rate limit check failed, proceeding:', rlError);
  }

  try {
    const { audio, language = 'en', model = 'nova-2' } = await req.json();

    // Input validation
    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'Audio data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const langShort = language.split('-')[0].toLowerCase();
    if (!VALID_STT_LANGUAGES.has(langShort)) {
      return new Response(
        JSON.stringify({ error: `Unsupported language: ${language}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate audio size
    if (audio.length > MAX_AUDIO_SIZE_BYTES * 1.37) {
      return new Response(
        JSON.stringify({ error: 'Audio too large. Maximum 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[deepgram-stt] Processing request from ${clientIP}, lang=${language}, size=${Math.round(audio.length/1024)}KB`);

    const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));

    // ============================================
    // 1. PRIMARY: Deepgram Nova 2 (<100ms latency)
    // ============================================
    const deepgramKey = Deno.env.get('DEEPGRAM_API_KEY');
    if (deepgramKey) {
      console.log('[deepgram-stt] Using Deepgram Nova 2 (production primary)');

      const dgLang = DEEPGRAM_LANG_MAP[langShort] || langShort;
      const queryParams = new URLSearchParams({
        model: model === 'nova-2' ? 'nova-2' : 'nova-2',
        language: dgLang,
        punctuate: 'true',
        diarize: 'false',
        smart_format: 'true',
        utterances: 'true',
        detect_language: langShort === 'auto' ? 'true' : 'false',
      });

      const startTime = Date.now();
      const response = await fetch(
        `https://api.deepgram.com/v1/listen?${queryParams}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${deepgramKey}`,
            'Content-Type': 'audio/webm',
          },
          body: binaryAudio,
        }
      );

      if (response.ok) {
        const result = await response.json();
        const latencyMs = Date.now() - startTime;
        const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
        const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;
        const words = result.results?.channels?.[0]?.alternatives?.[0]?.words || [];
        const detectedLang = result.results?.channels?.[0]?.detected_language;

        console.log(`[deepgram-stt] Deepgram Nova 2 success: ${transcript.length} chars, ${latencyMs}ms, confidence=${confidence}`);

        return new Response(
          JSON.stringify({
            text: transcript,
            provider: 'deepgram_nova2',
            language: detectedLang || language,
            confidence,
            latency_ms: latencyMs,
            words: words.map((w: any) => ({
              text: w.word || w.punctuated_word,
              start: w.start,
              end: w.end,
              confidence: w.confidence,
            })),
            routing: 'Production chain: Deepgram Nova 2 (PRIMARY) > Azure STT > Whisper',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const errText = await response.text();
      console.error(`[deepgram-stt] Deepgram error ${response.status}:`, errText);
    }

    // ============================================
    // 2. SECONDARY: Azure STT
    // ============================================
    const azureSpeechKey = Deno.env.get('AZURE_SPEECH_KEY');
    const azureSpeechRegion = Deno.env.get('AZURE_SPEECH_REGION');
    if (azureSpeechKey && azureSpeechRegion) {
      console.log('[deepgram-stt] Falling back to Azure STT');

      const azureLang = langShort === 'en' ? 'en-US' : `${langShort}-${langShort.toUpperCase()}`;
      const startTime = Date.now();

      const response = await fetch(
        `https://${azureSpeechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${azureLang}`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': azureSpeechKey,
            'Content-Type': 'audio/webm; codec=opus',
            'Accept': 'application/json',
          },
          body: binaryAudio,
        }
      );

      if (response.ok) {
        const result = await response.json();
        const latencyMs = Date.now() - startTime;

        if (result.RecognitionStatus === 'Success') {
          console.log(`[deepgram-stt] Azure STT success: ${result.DisplayText?.length} chars, ${latencyMs}ms`);

          return new Response(
            JSON.stringify({
              text: result.DisplayText,
              provider: 'azure_stt',
              language,
              confidence: result.NBest?.[0]?.Confidence || null,
              latency_ms: latencyMs,
              routing: 'Fallback: Azure STT (secondary)',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      console.error('[deepgram-stt] Azure STT error:', response.status, await response.text());
    }

    // ============================================
    // 3. FALLBACK: OpenAI Whisper
    // ============================================
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      console.log('[deepgram-stt] Falling back to OpenAI Whisper');

      const formData = new FormData();
      const audioBlob = new Blob([binaryAudio], { type: 'audio/webm' });
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', langShort);
      formData.append('response_format', 'verbose_json');

      const startTime = Date.now();
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}` },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const latencyMs = Date.now() - startTime;

        console.log(`[deepgram-stt] Whisper success: ${result.text?.length} chars, ${latencyMs}ms`);

        return new Response(
          JSON.stringify({
            text: result.text,
            provider: 'openai_whisper',
            language: result.language || language,
            latency_ms: latencyMs,
            words: result.words || [],
            routing: 'Fallback: OpenAI Whisper (tertiary)',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('[deepgram-stt] Whisper error:', response.status, await response.text());
    }

    throw new Error('No STT provider available. Configure DEEPGRAM_API_KEY, AZURE_SPEECH_KEY, or OPENAI_API_KEY.');

  } catch (error) {
    console.error('[deepgram-stt] Error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Transcription failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
