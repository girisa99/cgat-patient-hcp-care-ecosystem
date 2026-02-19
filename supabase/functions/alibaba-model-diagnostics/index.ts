import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModelTest {
  name: string;
  modelId: string;
  endpoint: string;
  payload: Record<string, unknown>;
  category: string;
  useOpenAICompat?: boolean;
}

// Corrected paths and payloads per official DashScope docs (Feb 2026)
const MODELS_TO_TEST: ModelTest[] = [
  // === LLM ===
  {
    name: 'Qwen LLM (qwen-max)',
    modelId: 'qwen-max',
    endpoint: '/compatible-mode/v1/chat/completions',
    payload: { model: 'qwen-max', messages: [{ role: 'user', content: 'Say OK' }], max_tokens: 5 },
    useOpenAICompat: true,
    category: 'llm',
  },
  {
    name: 'Qwen VL (Vision)',
    modelId: 'qwen-vl-max',
    endpoint: '/compatible-mode/v1/chat/completions',
    payload: { model: 'qwen-vl-max', messages: [{ role: 'user', content: 'Say OK' }], max_tokens: 5 },
    useOpenAICompat: true,
    category: 'llm',
  },

  // === VIDEO (path: /video-generation/video-synthesis) ===
  {
    name: 'Wan 2.6 Video (T2V)',
    modelId: 'wan2.6-t2v',
    endpoint: '/api/v1/services/aigc/video-generation/video-synthesis',
    payload: { model: 'wan2.6-t2v', input: { prompt: 'A calm ocean wave' }, parameters: { size: '1280*720', duration: 5 } },
    category: 'video',
  },
  {
    name: 'Wan 2.6 Video (T2V Fast)',
    modelId: 'wan2.6-t2v',
    endpoint: '/api/v1/services/aigc/video-generation/video-synthesis',
    payload: { model: 'wan2.6-t2v', input: { prompt: 'A simple test' }, parameters: { size: '1280*720' } },
    category: 'video',
  },
  {
    name: 'Wan 2.6 Video (T2V)',
    modelId: 'wan2.6-t2v',
    endpoint: '/api/v1/services/aigc/video-generation/video-synthesis',
    payload: { model: 'wan2.6-t2v', input: { prompt: 'A simple test' }, parameters: { size: '1280*720' } },
    category: 'video',
  },
  // Wan 2.2 S2V - CORRECTED: needs image_url (audio-driven video from reference image)
  {
    name: 'Wan 2.2 Avatar (S2V)',
    modelId: 'wan2.2-s2v',
    endpoint: '/api/v1/services/aigc/video-generation/video-synthesis',
    payload: {
      model: 'wan2.2-s2v',
      input: {
        image_url: 'https://dashscope.oss-cn-beijing.aliyuncs.com/images/tiger.png',
        prompt: 'A person talking naturally',
      },
      parameters: { size: '720*1280' },
    },
    category: 'avatar',
  },

  // === IMAGE ===
  {
    name: 'Wanx 2.1 Image',
    modelId: 'wanx2.1-t2i-turbo',
    endpoint: '/api/v1/services/aigc/text2image/image-synthesis',
    payload: { model: 'wanx2.1-t2i-turbo', input: { prompt: 'A flower' }, parameters: { size: '1024*1024', n: 1 } },
    category: 'image',
  },
  {
    name: 'Wanx v1 Image',
    modelId: 'wanx-v1',
    endpoint: '/api/v1/services/aigc/text2image/image-synthesis',
    payload: { model: 'wanx-v1', input: { prompt: 'A flower' }, parameters: { size: '512*512', n: 1 } },
    category: 'image',
  },

  // === TTS — Test both legacy Sambert AND newer CosyVoice v3 models ===
  {
    name: 'Sambert TTS (Female)',
    modelId: 'sambert-zhichu-v1',
    endpoint: '/api/v1/services/aigc/text2audio/generation',
    payload: { model: 'sambert-zhichu-v1', input: { text: '你好世界' } },
    category: 'tts',
  },
  // CosyVoice v3-flash — newer model, might work internationally via REST
  {
    name: 'CosyVoice v3 Flash (REST)',
    modelId: 'cosyvoice-v3-flash',
    endpoint: '/api/v1/services/aigc/text2audio/generation',
    payload: { model: 'cosyvoice-v3-flash', input: { text: 'Hello world, this is a test.' } },
    category: 'tts',
  },
  {
    name: 'CosyVoice v2 (REST)',
    modelId: 'cosyvoice-v2',
    endpoint: '/api/v1/services/aigc/text2audio/generation',
    payload: { model: 'cosyvoice-v2', input: { text: 'Hello world' } },
    category: 'tts',
  },
  // CosyVoice via OpenAI-compatible endpoint (some models support this)
  {
    name: 'CosyVoice v3 Flash (OpenAI-compat)',
    modelId: 'cosyvoice-v3-flash',
    endpoint: '/compatible-mode/v1/audio/speech',
    payload: { model: 'cosyvoice-v3-flash', input: 'Hello world test', voice: 'alloy' },
    useOpenAICompat: true,
    category: 'tts',
  },

  // === STT ===
  {
    name: 'Paraformer STT',
    modelId: 'paraformer-v2',
    endpoint: '/api/v1/services/audio/asr/transcription',
    payload: { model: 'paraformer-v2', input: { file_urls: ['https://dashscope.oss-cn-beijing.aliyuncs.com/audios/welcome.wav'] } },
    category: 'stt',
  },
  // SenseVoice — newer STT model that might be available internationally
  {
    name: 'SenseVoice STT',
    modelId: 'sensevoice-v1',
    endpoint: '/api/v1/services/audio/asr/transcription',
    payload: { model: 'sensevoice-v1', input: { file_urls: ['https://dashscope.oss-cn-beijing.aliyuncs.com/audios/welcome.wav'] } },
    category: 'stt',
  },
];

