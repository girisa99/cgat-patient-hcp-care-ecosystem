/**
 * Alibaba CosyVoice TTS Edge Function
 * 
 * Provides high-quality Chinese and multilingual text-to-speech
 * using Alibaba DashScope CosyVoice models.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.177.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Alibaba DashScope CosyVoice models
const COSY_VOICE_MODELS = {
  'cosyvoice-v1': 'cosyvoice-v1',
  'cosyvoice-multilingual': 'cosyvoice-multilingual-v1',
  'sambert-zhichu': 'sambert-zhichu-v1',  // Chinese female
  'sambert-zhide': 'sambert-zhide-v1',    // Chinese male
} as const;

// Voice presets for different languages
const VOICE_PRESETS: Record<string, { voice: string; model: string }> = {
  // Chinese voices
  'zh-CN-female': { voice: 'zhiyan', model: 'cosyvoice-v1' },
  'zh-CN-male': { voice: 'zhitian', model: 'cosyvoice-v1' },
  'zh-CN-child': { voice: 'zhitong', model: 'cosyvoice-v1' },
  // Multilingual voices
  'en-US-female': { voice: 'jessica', model: 'cosyvoice-multilingual-v1' },
  'en-US-male': { voice: 'michael', model: 'cosyvoice-multilingual-v1' },
  'ja-JP-female': { voice: 'yuki', model: 'cosyvoice-multilingual-v1' },
  'ko-KR-female': { voice: 'minji', model: 'cosyvoice-multilingual-v1' },
};

interface TTSRequest {
  text: string;
  voice?: string;
  model?: string;
  language?: string;
  speed?: number;      // 0.5-2.0
  pitch?: number;      // -12 to 12
  volume?: number;     // 0-100
  format?: 'mp3' | 'wav' | 'pcm';
  sampleRate?: number; // 8000, 16000, 24000
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: TTSRequest = await req.json();
    const ALIBABA_API_KEY = Deno.env.get('ALIBABA_API_KEY');

    if (!ALIBABA_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ALIBABA_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!request.text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🎤 Alibaba TTS Request:`, {
      textLength: request.text.length,
      voice: request.voice,
      model: request.model,
      language: request.language
    });

    // Determine voice and model from language preset or explicit values
    let voice = request.voice;
    let model = request.model || 'cosyvoice-v1';

    if (!voice && request.language) {
      const preset = VOICE_PRESETS[request.language];
      if (preset) {
        voice = preset.voice;
        model = preset.model;
      }
    }

    // Default to Chinese female if nothing specified
    if (!voice) {
      voice = 'zhiyan';
    }

    // Build request to Alibaba DashScope API
    const dashscopePayload = {
      model,
      input: {
        text: request.text
      },
      parameters: {
        voice,
        format: request.format || 'mp3',
        sample_rate: request.sampleRate || 16000,
        speech_rate: request.speed ? Math.round((request.speed - 1) * 500) : 0, // Convert 0.5-2.0 to -250 to 500
        pitch_rate: request.pitch ? Math.round(request.pitch * 42) : 0,         // Convert -12 to 12 to -500 to 500
        volume: request.volume || 50,
        enable_phoneme_timestamp: false,
        enable_word_timestamp: false
      }
    };

    // Use international endpoint for non-China regions (US Virginia = dashscope-intl)
    const apiEndpoint = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2audio/generation';
    
    console.log(`🌐 Using international DashScope endpoint for US Virginia region`);
    
    const response = await fetch(
      apiEndpoint,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ALIBABA_API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'disable', // Synchronous mode
        },
        body: JSON.stringify(dashscopePayload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Alibaba TTS error:', errorText);
      
      // Fallback to simulated response for development
      if (response.status === 401 || response.status === 403) {
        console.log('⚠️ Alibaba API auth failed, returning placeholder');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Alibaba API authentication failed',
            fallback: true,
            audioUrl: null,
            voice,
            model,
            provider: 'alibaba'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Alibaba DashScope API error: ${errorText}`);
    }

    const result = await response.json();

    // Extract audio URL or base64 from response
    let audioUrl = result.output?.audio_url || result.output?.audio;
    let audioBase64: string | undefined;

    // If audio is inline base64
    if (result.output?.audio && !result.output.audio.startsWith('http')) {
      audioBase64 = result.output.audio;
      audioUrl = `data:audio/${request.format || 'mp3'};base64,${audioBase64}`;
    }

    // Estimate duration based on text length (Chinese ~4 chars/sec, English ~3 words/sec)
    const isChinese = /[\u4e00-\u9fa5]/.test(request.text);
    const estimatedDuration = isChinese 
      ? request.text.length / 4 
      : request.text.split(/\s+/).length / 3;

    console.log(`✅ Alibaba TTS completed: voice=${voice}, model=${model}, duration≈${estimatedDuration}s`);

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl,
        audioBase64,
        duration: estimatedDuration,
        voice,
        model,
        provider: 'alibaba',
        metadata: {
          characterCount: request.text.length,
          format: request.format || 'mp3',
          sampleRate: request.sampleRate || 16000,
          estimatedCost: 0.002 // Low cost for Alibaba
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Alibaba TTS error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
