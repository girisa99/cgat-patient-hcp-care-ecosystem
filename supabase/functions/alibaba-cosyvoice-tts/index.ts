/**
 * Alibaba CosyVoice TTS Edge Function
 * 
 * Extends existing TTS infrastructure (ai-video-generator already has CosyVoice fallback).
 * This dedicated function provides:
 * - Direct CosyVoice v3 flash/plus access
 * - EP04 character voice mapping
 * - English language support via bilingual voices
 * - Base64 audio output matching useTTSGeneration format
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice, model, speed } = await req.json();

    if (!text?.trim()) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try international API key first, then China key
    const apiKey = Deno.env.get('ALIBABA_API_KEY') || Deno.env.get('ALIBABA_CHINA_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ALIBABA_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const selectedModel = model || 'cosyvoice-v3-flash';
    const selectedVoice = voice || 'longanyang';

    console.log(`🎙️ Alibaba CosyVoice TTS: model=${selectedModel}, voice=${selectedVoice}, text=${text.length} chars`);

    // CosyVoice REST API (OpenAI-compatible endpoint)
    const response = await fetch(
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/audio/speech',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          input: text,
          voice: selectedVoice,
          response_format: 'mp3',
          speed: speed || 1.0,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ CosyVoice API error (${response.status}):`, errorText);
      
      // Try alternative endpoint (DashScope native)
      console.log('🔄 Retrying with DashScope native endpoint...');
      const altResponse = await fetch(
        'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2audio/generation',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            input: { text },
            parameters: {
              voice: selectedVoice,
              format: 'mp3',
              rate: speed ? Math.round((speed - 1) * 100) : 0,
            },
          }),
        }
      );

      if (!altResponse.ok) {
        const altError = await altResponse.text();
        console.error(`❌ DashScope native also failed (${altResponse.status}):`, altError);
        return new Response(JSON.stringify({ 
          error: `CosyVoice TTS failed: ${response.status}`,
          details: errorText,
        }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Native endpoint returns JSON with audio URL
      const altData = await altResponse.json();
      const audioUrl = altData.output?.audio_url || altData.output?.audio;
      
      if (audioUrl) {
        // Fetch the audio and convert to base64
        const audioFetch = await fetch(audioUrl);
        const audioBuffer = await audioFetch.arrayBuffer();
        const audioBase64 = base64Encode(audioBuffer);

        return new Response(JSON.stringify({
          audioContent: audioBase64,
          provider: 'alibaba',
          model: selectedModel,
          voice: selectedVoice,
          voiceName: selectedVoice,
          format: 'mp3',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'No audio generated' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // OpenAI-compatible endpoint returns raw audio bytes
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = base64Encode(audioBuffer);

    console.log(`✅ CosyVoice TTS generated: ${audioBuffer.byteLength} bytes`);

    return new Response(JSON.stringify({
      audioContent: audioBase64,
      provider: 'alibaba',
      model: selectedModel,
      voice: selectedVoice,
      voiceName: selectedVoice,
      format: 'mp3',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ CosyVoice TTS error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
