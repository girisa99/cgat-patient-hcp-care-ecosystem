import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModelTest {
  name: string;
  modelId: string;
  endpoint: string; // full URL path
  payload: Record<string, unknown>;
  headers?: Record<string, string>;
  category: string;
  useOpenAICompat?: boolean; // use /compatible-mode/v1/chat/completions
}

// Corrected API paths per Alibaba DashScope docs
const MODELS_TO_TEST: ModelTest[] = [
  // === CURRENTLY WORKING ===
  {
    name: 'Qwen LLM (qwen-max)',
    modelId: 'qwen-max',
    endpoint: '/compatible-mode/v1/chat/completions',
    payload: {
      model: 'qwen-max',
      messages: [{ role: 'user', content: 'Say OK' }],
      max_tokens: 5,
    },
    useOpenAICompat: true,
    category: 'working',
  },
  {
    name: 'Paraformer STT',
    modelId: 'paraformer-v2',
    endpoint: '/api/v1/services/audio/asr/transcription',
    payload: {
      model: 'paraformer-v2',
      input: {
        file_urls: ['https://dashscope.oss-cn-beijing.aliyuncs.com/audios/welcome.wav'],
      },
    },
    category: 'working',
  },
  {
    name: 'Wan 2.6 Video (T2V)',
    modelId: 'wan2.6-t2v',
    endpoint: '/api/v1/services/aigc/video-generation/generation',
    payload: {
      model: 'wan2.6-t2v',
      input: { prompt: 'A calm ocean wave' },
      parameters: { size: '1280*720', duration: 5 },
    },
    category: 'working',
  },
  // === PENDING ACTIVATION / CHINA-ONLY ===
  {
    name: 'Sambert TTS (Female)',
    modelId: 'sambert-zhichu-v1',
    endpoint: '/api/v1/services/aigc/text2audio/generation',
    payload: {
      model: 'sambert-zhichu-v1',
      input: { text: '你好世界' },
    },
    category: 'pending',
  },
  {
    name: 'Sambert TTS (Male)',
    modelId: 'sambert-zhide-v1',
    endpoint: '/api/v1/services/aigc/text2audio/generation',
    payload: {
      model: 'sambert-zhide-v1',
      input: { text: '你好世界' },
    },
    category: 'pending',
  },
  {
    name: 'Wanx Image Gen',
    modelId: 'wanx-v1',
    endpoint: '/api/v1/services/aigc/text2image/image-synthesis',
    payload: {
      model: 'wanx-v1',
      input: { prompt: 'A simple flower' },
      parameters: { size: '512*512', n: 1 },
    },
    category: 'pending',
  },
  {
    name: 'Wan 2.1 Video (T2V Turbo)',
    modelId: 'wan2.1-t2v-turbo',
    endpoint: '/api/v1/services/aigc/video-generation/generation',
    payload: {
      model: 'wan2.1-t2v-turbo',
      input: { prompt: 'A simple test' },
      parameters: { size: '1280*720' },
    },
    category: 'pending',
  },
  {
    name: 'Wan 2.1 Video (T2V Plus)',
    modelId: 'wan2.1-t2v-plus',
    endpoint: '/api/v1/services/aigc/video-generation/generation',
    payload: {
      model: 'wan2.1-t2v-plus',
      input: { prompt: 'A simple test' },
      parameters: { size: '1280*720' },
    },
    category: 'pending',
  },
  {
    name: 'Wan 2.2 Avatar (S2V)',
    modelId: 'wan2.2-s2v',
    endpoint: '/api/v1/services/aigc/video-generation/generation',
    payload: {
      model: 'wan2.2-s2v',
      input: { prompt: 'A person talking' },
    },
    category: 'pending',
  },
  {
    name: 'Wanx 2.1 Image',
    modelId: 'wanx2.1-t2i-turbo',
    endpoint: '/api/v1/services/aigc/text2image/image-synthesis',
    payload: {
      model: 'wanx2.1-t2i-turbo',
      input: { prompt: 'A flower' },
      parameters: { size: '1024*1024', n: 1 },
    },
    category: 'pending',
  },
  // === ADVANCED MEDIA (likely need rep activation) ===
  {
    name: 'CosyVoice TTS (sync test)',
    modelId: 'cosyvoice-v1',
    endpoint: '/api/v1/services/aigc/text2audio/generation',
    payload: {
      model: 'cosyvoice-v1',
      input: { text: '你好世界' },
    },
    category: 'advanced',
  },
  {
    name: 'Qwen VL (Vision)',
    modelId: 'qwen-vl-max',
    endpoint: '/compatible-mode/v1/chat/completions',
    payload: {
      model: 'qwen-vl-max',
      messages: [{ role: 'user', content: 'Say OK' }],
      max_tokens: 5,
    },
    useOpenAICompat: true,
    category: 'working',
  },
  {
    name: 'Qwen Audio',
    modelId: 'qwen2-audio-instruct',
    endpoint: '/compatible-mode/v1/chat/completions',
    payload: {
      model: 'qwen2-audio-instruct',
      messages: [{ role: 'user', content: 'Say OK' }],
      max_tokens: 5,
    },
    useOpenAICompat: true,
    category: 'working',
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
  { name: 'Virginia (Intl)', baseUrl: 'https://dashscope-intl.aliyuncs.com', keyName: 'ALIBABA_API_KEY' },
];

async function testModel(
  model: ModelTest,
  endpoint: EndpointConfig,
): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get(endpoint.keyName);
  
  if (!apiKey) {
    return {
      model: model.name, modelId: model.modelId, endpoint: endpoint.name,
      status: 'no_key', error: `${endpoint.keyName} not set`,
    };
  }

  const url = `${endpoint.baseUrl}${model.endpoint}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  // Only add async for non-LLM models (video, image, audio gen)
  if (!model.useOpenAICompat && !model.endpoint.includes('asr')) {
    headers['X-DashScope-Async'] = 'enable';
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(model.payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const text = await response.text();
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(text); } catch { data = { raw: text.substring(0, 300) }; }

    const requestId = (data.request_id || response.headers.get('x-request-id') || '') as string;
    const errorCode = (data.code || '') as string;
    const errorMessage = ((data.message || '') as string).substring(0, 200);

    let status: string;
    if (response.ok || response.status === 200) {
      status = '✅ SUCCESS';
    } else if (response.status === 403) {
      status = errorMessage.includes('asynchronous') ? '⚠️ ASYNC_NOT_SUPPORTED' : '🔒 ACCESS_DENIED';
    } else if (response.status === 400 && errorMessage.includes('Model not exist')) {
      status = '❌ MODEL_NOT_FOUND';
    } else if (response.status === 400 && errorMessage.includes('url error')) {
      status = '⚠️ WRONG_API_PATH';
    } else if (response.status === 401) {
      status = '🔑 AUTH_ERROR';
    } else {
      status = `⚠️ HTTP_${response.status}`;
    }

    return {
      model: model.name,
      modelId: model.modelId,
      endpoint: endpoint.name,
      status,
      httpStatus: response.status,
      errorCode: errorCode || undefined,
      errorMessage: errorMessage || undefined,
      requestId: requestId || undefined,
    };
  } catch (err) {
    return {
      model: model.name, modelId: model.modelId, endpoint: endpoint.name,
      status: '💥 NETWORK_ERROR',
      error: err instanceof Error ? err.message : 'Unknown',
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`Starting diagnostics: ${MODELS_TO_TEST.length} models × ${ENDPOINTS.length} endpoints = ${MODELS_TO_TEST.length * ENDPOINTS.length} tests`);

    const results = [];
    for (const model of MODELS_TO_TEST) {
      const modelResults = await Promise.all(
        ENDPOINTS.map(ep => testModel(model, ep))
      );
      results.push(...modelResults);
    }

    // Build availability matrix
    const matrix: Record<string, Record<string, string>> = {};
    for (const r of results) {
      const name = r.model as string;
      if (!matrix[name]) matrix[name] = {};
      matrix[name][r.endpoint as string] = r.status as string;
    }

    // Summary counts
    const successCount = results.filter(r => (r.status as string).includes('SUCCESS')).length;
    const totalTests = results.length;

    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: `${successCount}/${totalTests} tests passed`,
      availabilityMatrix: matrix,
      detailedResults: results,
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Diagnostics error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
