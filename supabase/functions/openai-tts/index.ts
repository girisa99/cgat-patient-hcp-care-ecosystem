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
    // Split text into chunks at sentence boundaries
    const maxChars = 4000; // Leave some margin
    const chunks: string[] = [];
    
    if (text.length <= maxChars) {
      chunks.push(text);
    } else {
      // Split by sentences to maintain natural speech flow
      const sentences = text.split(/(?<=[.!?])\s+/);
      let currentChunk = '';
      
      for (const sentence of sentences) {
        if ((currentChunk + ' ' + sentence).length > maxChars) {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }
          // If a single sentence is too long, split by words
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
    }

    console.log(`Split text into ${chunks.length} chunks`);

    // Generate audio for each chunk
    const audioBuffers: ArrayBuffer[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1}/${chunks.length}, length: ${chunks[i].length}`);
      
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: chunks[i],
          voice: voice,
          speed: speed,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`OpenAI TTS API error on chunk ${i + 1}:`, response.status, errorData);
        return new Response(
          JSON.stringify({ error: `OpenAI TTS error on chunk ${i + 1}: ${errorData}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const buffer = await response.arrayBuffer();
      audioBuffers.push(buffer);
      console.log(`Chunk ${i + 1} audio size: ${buffer.byteLength} bytes`);
    }

    // Combine all audio buffers
    const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const combinedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const buffer of audioBuffers) {
      combinedBuffer.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }

    console.log(`Combined audio size: ${combinedBuffer.byteLength} bytes from ${chunks.length} chunks`);

    // Convert to base64
    const base64Audio = base64Encode(combinedBuffer);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        voice: voice,
        textLength: text.length,
        chunks: chunks.length,
        truncated: false
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