interface EndpointConfig {
  name: string;
  baseUrl: string;
  keyName: string;
}

const ENDPOINTS: EndpointConfig[] = [
  { name: 'China (Beijing)', baseUrl: 'https://dashscope.aliyuncs.com', keyName: 'ALIBABA_CHINA_API_KEY' },
  { name: 'Singapore (Intl)', baseUrl: 'https://dashscope-intl.aliyuncs.com', keyName: 'ALIBABA_SINGAPORE_API_KEY' },
  { name: 'Virginia (US)', baseUrl: 'https://dashscope-intl.aliyuncs.com', keyName: 'ALIBABA_API_KEY' },
];

async function testModel(model: ModelTest, endpoint: EndpointConfig): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get(endpoint.keyName);
  if (!apiKey) {
    return { model: model.name, modelId: model.modelId, endpoint: endpoint.name, category: model.category, status: 'no_key', error: `${endpoint.keyName} not set` };
  }

  const url = `${endpoint.baseUrl}${model.endpoint}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  // Add async header for media generation (not LLM, not ASR)
  if (!model.useOpenAICompat && !model.endpoint.includes('asr') && !model.endpoint.includes('audio/speech')) {
    headers['X-DashScope-Async'] = 'enable';
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(model.payload), signal: controller.signal });
    clearTimeout(timeout);

    const text = await response.text();
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(text); } catch { data = { raw: text.substring(0, 300) }; }

    const requestId = (data.request_id || response.headers.get('x-request-id') || '') as string;
    const errorCode = (data.code || '') as string;
    const errorMessage = ((data.message || '') as string).substring(0, 250);

    let status: string;
    if (response.ok || response.status === 200) {
      status = '✅ SUCCESS';
    } else if (response.status === 403) {
      status = errorMessage.includes('asynchronous') ? '⚠️ ASYNC_NOT_SUPPORTED' : '🔒 ACCESS_DENIED';
    } else if (response.status === 400 && (errorMessage.includes('Model not exist') || errorMessage.includes('not found') || errorMessage.includes('does not exist'))) {
      status = '❌ MODEL_NOT_FOUND';
    } else if (response.status === 400 && errorMessage.includes('url error')) {
      status = '⚠️ WRONG_API_PATH';
    } else if (response.status === 400) {
      status = `⚠️ BAD_REQUEST`;
    } else if (response.status === 401) {
      status = '🔑 AUTH_ERROR';
    } else if (response.status === 404) {
      status = '❌ NOT_FOUND_404';
    } else {
      status = `⚠️ HTTP_${response.status}`;
    }

    return {
      model: model.name, modelId: model.modelId, endpoint: endpoint.name, category: model.category,
      status, httpStatus: response.status,
      errorCode: errorCode || undefined,
      errorMessage: errorMessage || undefined,
      requestId: requestId || undefined,
    };
  } catch (err) {
    return {
      model: model.name, modelId: model.modelId, endpoint: endpoint.name, category: model.category,
      status: '💥 NETWORK_ERROR', error: err instanceof Error ? err.message : 'Unknown',
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const totalTests = MODELS_TO_TEST.length * ENDPOINTS.length;
    console.log(`Diagnostics: ${MODELS_TO_TEST.length} models × ${ENDPOINTS.length} endpoints = ${totalTests} tests`);

    const results = [];
    for (const model of MODELS_TO_TEST) {
      const modelResults = await Promise.all(ENDPOINTS.map(ep => testModel(model, ep)));
      results.push(...modelResults);
    }

    // Availability matrix
    const matrix: Record<string, Record<string, string>> = {};
    for (const r of results) {
      const name = r.model as string;
      if (!matrix[name]) matrix[name] = {};
      matrix[name][r.endpoint as string] = r.status as string;
    }

    // Category summary
    const categories: Record<string, { success: number; total: number }> = {};
    for (const r of results) {
      const cat = (r.category as string) || 'unknown';
      if (!categories[cat]) categories[cat] = { success: 0, total: 0 };
      categories[cat].total++;
      if ((r.status as string).includes('SUCCESS')) categories[cat].success++;
    }

    const successCount = results.filter(r => (r.status as string).includes('SUCCESS')).length;

    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: `${successCount}/${totalTests} tests passed`,
      categorySummary: categories,
      availabilityMatrix: matrix,
      detailedResults: results,
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Diagnostics error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
