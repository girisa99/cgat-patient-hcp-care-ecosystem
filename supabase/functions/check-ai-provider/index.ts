import { corsHeaders } from '../_shared/cors.ts';

/**
 * Check AI Provider Availability
 * 
 * Checks which AI providers are configured based on available secrets.
 * Used by UniversalAIHub to determine fallback chains.
 */

// Provider secret mappings - Core 12+ Providers
const PROVIDER_SECRETS: Record<string, string[]> = {
  // LLM & Multimodal Providers
  openai: ['OPENAI_API_KEY'],           // GPT-4o, Whisper STT, DALL-E 3
  claude: ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY'], // Long context, narrative
  gemini: ['GEMINI_API_KEY', 'GOOGLE_API_KEY'],    // Vision, 1M context
  deepseek: ['DEEPSEEK_API_KEY'],       // CJK optimized LLM & Vision
  alibaba: ['ALIBABA_API_KEY'],         // Qwen, CosyVoice, WAN 2.2 Avatar
  
  // Video Generation
  sora2api: ['SORA2API_KEY'],           // Sora-like video via sora2api.ai
  
  // GCP - Google Cloud Platform (OAuth, Calendar, Vision, STT/TTS)
  gcp: ['GOOGLE_API_KEY', 'GCP_SERVICE_ACCOUNT_KEY'],
  
  // Azure Services
  azure: ['AZURE_OPENAI_KEY'],          // Azure OpenAI
  azure_speech: ['AZURE_SPEECH_KEY'],   // Neural TTS, STT, Visemes
  azure_doc_intel: ['AZURE_FORM_RECOGNIZER_KEY'], // OCR, Document Intelligence
  
  // Media & Creative Providers
  modelslab: ['MODELSLAB_API_KEY'],     // FLUX, AnimateDiff, Video, 3D, Voice Clone
  meshy: ['MESHY_API_KEY'],             // Text-to-3D, Image-to-3D
  replicate: ['REPLICATE_API_TOKEN'],   // Open-source models fallback
  elevenlabs: ['ELEVENLABS_API_KEY'],   // Premium TTS, Voice Clone, SFX, Music
  
  // Translation
  deepl: ['DEEPL_API_KEY'],             // European languages
  microsoft: ['MICROSOFT_TRANSLATE_API_KEY'], // Azure Translator
  
  // Infrastructure
  supabase: ['SUPABASE_URL'],           // Auth, Database, Storage, Edge Functions
  stripe: ['STRIPE_SECRET_KEY'],        // Payments, Subscriptions
};

// Provider capabilities mapping
const PROVIDER_CAPABILITIES: Record<string, string[]> = {
  openai: ['llm', 'translation', 'tts', 'stt', 'image_gen', 'vision', 'nlp', 'moderation'],
  claude: ['llm', 'translation', 'vision', 'nlp', 'long_context'],
  gemini: ['llm', 'translation', 'ocr', 'tts', 'image_gen', 'vision', 'nlp'],
  deepseek: ['llm', 'translation', 'ocr', 'vision', 'nlp', 'stt'],
  alibaba: ['llm', 'translation', 'ocr', 'tts', 'stt', 'image_gen', 'video_gen', 'vision', 'nlp', 'avatar'],
  sora2api: ['video_gen', 'cinematic', 'premium_video'],
  gcp: ['oauth', 'calendar', 'vision', 'ocr', 'tts', 'stt', 'translation', 'nlp'],
  azure: ['llm', 'vision', 'image_gen'],
  azure_speech: ['tts', 'stt', 'visemes'],
  azure_doc_intel: ['ocr', 'document_analysis'],
  modelslab: ['image_gen', 'video_gen', '3d_gen', 'voice_clone', 'animation'],
  meshy: ['3d_gen', 'texturing'],
  replicate: ['image_gen', 'video_gen', '3d_gen'],
  elevenlabs: ['tts', 'voice_clone', 'sfx_gen', 'music_gen'],
  deepl: ['translation'],
  microsoft: ['translation'],
  supabase: ['auth', 'database', 'storage', 'edge_functions'],
  stripe: ['payments', 'subscriptions', 'invoicing'],
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