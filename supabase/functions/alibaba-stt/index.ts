/**
 * Alibaba Paraformer STT Edge Function
 * 
 * High-quality speech-to-text using Alibaba DashScope Paraformer model.
 * Optimized for Chinese and multilingual transcription.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Paraformer models
const PARAFORMER_MODELS = {
  'paraformer-v2': 'paraformer-v2',           // Latest multilingual
  'paraformer-realtime': 'paraformer-realtime-v1', // Real-time streaming
  'paraformer-mtl': 'paraformer-mtl-v1',      // Multilingual (50+ languages)
  'paraformer-8k': 'paraformer-8k-v1',        // 8kHz audio (phone calls)
} as const;

interface STTRequest {
  audio: string;              // URL or base64
  inputType: 'url' | 'base64';
  language?: string;
  model?: keyof typeof PARAFORMER_MODELS;
  enablePunctuation?: boolean;
  enableTimestamps?: boolean;
  enableSpeakerDiarization?: boolean;
  sampleRate?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: STTRequest = await req.json();
    
    // Use China (Beijing) API key for Paraformer - only available in China region
    const ALIBABA_CHINA_API_KEY = Deno.env.get('ALIBABA_CHINA_API_KEY');
    const ALIBABA_API_KEY = Deno.env.get('ALIBABA_API_KEY');
    const apiKey = ALIBABA_CHINA_API_KEY || ALIBABA_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ALIBABA_CHINA_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!request.audio) {
      return new Response(
        JSON.stringify({ error: 'Audio is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const model = PARAFORMER_MODELS[request.model || 'paraformer-v2'];
    console.log(`🎙️ Alibaba STT: model=${model}, type=${request.inputType}`);

    // Build DashScope request
    const dashscopePayload: any = {
      model,
      input: {},
      parameters: {
        sample_rate: request.sampleRate || 16000,
        format: 'wav',
        enable_punctuation_prediction: request.enablePunctuation !== false,
        enable_words: request.enableTimestamps || false,
        enable_speaker_diarization: request.enableSpeakerDiarization || false,
      }
    };

    // Add audio source
    if (request.inputType === 'url') {
      dashscopePayload.input.file_urls = [request.audio];
    } else {
      // For base64, we need to use file upload first or inline
      dashscopePayload.input.audio = request.audio;
    }

    // Add language hint if provided
    if (request.language) {
      dashscopePayload.parameters.language_hints = [request.language];
    }

    // Use China (Beijing) endpoint - Paraformer is ONLY available in China region
    const apiEndpoint = 'https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription';
    
    console.log(`🇨🇳 Using China (Beijing) DashScope endpoint for Paraformer STT`);

    // Call DashScope API
    const response = await fetch(
      apiEndpoint,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable', // Use async for longer audio
        },
        body: JSON.stringify(dashscopePayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Alibaba STT error:', errorText);
      
      // Return fallback for auth errors
      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Alibaba API authentication failed',
            fallback: true,
            text: null,
            provider: 'alibaba'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Alibaba DashScope API error: ${errorText}`);
    }

    const result = await response.json();

    // Check if async - need to poll
    if (result.output?.task_id) {
      // Poll for results (max 120 seconds for longer audio)
      const taskId = result.output.task_id;
      let transcriptionResult: any = null;
      
      for (let i = 0; i < 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const statusResponse = await fetch(
          `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          }
        );

        if (!statusResponse.ok) continue;

        const statusData = await statusResponse.json();
        
        if (statusData.output?.task_status === 'SUCCEEDED') {
          transcriptionResult = statusData.output;
          break;
        } else if (statusData.output?.task_status === 'FAILED') {
          throw new Error(`Transcription failed: ${statusData.output?.message || 'Unknown error'}`);
        }
      }

      if (!transcriptionResult) {
        throw new Error('Transcription timed out');
      }

      result.output = transcriptionResult;
    }

    // Parse transcription results
    const transcription = result.output?.results?.[0] || result.output;
    
    const text = transcription?.transcription_text || 
                 transcription?.sentences?.map((s: any) => s.text).join(' ') ||
                 transcription?.text || '';

    const words = transcription?.words?.map((w: any) => ({
      word: w.text,
      startTime: w.begin_time / 1000,
      endTime: w.end_time / 1000,
      confidence: w.confidence || 0.9,
    }));

    const speakers = transcription?.speaker_info?.map((s: any) => ({
      speakerId: s.speaker_id,
      text: s.text,
      startTime: s.begin_time / 1000,
      endTime: s.end_time / 1000,
    }));

    console.log(`✅ Alibaba STT completed: ${text.length} chars transcribed`);

    return new Response(
      JSON.stringify({
        success: true,
        text,
        words,
        speakers,
        language: transcription?.language || request.language,
        confidence: transcription?.confidence || 0.9,
        provider: 'alibaba',
        model,
        metadata: {
          durationSeconds: transcription?.duration_ms ? transcription.duration_ms / 1000 : 0,
          wordCount: text.split(/\s+/).length,
          estimatedCost: 0.001 * (text.length / 100), // Low cost
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Alibaba STT error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
