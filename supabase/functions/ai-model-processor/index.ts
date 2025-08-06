import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessRequest {
  modelType: 'vision' | 'text' | 'speech_to_text' | 'text_to_speech' | 'multimodal' | 'embedding';
  provider: 'openai' | 'huggingface' | 'elevenlabs' | 'anthropic';
  modelId: string;
  inputData: any;
  configuration?: Record<string, any>;
  testRunId?: string;
  sampleIndex?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ProcessRequest = await req.json();
    console.log('Processing AI model request:', requestData.modelType, requestData.provider);

    const startTime = Date.now();
    let result: any = null;
    let error: string | null = null;

    try {
      switch (requestData.provider) {
        case 'openai':
          result = await processOpenAI(requestData);
          break;
        case 'huggingface':
          result = await processHuggingFace(requestData);
          break;
        case 'elevenlabs':
          result = await processElevenLabs(requestData);
          break;
        case 'anthropic':
          result = await processAnthropic(requestData);
          break;
        default:
          throw new Error(`Unsupported provider: ${requestData.provider}`);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error('Model processing error:', error);
    }

    const processingTime = Date.now() - startTime;

    // Log results to test_samples if this is part of a test run
    if (requestData.testRunId && requestData.sampleIndex !== undefined) {
      await logTestSample(requestData.testRunId, requestData.sampleIndex, requestData.inputData, result, error, processingTime);
    }

    if (error) {
      return new Response(JSON.stringify({ error, processingTime }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ result, processingTime }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Request processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processOpenAI(request: ProcessRequest) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const config = request.configuration || {};

  switch (request.modelType) {
    case 'vision': {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.modelId,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: request.inputData.prompt || 'Describe this image' },
                { type: 'image_url', image_url: { url: request.inputData.imageUrl, detail: config.detail || 'auto' } }
              ]
            }
          ],
          max_tokens: config.max_tokens || 1000
        })
      });

      if (!response.ok) throw new Error(`OpenAI API error: ${await response.text()}`);
      const data = await response.json();
      return { text: data.choices[0].message.content };
    }

    case 'text': {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.modelId,
          messages: [{ role: 'user', content: request.inputData.text }],
          max_tokens: config.max_tokens || 2000,
          temperature: config.temperature || 0.7
        })
      });

      if (!response.ok) throw new Error(`OpenAI API error: ${await response.text()}`);
      const data = await response.json();
      return { text: data.choices[0].message.content };
    }

    case 'speech_to_text': {
      const formData = new FormData();
      const audioBlob = new Blob([atob(request.inputData.audio)], { type: 'audio/wav' });
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', request.modelId);
      formData.append('response_format', config.response_format || 'json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: formData
      });

      if (!response.ok) throw new Error(`OpenAI API error: ${await response.text()}`);
      const data = await response.json();
      return { text: data.text };
    }

    case 'text_to_speech': {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.modelId,
          input: request.inputData.text,
          voice: config.voice || 'alloy',
          response_format: config.response_format || 'mp3'
        })
      });

      if (!response.ok) throw new Error(`OpenAI API error: ${await response.text()}`);
      const arrayBuffer = await response.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      return { audioContent: base64Audio };
    }

    default:
      throw new Error(`Unsupported OpenAI model type: ${request.modelType}`);
  }
}

async function processHuggingFace(request: ProcessRequest) {
  const apiKey = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
  if (!apiKey) throw new Error('Hugging Face API key not configured');

  const config = request.configuration || {};

  // For now, return mock results for HuggingFace models
  // In production, you would use the actual HuggingFace Inference API
  switch (request.modelType) {
    case 'vision':
      return { 
        classification: [
          { label: 'mock_prediction', score: 0.95 },
          { label: 'alternative', score: 0.05 }
        ]
      };
    case 'embedding':
      return { 
        embeddings: Array(384).fill(0).map(() => Math.random() * 2 - 1) // Mock 384-dim embeddings
      };
    case 'speech_to_text':
      return { text: 'Mock transcription of the audio input' };
    default:
      throw new Error(`Unsupported HuggingFace model type: ${request.modelType}`);
  }
}

async function processElevenLabs(request: ProcessRequest) {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey) throw new Error('ElevenLabs API key not configured');

  if (request.modelType !== 'text_to_speech') {
    throw new Error('ElevenLabs only supports text-to-speech');
  }

  const config = request.configuration || {};
  const voiceId = config.voice_id || '9BWtsMINqrJLrRacOk9x'; // Aria voice

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: request.inputData.text,
      model_id: request.modelId,
      voice_settings: {
        stability: config.stability || 0.5,
        similarity_boost: config.similarity_boost || 0.5
      }
    })
  });

  if (!response.ok) throw new Error(`ElevenLabs API error: ${await response.text()}`);
  
  const arrayBuffer = await response.arrayBuffer();
  const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  return { audioContent: base64Audio };
}

async function processAnthropic(request: ProcessRequest) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('Anthropic API key not configured');

  if (request.modelType !== 'text') {
    throw new Error('Anthropic only supports text models');
  }

  const config = request.configuration || {};

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: request.modelId,
      max_tokens: config.max_tokens || 2000,
      temperature: config.temperature || 0.7,
      messages: [{ role: 'user', content: request.inputData.text }]
    })
  });

  if (!response.ok) throw new Error(`Anthropic API error: ${await response.text()}`);
  const data = await response.json();
  return { text: data.content[0].text };
}

async function logTestSample(testRunId: string, sampleIndex: number, inputData: any, result: any, error: string | null, processingTime: number) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured for logging');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('test_samples').insert({
      test_run_id: testRunId,
      sample_index: sampleIndex,
      input_data: inputData,
      actual_output: result,
      processing_time_ms: processingTime,
      status: error ? 'failed' : 'success',
      error_message: error
    });

    console.log(`Logged test sample ${sampleIndex} for run ${testRunId}`);
  } catch (err) {
    console.error('Error logging test sample:', err);
  }
}