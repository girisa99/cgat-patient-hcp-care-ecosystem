import { useCallback, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIServiceHealthStatus {
  providers: {
    openai: boolean;
    claude: boolean;
    gemini: boolean;
  };
  functions: {
    checkAIProvider: boolean;
    generateAgentFromPrompt: boolean;
    aiUniversalProcessor: boolean;
  };
  overallHealthy: boolean;
  lastChecked?: string;
  errorDetails?: Record<string, string>;
}

const initialStatus: AIServiceHealthStatus = {
  providers: { openai: false, claude: false, gemini: false },
  functions: { checkAIProvider: false, generateAgentFromPrompt: false, aiUniversalProcessor: false },
  overallHealthy: false,
  lastChecked: undefined,
  errorDetails: {}
};

export const useAIServiceHealth = () => {
  const [status, setStatus] = useState<AIServiceHealthStatus>(initialStatus);
  const [checking, setChecking] = useState(false);

  const checkFunction = useCallback(async (name: string, body: any) => {
    try {
      const { error } = await supabase.functions.invoke(name as any, { body });
      return !error;
    } catch (e) {
      return false;
    }
  }, []);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    const errors: Record<string, string> = {};

    // 1) Check provider availability via check-ai-provider
    const providers: AIServiceHealthStatus['providers'] = { openai: false, claude: false, gemini: false };
    let checkAIProviderOK = false;
    try {
      const providersToCheck: Array<'openai' | 'claude' | 'gemini'> = ['openai', 'claude', 'gemini'];
      const results = await Promise.all(
        providersToCheck.map(async (p) => {
          try {
            const { data, error } = await supabase.functions.invoke('check-ai-provider', { body: { provider: p } });
            if (error) throw error;
            return { p, ok: !!data?.available };
          } catch (err: any) {
            errors[`check-ai-provider:${p}`] = err?.message || 'invoke failed';
            return { p, ok: false };
          }
        })
      );
      results.forEach(r => { (providers as any)[r.p] = r.ok; });
      checkAIProviderOK = results.some(r => r.ok);
    } catch (e: any) {
      errors['check-ai-provider'] = e?.message || 'invoke failed';
    }

    // 2) Check generate-agent-from-prompt
    const generateAgentFromPrompt = await checkFunction('generate-agent-from-prompt', {
      prompt: 'health-check',
      provider: 'openai',
      generateConnections: false,
      includeTemplates: false
    });
    if (!generateAgentFromPrompt) {
      errors['generate-agent-from-prompt'] = 'unavailable';
    }

    // 3) Check ai-universal-processor
    const aiUniversalProcessor = await checkFunction('ai-universal-processor', {
      action: 'health_check',
      provider: 'openai',
      prompt: 'ping'
    });
    if (!aiUniversalProcessor) {
      errors['ai-universal-processor'] = 'unavailable';
    }

    const updated: AIServiceHealthStatus = {
      providers,
      functions: {
        checkAIProvider: checkAIProviderOK,
        generateAgentFromPrompt,
        aiUniversalProcessor
      },
      overallHealthy: (providers.openai || providers.claude || providers.gemini) && generateAgentFromPrompt && aiUniversalProcessor,
      lastChecked: new Date().toISOString(),
      errorDetails: errors
    };

    setStatus(updated);
    setChecking(false);
    return updated;
  }, [checkFunction]);

  const healthyProviders = useMemo(() =>
    Object.entries(status.providers)
      .filter(([, ok]) => ok)
      .map(([k]) => k.toUpperCase())
  , [status.providers]);

  return {
    status,
    checking,
    healthyProviders,
    checkHealth,
  };
};