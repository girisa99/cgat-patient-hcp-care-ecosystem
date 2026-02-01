import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Updated Veo models - using new API format
const VIDEO_MODELS = {
  PRIMARY: 'veo-3.1-generate-preview',
  FALLBACK: 'veo-2.0-generate-001',
};

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY is not set');
    }

    const body = await req.json();
    // Veo 3.1 only supports duration 4-8 seconds
    const rawDuration = body.duration || 8;
    const duration = Math.min(8, Math.max(4, rawDuration));
    const { prompt, aspectRatio = '16:9', model = 'auto' } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const selectedModel = model === 'auto' ? VIDEO_MODELS.PRIMARY : model;
    console.log('🎬 Generating video with Veo API:', { prompt, duration, aspectRatio, model: selectedModel });

    const startTime = Date.now();

    // Use the correct predictLongRunning endpoint for Veo
    const response = await fetch(`${BASE_URL}/models/${selectedModel}:predictLongRunning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GOOGLE_API_KEY,
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt
        }],
        parameters: {
          aspectRatio: aspectRatio,
          durationSeconds: duration, // Fixed: must be 4-8
          sampleCount: 1
        }
      }),
    });

    const responseText = await response.text();
    console.log('🔍 Veo API initial response:', { status: response.status, bodyPreview: responseText?.substring(0, 300) });

    let data: any = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('⚠️ Failed to parse Veo response:', responseText?.substring(0, 200));
      data = { error: { message: `Invalid response: ${responseText?.substring(0, 100) || 'empty'}` } };
    }

    // Check if we got an operation name for polling
    if (data.name && !data.done) {
      console.log('⏳ Got long-running operation, polling for completion:', data.name);
      
      // Poll for up to 60 seconds (edge function limit consideration)
      const maxPolls = 6;
      const pollInterval = 8000; // 8 seconds between polls
      
      for (let i = 0; i < maxPolls; i++) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        const pollResponse = await fetch(`${BASE_URL}/${data.name}`, {
          headers: { 'x-goog-api-key': GOOGLE_API_KEY }
        });
        
        const pollText = await pollResponse.text();
        let pollData: any = {};
        try {
          pollData = pollText ? JSON.parse(pollText) : {};
        } catch {
          console.error('⚠️ Failed to parse poll response:', pollText?.substring(0, 100));
          continue;
        }
        
        console.log(`📊 Poll ${i + 1}/${maxPolls}:`, { done: pollData.done, hasResponse: !!pollData.response });
        
        if (pollData.done) {
          data = pollData;
          break;
        }
        
        if (pollData.error) {
          throw new Error(pollData.error.message || 'Operation failed');
        }
      }
    }

    // Handle errors or try fallback model
    if (!response.ok || data.error) {
      console.log('⚠️ Primary model failed, trying fallback to Imagen sequence...');
      return await generateImageSequenceFallback(prompt, aspectRatio, GOOGLE_API_KEY, startTime, corsHeaders);
    }

    // Check for completed video
    const videoResponse = data.response?.generateVideoResponse;
    if (videoResponse?.generatedSamples?.[0]?.video) {
      const videoInfo = videoResponse.generatedSamples[0].video;
      
      // If we have a URI, we need to download it
      if (videoInfo.uri) {
        console.log('📥 Downloading video from URI:', videoInfo.uri);
        
        const videoDownload = await fetch(videoInfo.uri, {
          headers: { 'x-goog-api-key': GOOGLE_API_KEY }
        });
        
        if (videoDownload.ok) {
          const videoBuffer = await videoDownload.arrayBuffer();
          const videoBase64 = btoa(String.fromCharCode(...new Uint8Array(videoBuffer)));
          
          const processingTime = Date.now() - startTime;
          console.log('✅ Video generated and downloaded in', processingTime, 'ms');
          
          return new Response(JSON.stringify({
            success: true,
            videoUrl: `data:video/mp4;base64,${videoBase64}`,
            mediaUrl: `data:video/mp4;base64,${videoBase64}`,
            processingTime,
            metadata: {
              prompt, duration, aspectRatio,
              model: selectedModel,
              timestamp: new Date().toISOString()
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      // If we have videoBytes directly
      if (videoInfo.videoBytes) {
        const processingTime = Date.now() - startTime;
        return new Response(JSON.stringify({
          success: true,
          videoUrl: `data:video/mp4;base64,${videoInfo.videoBytes}`,
          mediaUrl: `data:video/mp4;base64,${videoInfo.videoBytes}`,
          processingTime,
          metadata: {
            prompt, duration, aspectRatio,
            model: selectedModel,
            timestamp: new Date().toISOString()
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // If operation still not done after polling, return async generation status
    if (data.name && !data.done) {
      console.log('⏳ Video generation in progress, returning async status');
      return await generateImageSequenceFallback(prompt, aspectRatio, GOOGLE_API_KEY, startTime, corsHeaders, true, data.name);
    }

    // Fallback to image sequence
    console.log('📸 No video output, falling back to image sequence');
    return await generateImageSequenceFallback(prompt, aspectRatio, GOOGLE_API_KEY, startTime, corsHeaders);

  } catch (error) {
    console.error('💥 Error in gemini-generate-video function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback to generating image sequence when video generation fails or times out
async function generateImageSequenceFallback(
  prompt: string, 
  aspectRatio: string, 
  apiKey: string, 
  startTime: number,
  corsHeaders: Record<string, string>,
  asyncGeneration = false,
  operationName?: string
): Promise<Response> {
  console.log('📸 Generating image sequence fallback with Imagen 3.0...');
  
  const imagePrompts = [
    `${prompt} - beginning scene, cinematic wide shot, high quality`,
    `${prompt} - middle action, dynamic medium shot, detailed`,  
    `${prompt} - final result, dramatic close-up, professional`
  ];

  const images: string[] = [];
  
  for (const imagePrompt of imagePrompts) {
    try {
      // Use the correct Imagen 3 endpoint format
      const imgResponse = await fetch(`${BASE_URL}/models/imagen-3.0-generate-001:predict`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          instances: [{ prompt: imagePrompt }],
          parameters: {
            aspectRatio: aspectRatio,
            sampleCount: 1
          }
        }),
      });

      const imgText = await imgResponse.text();
      console.log('📸 Imagen response:', { status: imgResponse.status, preview: imgText?.substring(0, 150) });
      
      let imgData: any = {};
      try {
        imgData = imgText ? JSON.parse(imgText) : {};
      } catch {
        console.warn('⚠️ Failed to parse image response');
        continue;
      }

      // Handle different response formats
      const imageBytes = imgData.predictions?.[0]?.bytesBase64Encoded || 
                         imgData.predictions?.[0]?.image?.bytesBase64Encoded ||
                         imgData.generatedImages?.[0]?.imageBytes;
      
      if (imageBytes) {
        images.push(`data:image/png;base64,${imageBytes}`);
        console.log('✅ Generated image frame', images.length);
      }
    } catch (err) {
      console.warn('⚠️ Failed to generate frame:', err);
    }
  }

  const processingTime = Date.now() - startTime;

  if (images.length > 0) {
    return new Response(JSON.stringify({ 
      success: true,
      videoUrl: images[0],
      mediaUrl: images[0],
      imageSequence: images,
      isImageSequence: true,
      asyncGeneration,
      operationName,
      processingTime,
      metadata: {
        prompt,
        aspectRatio,
        model: 'imagen-3.0-generate-001-sequence',
        timestamp: new Date().toISOString(),
        note: asyncGeneration 
          ? 'Video generation in progress. Images provided as preview.'
          : 'Generated as image sequence due to video API timeout'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  throw new Error('Failed to generate both video and fallback images');
}
