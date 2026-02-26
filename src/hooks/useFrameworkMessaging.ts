/**
 * useFrameworkMessaging Hook
 * 
 * Provides framework-aware messaging for Genie Cast production pipeline.
 * Connects audience selection → framework matrix → script composition → thumbnails.
 * 
 * Includes provider-aware character limits and warnings for TTS generation.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  frameworkMessagingEngine,
  type AudienceSegment,
  type AudienceMessaging,
  type FrameworkScriptComposition,
  type FrameworkConfig,
  AUDIENCE_FRAMEWORK_MATRIX,
  PRODUCT_MESSAGING,
  PROVIDER_CHAR_LIMITS,
} from '@/services/marketing/frameworkMessagingEngine';
import type { PoweredByData } from '@/components/genie-cast/PoweredByEndCard';

interface UseFrameworkMessagingReturn {
  // State
  selectedAudience: AudienceSegment | null;
  messaging: AudienceMessaging | null;
  scriptComposition: FrameworkScriptComposition | null;
  framework: FrameworkConfig | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  selectAudience: (segment: AudienceSegment) => Promise<void>;
  composeScript: (productId: string, sceneCount?: number) => Promise<FrameworkScriptComposition>;
  generateThumbnailPrompt: (productId: string, sceneIndex?: number) => string;
  getPoweredByData: (generationTimeSec?: number) => PoweredByData;
  saveMessaging: (productId?: string) => Promise<void>;
  recordChain: (config: {
    videoId?: string;
    blueprintId?: string;
    generationTimeSec: number;
    credits: number;
  }) => Promise<void>;

  // Utilities
  audienceSegments: AudienceSegment[];
  productList: typeof PRODUCT_MESSAGING;
  frameworkMatrix: typeof AUDIENCE_FRAMEWORK_MATRIX;
  getProviderLimits: (provider: string) => { soft: number; hard: number; warning: string };
}

export function useFrameworkMessaging(): UseFrameworkMessagingReturn {
  const [selectedAudience, setSelectedAudience] = useState<AudienceSegment | null>(null);
  const [messaging, setMessaging] = useState<AudienceMessaging | null>(null);
  const [scriptComposition, setScriptComposition] = useState<FrameworkScriptComposition | null>(null);
  const [framework, setFramework] = useState<FrameworkConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audienceSegments = useMemo<AudienceSegment[]>(() => [
    'solo_creators', 'content_agencies', 'smb_marketing', 'enterprise_marketing',
    'healthcare', 'education', 'finance', 'real_estate', 'travel', 'retail',
    'saas_product', 'hr_training', 'legal_compliance', 'nonprofit',
    'influencers', 'podcasters', 'coaches', 'ecommerce', 'government', 'media',
  ], []);

  const selectAudience = useCallback(async (segment: AudienceSegment) => {
    setIsLoading(true);
    setError(null);
    try {
      setSelectedAudience(segment);
      const fw = frameworkMessagingEngine.getFrameworkForAudience(segment);
      setFramework(fw);
      const msg = await frameworkMessagingEngine.getAudienceMessaging(segment);
      setMessaging(msg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messaging');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const composeScript = useCallback(async (
    productId: string,
    sceneCount: number = 4
  ): Promise<FrameworkScriptComposition> => {
    if (!selectedAudience) throw new Error('Select an audience first');
    setIsLoading(true);
    try {
      const composition = await frameworkMessagingEngine.composeFrameworkScript(
        selectedAudience, productId, sceneCount
      );
      setScriptComposition(composition);
      return composition;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAudience]);

  const generateThumbnailPrompt = useCallback((productId: string, sceneIndex: number = 0): string => {
    if (!selectedAudience) return `Professional thumbnail for ${productId}`;
    return frameworkMessagingEngine.generateThumbnailPrompt(selectedAudience, productId, sceneIndex);
  }, [selectedAudience]);

  const getPoweredByData = useCallback((generationTimeSec?: number): PoweredByData => {
    if (!scriptComposition) {
      return {
        products: [{ id: 'cast', name: 'Genie Cast', tagline: 'Make It. Show It. Scale It.', role: 'Distribution Engine', icon: '📡' }],
        models: [{ task: 'llm', model: 'Gemini 3.0' }],
        ecosystemMessage: 'Powered by Genie Ecosystem',
        generationTimeSec,
      };
    }

    const products = scriptComposition.poweredByProducts.map(id => ({
      id,
      name: PRODUCT_MESSAGING[id]?.name || id,
      tagline: PRODUCT_MESSAGING[id]?.tagline || '',
      role: PRODUCT_MESSAGING[id]?.role || '',
      icon: PRODUCT_MESSAGING[id]?.icon || '✨',
    }));

    const models = Object.entries(scriptComposition.poweredByModels).map(([task, model]) => ({ task, model }));

    return {
      products,
      models,
      ecosystemMessage: `Built with ${products.length} Genie products and ${models.length} AI models`,
      generationTimeSec,
      frameworkUsed: scriptComposition.frameworkUsed,
      audienceSegment: selectedAudience || undefined,
    };
  }, [scriptComposition, selectedAudience]);

  const saveMessaging = useCallback(async (productId?: string) => {
    if (!messaging) return;
    await frameworkMessagingEngine.saveMessagingToDatabase(messaging, productId);
  }, [messaging]);

  const recordChain = useCallback(async (config: {
    videoId?: string;
    blueprintId?: string;
    generationTimeSec: number;
    credits: number;
  }) => {
    if (!selectedAudience || !scriptComposition) return;
    await frameworkMessagingEngine.recordProductChain({
      ...config,
      productsUsed: scriptComposition.poweredByProducts,
      aiModels: scriptComposition.poweredByModels,
      audience: selectedAudience,
      framework: scriptComposition.frameworkUsed,
    });
  }, [selectedAudience, scriptComposition]);

  const getProviderLimits = useCallback((provider: string) => {
    return PROVIDER_CHAR_LIMITS[provider] || PROVIDER_CHAR_LIMITS.default;
  }, []);

  return {
    selectedAudience,
    messaging,
    scriptComposition,
    framework,
    isLoading,
    error,
    selectAudience,
    composeScript,
    generateThumbnailPrompt,
    getPoweredByData,
    saveMessaging,
    recordChain,
    audienceSegments,
    productList: PRODUCT_MESSAGING,
    frameworkMatrix: AUDIENCE_FRAMEWORK_MATRIX,
    getProviderLimits,
  };
}
