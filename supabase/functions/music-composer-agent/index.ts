/**
 * Music Composer Agent Edge Function
 * Uses ElevenLabs for music and SFX generation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, prompt, duration, type } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    if (action === 'generate' || action === 'generate_music') {
      const response = await fetch('https://api.elevenlabs.io/v1/music', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt || 'background music',
          duration_seconds: duration || 30,
        }),
      });

      if (!response.ok) {
        throw new Error(`Music generation failed: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      return new Response(audioBuffer, {
        headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
      });
    }

    if (action === 'generate_sfx') {
      const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt,
          duration_seconds: Math.min(duration || 5, 22),
          prompt_influence: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`SFX generation failed: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      return new Response(audioBuffer, {
        headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
      });
    }

    throw new Error('Unknown action');
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
