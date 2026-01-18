import { corsHeaders } from '../_shared/cors.ts';

/**
 * Check AI Provider Availability
 * 
 * Checks which AI providers are configured based on available secrets.
 * Used by UniversalAIHub to determine fallback chains.
 */

// Provider secret mappings
const PROVIDER_SECRETS: Record<string, string[]> = {
  openai: ['OPENAI_API_KEY'],
  claude: ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY'],
  gemini: ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'LOVABLE_API_KEY'],
  deepseek: ['DEEPSEEK_API_KEY'],
  alibaba: ['ALIBABA_API_KEY'],
  azure: ['AZURE_OPENAI_KEY'],
  azure_speech: ['AZURE_SPEECH_KEY'],
  azure_doc_intel: ['AZURE_FORM_RECOGNIZER_KEY'],
  aws: ['AWS_ACCESS_KEY_ID'],
  deepl: ['DEEPL_API_KEY'],
  elevenlabs: ['ELEVENLABS_API_KEY'],
  google: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
  replicate: ['REPLICATE_API_TOKEN'],
  stability: ['STABILITY_API_KEY'],
  huggingface: ['HUGGING_FACE_ACCESS_TOKEN'],
  microsoft: ['MICROSOFT_TRANSLATE_API_KEY'],
  lovable: ['LOVABLE_API_KEY'],
  cohere: ['COHERE_API_KEY'],
  assemblyai: ['ASSEMBLYAI_API_KEY'],
  suno: ['SUNO_API_KEY'],
  runway: ['RUNWAY_API_KEY'],
};

// Provider capabilities mapping
const PROVIDER_CAPABILITIES: Record<string, string[]> = {
  openai: ['llm', 'translation', 'tts', 'stt', 'image_gen', 'vision', 'nlp', 'moderation'],
  claude: ['llm', 'translation', 'vision', 'nlp'],
  gemini: ['llm', 'translation', 'ocr', 'tts', 'image_gen', 'vision', 'nlp'],
  deepseek: ['llm', 'translation', 'ocr', 'vision', 'nlp'],
  alibaba: ['llm', 'translation', 'ocr', 'tts', 'stt', 'image_gen', 'video_gen', 'vision', 'nlp'],
  azure: ['llm', 'vision', 'image_gen'],
  azure_speech: ['tts', 'stt'],
  azure_doc_intel: ['ocr'],
  aws: ['llm', 'translation', 'ocr', 'tts', 'stt', 'image_gen', 'vision', 'nlp', 'moderation'],
  deepl: ['translation'],
  elevenlabs: ['tts', 'music_gen', 'sfx_gen'],
  google: ['translation', 'ocr', 'tts', 'stt', 'vision', 'nlp'],
  replicate: ['image_gen', 'video_gen'],
  stability: ['image_gen'],
  huggingface: ['llm', 'image_gen', 'nlp'],
  microsoft: ['translation'],
  lovable: ['llm', 'image_gen'],
  cohere: ['llm', 'nlp'],
  assemblyai: ['stt'],
  suno: ['music_gen'],
  runway: ['video_gen'],
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