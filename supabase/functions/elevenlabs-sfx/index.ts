/**
 * ElevenLabs SFX Generation Edge Function
 * 
 * Generates sound effects from text descriptions using ElevenLabs Sound Effects API.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SFXRequest {
  prompt: string;
  duration?: number;        // 0.5 to 22 seconds
  promptInfluence?: number; // 0 to 1 (how closely to follow the prompt)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: SFXRequest = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ELEVENLABS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!request.prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔊 ElevenLabs SFX Request:`, {
      prompt: request.prompt.substring(0, 100),
      duration: request.duration,
      promptInfluence: request.promptInfluence
    });

    // Validate duration (ElevenLabs supports 0.5-22 seconds)
    const duration = Math.min(Math.max(request.duration || 5, 0.5), 22);
    const promptInfluence = Math.min(Math.max(request.promptInfluence || 0.3, 0), 1);

    // Call ElevenLabs Sound Effects API
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: request.prompt,
        duration_seconds: duration,
        prompt_influence: promptInfluence,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs SFX error:', errorText);
      throw new Error(`ElevenLabs SFX API error: ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = base64Encode(audioBuffer);
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    console.log(`✅ ElevenLabs SFX generated: ${audioBuffer.byteLength} bytes, duration=${duration}s`);

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl,
        audioBase64,
        duration,
        provider: 'elevenlabs',
        metadata: {
          promptUsed: request.prompt,
          promptInfluence,
          format: 'mp3',
          estimatedCost: 0.005 // SFX is relatively cheap
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('ElevenLabs SFX error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
