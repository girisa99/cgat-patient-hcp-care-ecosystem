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
    const { text, voice = 'alloy', speed = 1.0, chunkIndex, totalChunks } = await req.json();

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

    // If chunkIndex is provided, we're processing a single chunk (client-side chunking)
    if (typeof chunkIndex === 'number') {
      console.log(`Processing chunk ${chunkIndex + 1}/${totalChunks}, text length: ${text.length}, voice: ${voice}`);
      
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice,
          speed: speed,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`OpenAI TTS API error:`, response.status, errorData);
        return new Response(
          JSON.stringify({ error: `OpenAI TTS error: ${errorData}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const buffer = await response.arrayBuffer();
      const base64Audio = base64Encode(new Uint8Array(buffer) as any);
      
      console.log(`Chunk ${chunkIndex + 1} completed, audio size: ${buffer.byteLength} bytes`);

      return new Response(
        JSON.stringify({ 
          audioContent: base64Audio,
          chunkIndex,
          totalChunks,
          textLength: text.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Legacy mode: process short text directly (under 4000 chars)
    if (text.length <= 4000) {
      console.log(`Processing short text directly, length: ${text.length}, voice: ${voice}`);
      
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice,
          speed: speed,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`OpenAI TTS API error:`, response.status, errorData);
        return new Response(
          JSON.stringify({ error: `OpenAI TTS error: ${errorData}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const buffer = await response.arrayBuffer();
      const base64Audio = base64Encode(new Uint8Array(buffer) as any);
      
      console.log(`Audio generated, size: ${buffer.byteLength} bytes`);

      return new Response(
        JSON.stringify({ 
          audioContent: base64Audio,
          voice: voice,
          textLength: text.length,
          chunks: 1
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For longer text, return chunk info so client can process chunks
    const maxChars = 3800; // Leave margin for OpenAI's 4096 limit
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length > maxChars) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        // Handle very long sentences
        if (sentence.length > maxChars) {
          const words = sentence.split(/\s+/);
          let wordChunk = '';
          for (const word of words) {
            if ((wordChunk + ' ' + word).length > maxChars) {
              if (wordChunk) chunks.push(wordChunk.trim());
              wordChunk = word;
            } else {
              wordChunk = wordChunk ? wordChunk + ' ' + word : word;
            }
          }
          if (wordChunk) currentChunk = wordChunk;
        } else {
          currentChunk = sentence;
        }
      } else {
        currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    console.log(`Text needs chunking: ${text.length} chars -> ${chunks.length} chunks`);

    return new Response(
      JSON.stringify({ 
        needsChunking: true,
        chunks: chunks,
        totalChunks: chunks.length,
        voice: voice,
        textLength: text.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in openai-tts function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
