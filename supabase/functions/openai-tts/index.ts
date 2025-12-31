import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'alloy', speed = 1.0 } = await req.json();

    if (!text) {
      console.error('Missing required parameter: text');
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating TTS for text length: ${text.length}, voice: ${voice}, speed: ${speed}`);

    // OpenAI TTS has a limit of 4096 characters per request
    const maxChars = 4096;
    const textToProcess = text.length > maxChars ? text.substring(0, maxChars) : text;

    if (text.length > maxChars) {
      console.warn(`Text truncated from ${text.length} to ${maxChars} characters`);
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: textToProcess,
        voice: voice,
        speed: speed,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI TTS API error:', response.status, errorData);
      return new Response(
        JSON.stringify({ error: `OpenAI TTS error: ${errorData}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the audio as array buffer
    const audioBuffer = await response.arrayBuffer();
    console.log(`Audio generated successfully, size: ${audioBuffer.byteLength} bytes`);

    // Convert to base64
    const base64Audio = base64Encode(audioBuffer);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        voice: voice,
        textLength: textToProcess.length,
        truncated: text.length > maxChars
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in openai-tts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
