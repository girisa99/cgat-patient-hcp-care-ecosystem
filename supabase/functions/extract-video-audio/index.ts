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
    const { videoBase64, videoUrl, mimeType } = await req.json();

    if (!videoBase64 && !videoUrl) {
      return new Response(
        JSON.stringify({ error: 'Either videoBase64 or videoUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[extract-video-audio] Processing video, mimeType:', mimeType);

    // For video files, we can't easily extract audio server-side without FFmpeg
    // The best approach is to return the video data as-is and let the transcription
    // service handle it (Whisper can accept video files directly)
    
    if (videoBase64) {
      // Whisper API accepts video files directly (mp4, webm, etc.)
      // So we just pass through the video data
      console.log('[extract-video-audio] Passing through video data for direct transcription');
      
      return new Response(
        JSON.stringify({ 
          audioBase64: videoBase64,
          mimeType: mimeType || 'video/mp4',
          note: 'Video passed through - Whisper API accepts video files directly'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (videoUrl) {
      console.log('[extract-video-audio] Fetching video from URL:', videoUrl);
      
      try {
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        const contentType = response.headers.get('content-type') || 'video/mp4';
        
        return new Response(
          JSON.stringify({ 
            audioBase64: base64,
            mimeType: contentType,
            size: arrayBuffer.byteLength
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (fetchError) {
        console.error('[extract-video-audio] URL fetch failed:', fetchError);
        throw new Error(`Failed to fetch video from URL: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }
    }

    throw new Error('No valid video source provided');

  } catch (error) {
    console.error('[extract-video-audio] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Audio extraction failed',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
