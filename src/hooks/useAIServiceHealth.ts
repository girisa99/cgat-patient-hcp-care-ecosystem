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

    // 1) Check provider availability via ai-universal-processor health_check
    const providers: AIServiceHealthStatus['providers'] = { openai: false, claude: false, gemini: false };
    let checkAIProviderOK = false;
    try {
      const providersToCheck: Array<'openai' | 'claude' | 'gemini'> = ['openai', 'claude', 'gemini'];
      const results = await Promise.all(
        providersToCheck.map(async (p) => {
          try {
            const { data, error } = await supabase.functions.invoke('ai-universal-processor', { body: { action: 'health_check', provider: p } });
            if (error) throw error;
            const ok = !!data && data.status === 'ok';
            return { p, ok };
          } catch (err: any) {
            errors[`ai-universal-processor:${p}`] = err?.message || 'invoke failed';
            return { p, ok: false };
          }
        })
      );
      results.forEach(r => { (providers as any)[r.p] = r.ok; });
      checkAIProviderOK = results.some(r => r.ok);
    } catch (e: any) {
      errors['ai-universal-processor'] = e?.message || 'invoke failed';
    }

    // 2) Check ai-universal-processor ping
    const generateAgentFromPrompt = await checkFunction('ai-universal-processor', {
      action: 'ping'
    });

    // 3) ai-universal-processor availability (already covered but keep flag)
    const aiUniversalProcessor = checkAIProviderOK || generateAgentFromPrompt;

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