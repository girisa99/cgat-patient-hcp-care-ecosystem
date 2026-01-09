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
    const { audio, language = 'en' } = await req.json();

    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'Audio data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try OpenAI Whisper first
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      console.log('[voice-to-text] Using OpenAI Whisper for transcription');
      
      // Decode base64 to binary
      const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
      
      // Create form data for Whisper API
      const formData = new FormData();
      const audioBlob = new Blob([binaryAudio], { type: 'audio/mp3' });
      formData.append('file', audioBlob, 'audio.mp3');
      formData.append('model', 'whisper-1');
      formData.append('language', language);
      formData.append('response_format', 'json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[voice-to-text] OpenAI Whisper error:', response.status, errorText);
        throw new Error(`Whisper API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('[voice-to-text] Transcription successful, length:', result.text?.length);

      return new Response(
        JSON.stringify({ 
          text: result.text,
          provider: 'openai_whisper',
          language 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try Google Speech-to-Text
    const googleKey = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
    if (googleKey) {
      console.log('[voice-to-text] Using Google Speech-to-Text');

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
            audio: {
              content: audio,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[voice-to-text] Google STT error:', response.status, errorText);
        throw new Error(`Google STT error: ${response.status}`);
      }

      const result = await response.json();
      const transcript = result.results
        ?.map((r: any) => r.alternatives?.[0]?.transcript)
        .filter(Boolean)
        .join(' ') || '';

      console.log('[voice-to-text] Google transcription successful, length:', transcript.length);

      return new Response(
        JSON.stringify({ 
          text: transcript,
          provider: 'google_stt',
          language 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try ElevenLabs Scribe
    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (elevenLabsKey) {
      console.log('[voice-to-text] Using ElevenLabs Scribe');

      // Decode base64 to binary
      const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
      
      const formData = new FormData();
      const audioBlob = new Blob([binaryAudio], { type: 'audio/mp3' });
      formData.append('file', audioBlob, 'audio.mp3');
      formData.append('model_id', 'scribe_v1');
      formData.append('language_code', language === 'en' ? 'eng' : language);

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[voice-to-text] ElevenLabs error:', response.status, errorText);
        throw new Error(`ElevenLabs error: ${response.status}`);
      }

      const result = await response.json();
      console.log('[voice-to-text] ElevenLabs transcription successful');

      return new Response(
        JSON.stringify({ 
          text: result.text,
          provider: 'elevenlabs_scribe',
          language,
          words: result.words 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('No speech-to-text provider configured. Please add OPENAI_API_KEY, GOOGLE_API_KEY, or ELEVENLABS_API_KEY.');

  } catch (error) {
    console.error('[voice-to-text] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Transcription failed',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
