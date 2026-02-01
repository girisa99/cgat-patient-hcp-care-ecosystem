import { corsHeaders } from '../_shared/cors.ts';

/**
 * Check AI Provider Availability
 * 
 * Checks which AI providers are configured based on available secrets.
 * Used by UniversalAIHub to determine fallback chains.
 */

// Provider secret mappings - Core 15 Providers (Updated 2026-01-30)
const PROVIDER_SECRETS: Record<string, string[]> = {
  // ═══════════════════════════════════════════════════════════════
  // TIER 1: PRIMARY PROVIDERS (Verified Configured)
  // ═══════════════════════════════════════════════════════════════
  
  // LLM & Multimodal
  openai: ['OPENAI_API_KEY'],           // GPT-5, DALL-E 3, Whisper, TTS
  claude: ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY'], // Claude 4 - Literary, West Zone
  gemini: ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'LOVABLE_API_KEY'], // Gemini 3 - India/SEA Zone
  deepseek: ['DEEPSEEK_API_KEY'],       // CJK optimized LLM & Vision (low cost)
  alibaba: ['ALIBABA_API_KEY'],         // Qwen, CosyVoice, Paraformer, WAN 2.2 Avatar
  
  // STT - Speech-to-Text
  deepgram: ['DEEPGRAM_API_KEY'],       // PRIMARY STT - <100ms real-time latency
  
  // Video Generation
  sora2api: ['SORA2API_KEY'],           // PRIMARY Video - Cinematic via sora2api.org
  vertex: ['GOOGLE_VERTEX_SERVICE_ACCOUNT'], // Google Vertex AI - Veo 2/3, Imagen 3
  
  // Audio & Voice
  elevenlabs: ['ELEVENLABS_API_KEY'],   // PRIMARY TTS + Music + SFX + Voice Clone
  
  // Translation
  deepl: ['DEEPL_API_KEY'],             // PRIMARY Translation - European languages
  
  // ═══════════════════════════════════════════════════════════════
  // TIER 2: SPECIALIZED PROVIDERS
  // ═══════════════════════════════════════════════════════════════
  
  // Azure Services (TTS, STT, OCR, Translation)
  azure: ['AZURE_SPEECH_KEY', 'AZURE_FORM_RECOGNIZER_KEY', 'MICROSOFT_TRANSLATE_API_KEY'],
  
  // Google Cloud (TTS, STT, Translation, Vision)
  google: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
  
  // Image & Video Generation
  modelslab: ['MODELSLAB_API_KEY'],     // PRIMARY Image (FLUX), AnimateDiff, SVD
  replicate: ['REPLICATE_API_TOKEN'],   // Open-source models fallback
  
  // 3D Generation
  meshy: ['MESHY_API_KEY'],             // PRIMARY 3D - PBR textures, rigging, USDZ
  
  // Open-source fallback
  huggingface: ['HUGGING_FACE_ACCESS_TOKEN'],
  
  // ═══════════════════════════════════════════════════════════════
  // NOT CONFIGURED (Excluded from routing)
  // ═══════════════════════════════════════════════════════════════
  // HeyGen: No HEYGEN_API_KEY → Use Alibaba WAN 2.2 for avatars
  // Suno: No SUNO_API_KEY → Use ElevenLabs for music
  // RunPod: No RUNPOD_API_KEY → Use ModelsLab/Meshy for GPU tasks
  // AWS: Not required → Use Azure
  // Stability: Not required → Use ModelsLab (same models, lower cost)
};

