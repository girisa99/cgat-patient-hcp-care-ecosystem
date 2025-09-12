import { supabase } from '@/integrations/supabase/client';

export const checkProviderAvailability = async (provider: string): Promise<{ available: boolean; timestamp: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('check-ai-provider', {
      body: { provider }
    });

    if (error) {
      console.error(`Provider check error for ${provider}:`, error);
      return { available: false, timestamp: new Date().toISOString() };
    }

    return data;
  } catch (error) {
    console.error(`Provider check failed for ${provider}:`, error);
    return { available: false, timestamp: new Date().toISOString() };
  }
};

export const verifyAllProviders = async (): Promise<{
  openai: boolean;
  huggingface: boolean;
  claude: boolean;
  gemini: boolean;
}> => {
  const providers = ['openai', 'huggingface', 'claude', 'gemini'] as const;
  const results = await Promise.all(
    providers.map(async (provider) => {
      const result = await checkProviderAvailability(provider);
      return { provider, available: result.available };
    })
  );

  return results.reduce((acc, { provider, available }) => {
    (acc as any)[provider] = available;
    return acc;
  }, {
    openai: false,
    huggingface: false,
    claude: false,
    gemini: false
  } as { openai: boolean; huggingface: boolean; claude: boolean; gemini: boolean });
};