// Provider capabilities mapping - Core 15 (Updated 2026-01-30)
const PROVIDER_CAPABILITIES: Record<string, string[]> = {
  // TIER 1: PRIMARY PROVIDERS
  openai: ['llm', 'translation', 'tts', 'stt', 'image_gen', 'vision', 'nlp'],
  claude: ['llm', 'translation', 'vision', 'nlp', 'long_context'],
  gemini: ['llm', 'translation', 'ocr', 'tts', 'stt', 'image_gen', 'vision', 'nlp'],
  deepgram: ['stt', 'realtime_stt'],  // PRIMARY STT - <100ms latency
  deepseek: ['llm', 'translation', 'ocr', 'vision', 'nlp'],
  alibaba: ['llm', 'translation', 'ocr', 'tts', 'stt', 'image_gen', 'video_gen', 'vision', 'nlp', 'avatar', 'lipsync'],
  sora2api: ['video_gen', 'cinematic', 'realistic', 'commercial'],  // PRIMARY Video
  vertex: ['video_gen', 'image_gen', 'veo', 'imagen'],  // Vertex AI - Veo 2/3, Imagen 3
  elevenlabs: ['tts', 'voice_clone', 'sfx_gen', 'music_gen'],  // PRIMARY TTS + Music
  deepl: ['translation'],  // PRIMARY Translation
  
  // TIER 2: SPECIALIZED PROVIDERS
  azure: ['tts', 'stt', 'ocr', 'vision', 'translation', 'visemes'],
  google: ['tts', 'stt', 'ocr', 'vision', 'translation', 'nlp'],
  modelslab: ['image_gen', 'video_gen', 'animation', 'animatediff', 'svd'],  // PRIMARY Image
  meshy: ['3d_gen', 'texturing', 'rigging'],  // PRIMARY 3D
  replicate: ['image_gen', 'video_gen', '3d_gen'],
  huggingface: ['llm', 'image_gen', 'nlp'],
};

function checkProviderAvailable(provider: string): boolean {
  const secrets = PROVIDER_SECRETS[provider];
  if (!secrets || secrets.length === 0) return false;
  
  // Check if ANY of the required secrets exist
  return secrets.some(secret => {
    const value = Deno.env.get(secret);
    return value && value.length > 0;
  });
}

function getAllProvidersStatus(): Record<string, { 
  available: boolean; 
  capabilities: string[];
  missingSecrets?: string[];
}> {
  const result: Record<string, { 
    available: boolean; 
    capabilities: string[];
    missingSecrets?: string[];
  }> = {};
  
  for (const [provider, secrets] of Object.entries(PROVIDER_SECRETS)) {
    const available = checkProviderAvailable(provider);
    const capabilities = available ? (PROVIDER_CAPABILITIES[provider] || []) : [];
    const missingSecrets = available ? undefined : secrets;
    
    result[provider] = { available, capabilities, missingSecrets };
  }
  
  return result;
}

function getCapabilitySummary(): Record<string, string[]> {
  const summary: Record<string, string[]> = {};
  const allProviders = getAllProvidersStatus();
  
  // Group providers by capability
  for (const [provider, status] of Object.entries(allProviders)) {
    if (!status.available) continue;
    
    for (const capability of status.capabilities) {
      if (!summary[capability]) summary[capability] = [];
      summary[capability].push(provider);
    }
  }
  
  return summary;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { provider, action } = body;

    // Check all providers
    if (action === 'check_all' || action === 'list_all') {
      const providers = getAllProvidersStatus();
      const capabilities = getCapabilitySummary();
      
      // Count configured vs not configured
      const configured = Object.values(providers).filter(p => p.available).length;
      const total = Object.keys(providers).length;
      
      console.log(`[check-ai-provider] All providers check: ${configured}/${total} configured`);
      
      return new Response(JSON.stringify({ 
        providers,
        capabilities,
        summary: {
          configured,
          total,
          percentage: Math.round((configured / total) * 100),
        },
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check by capability
    if (action === 'check_capability') {
      const { capability } = body;
      const capabilities = getCapabilitySummary();
      const availableProviders = capabilities[capability] || [];
      
      console.log(`[check-ai-provider] Capability ${capability}: ${availableProviders.length} providers`);
      
      return new Response(JSON.stringify({ 
        capability,
        providers: availableProviders,
        available: availableProviders.length > 0,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check single provider
    if (provider) {
      const available = checkProviderAvailable(provider);
      const capabilities = available ? (PROVIDER_CAPABILITIES[provider] || []) : [];
      
      console.log(`[check-ai-provider] Provider ${provider}: ${available ? 'AVAILABLE' : 'NOT CONFIGURED'}`);

      return new Response(JSON.stringify({ 
        provider, 
        available,
        capabilities,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Default: return all providers
    const providers = getAllProvidersStatus();
    return new Response(JSON.stringify({ 
      providers,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[check-ai-provider] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Provider check failed',
        available: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});