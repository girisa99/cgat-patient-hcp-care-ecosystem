/**
 * USE GENIE UNIVERSAL CONTEXT
 * 
 * React hook for cross-product context-aware guidance system.
 * Works across ALL Genie Studio products with consistent behavior.
 * 
 * Features:
 * - Product-specific flows and knowledge
 * - User journey tracking with deviation detection
 * - Context feeding to generation systems
 * - Language pairing aligned with voice/speech/text
 * - Native language guidance based on IP detection
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  genieUniversalContextService,
  GenieProductId,
  UniversalJourneyState,
  FlowGuidance,
  GenerationContext,
  SuggestedAction,
  PRODUCT_KNOWLEDGE,
  PRODUCT_FLOWS,
  getLanguagePairingInfo
} from '@/services/genieUniversalContextService';
import { detectCountryFromIP, LANGUAGE_VOICE_PAIRINGS } from '@/hooks/useAskGenieVoice';

interface UseGenieUniversalContextOptions {
  product: GenieProductId;
  onContextChange?: (context: GenerationContext) => void;
  autoDetectLanguage?: boolean;
}

interface UseGenieUniversalContextReturn {
  // Journey state
  journeyState: UniversalJourneyState | null;
  currentGuidance: FlowGuidance | null;
  
  // Actions
  initializeJourney: () => void;
  switchProduct: (product: GenieProductId) => void;
  startFlow: (flowId: string) => void;
  advanceStep: () => void;
  addContext: (key: string, value: any, type?: 'goal' | 'preference' | 'selection' | 'template' | 'visual' | 'language') => void;
  
  // Guidance
  generateGuidance: (message: string) => {
    response: string;
    suggestedActions: SuggestedAction[];
    shouldStartFlow?: string;
    contextToFeed?: GenerationContext;
  };
  
  // Product knowledge
  getProductOverview: (detail?: 'brief' | 'full' | 'architecture', product?: GenieProductId) => string;
  getWelcomeMessage: (product?: GenieProductId) => string;
  getLanguageRecommendation: (language: string) => string;
  
  // Flow helpers
  getAvailableFlows: (product?: GenieProductId) => typeof PRODUCT_FLOWS[GenieProductId];
  getProductKnowledge: (product?: GenieProductId) => typeof PRODUCT_KNOWLEDGE[GenieProductId];
  
  // Deviation detection
  checkDeviation: (action: string) => { isDeviating: boolean; warning?: string };
  recordDeviation: (reason: string) => string;
  
  // Generation context
  getGenerationContext: () => GenerationContext;
  feedContextToGeneration: (targetProduct: GenieProductId, context: Partial<GenerationContext>) => void;
  
  // Language
  userLanguage: string;
  userCountry: string;
  setUserLanguage: (language: string) => void;
  getLanguagePairing: (language: string) => ReturnType<typeof getLanguagePairingInfo>;
  
  // All products/flows data
  allProducts: typeof PRODUCT_KNOWLEDGE;
  allFlows: typeof PRODUCT_FLOWS;
}

export const useGenieUniversalContext = (options: UseGenieUniversalContextOptions): UseGenieUniversalContextReturn => {
  const { product, onContextChange, autoDetectLanguage = true } = options;
  
  const [journeyState, setJourneyState] = useState<UniversalJourneyState | null>(null);
  const [currentGuidance, setCurrentGuidance] = useState<FlowGuidance | null>(null);
  const [userLanguage, setUserLanguageState] = useState('en');
  const [userCountry, setUserCountry] = useState('US');
  
  // Initialize journey on mount
  useEffect(() => {
    const state = genieUniversalContextService.initializeJourney(product, userLanguage, userCountry);
    setJourneyState(state);
    
    // Register context change listener
    if (onContextChange) {
      genieUniversalContextService.registerContextListener('main', onContextChange);
    }
    
    // Detect user location and language
    if (autoDetectLanguage) {
      detectCountryFromIP().then(({ country, language }) => {
        setUserCountry(country);
        setUserLanguageState(language);
        
        // Update journey state with detected language
        if (state) {
          state.userLanguage = language;
          state.userCountry = country;
        }
      });
    }
    
    return () => {
      genieUniversalContextService.unregisterContextListener('main');
    };
  }, [product, onContextChange, autoDetectLanguage]);
  
  // Sync journey state when product changes
  useEffect(() => {
    if (journeyState && journeyState.product !== product) {
      genieUniversalContextService.switchProduct(product);
      setJourneyState(genieUniversalContextService.getJourneyState());
      setCurrentGuidance(null);
    }
  }, [product, journeyState]);
  
  // Initialize journey
  const initializeJourney = useCallback(() => {
    const state = genieUniversalContextService.initializeJourney(product, userLanguage, userCountry);
    setJourneyState(state);
    setCurrentGuidance(null);
  }, [product, userLanguage, userCountry]);
  
  // Switch product
  const switchProduct = useCallback((newProduct: GenieProductId) => {
    genieUniversalContextService.switchProduct(newProduct);
    setJourneyState(genieUniversalContextService.getJourneyState());
    setCurrentGuidance(null);
  }, []);
  
  // Start a flow
  const startFlow = useCallback((flowId: string) => {
    const guidance = genieUniversalContextService.startFlow(flowId);
    setCurrentGuidance(guidance);
    setJourneyState(genieUniversalContextService.getJourneyState());
  }, []);
  
  // Advance step
  const advanceStep = useCallback(() => {
    genieUniversalContextService.advanceStep();
    setCurrentGuidance(genieUniversalContextService.getCurrentGuidance());
    setJourneyState(genieUniversalContextService.getJourneyState());
  }, []);
  
  // Add context
  const addContext = useCallback((
    key: string, 
    value: any, 
    type: 'goal' | 'preference' | 'selection' | 'template' | 'visual' | 'language' = 'selection'
  ) => {
    genieUniversalContextService.addContext({ type, key, value });
    setJourneyState(genieUniversalContextService.getJourneyState());
  }, []);
  
  // Generate guidance
  const generateGuidance = useCallback((message: string) => {
    const result = genieUniversalContextService.generateContextualGuidance(message);
    
    // If should start flow, do it
    if (result.shouldStartFlow) {
      startFlow(result.shouldStartFlow);
    }
    
    // If there's context to feed, pass it to the callback
    if (result.contextToFeed && onContextChange) {
      onContextChange(result.contextToFeed);
    }
    
    return result;
  }, [startFlow, onContextChange]);
  
  // Product overview
  const getProductOverview = useCallback((
    detail: 'brief' | 'full' | 'architecture' = 'brief',
    targetProduct?: GenieProductId
  ) => {
    return genieUniversalContextService.getProductOverview(detail, targetProduct);
  }, []);
  
  // Welcome message
  const getWelcomeMessage = useCallback((targetProduct?: GenieProductId) => {
    return genieUniversalContextService.getWelcomeMessage(targetProduct, userLanguage);
  }, [userLanguage]);
  
  // Language recommendation
  const getLanguageRecommendation = useCallback((language: string) => {
    return genieUniversalContextService.getLanguageRecommendation(language);
  }, []);
  
  // Get available flows
  const getAvailableFlows = useCallback((targetProduct?: GenieProductId) => {
    const p = targetProduct || product;
    return PRODUCT_FLOWS[p];
  }, [product]);
  
  // Get product knowledge
  const getProductKnowledge = useCallback((targetProduct?: GenieProductId) => {
    return genieUniversalContextService.getProductKnowledge(targetProduct);
  }, []);
  
  // Check deviation
  const checkDeviation = useCallback((action: string) => {
    return genieUniversalContextService.checkDeviation(action);
  }, []);
  
  // Record deviation
  const recordDeviation = useCallback((reason: string) => {
    const warning = genieUniversalContextService.recordDeviation(reason);
    setJourneyState(genieUniversalContextService.getJourneyState());
    return warning;
  }, []);
  
  // Get generation context
  const getGenerationContext = useCallback(() => {
    return genieUniversalContextService.getGenerationContext();
  }, []);
  
  // Feed context to a target product's generation system
  const feedContextToGeneration = useCallback((
    targetProduct: GenieProductId, 
    context: Partial<GenerationContext>
  ) => {
    // Add context items for feeding to another product
    Object.entries(context).forEach(([key, value]) => {
      if (value !== undefined && key !== 'product') {
        genieUniversalContextService.addContext({
          type: 'selection',
          key: `${targetProduct}_${key}`,
          value
        });
      }
    });
    
    setJourneyState(genieUniversalContextService.getJourneyState());
  }, []);
  
  // Set user language
  const setUserLanguage = useCallback((language: string) => {
    setUserLanguageState(language);
    const state = genieUniversalContextService.getJourneyState();
    if (state) {
      state.userLanguage = language;
    }
  }, []);
  
  // Get language pairing
  const getLanguagePairing = useCallback((language: string) => {
    return getLanguagePairingInfo(language);
  }, []);
  
  return {
    journeyState,
    currentGuidance,
    initializeJourney,
    switchProduct,
    startFlow,
    advanceStep,
    addContext,
    generateGuidance,
    getProductOverview,
    getWelcomeMessage,
    getLanguageRecommendation,
    getAvailableFlows,
    getProductKnowledge,
    checkDeviation,
    recordDeviation,
    getGenerationContext,
    feedContextToGeneration,
    userLanguage,
    userCountry,
    setUserLanguage,
    getLanguagePairing,
    allProducts: PRODUCT_KNOWLEDGE,
    allFlows: PRODUCT_FLOWS
  };
};

// Re-export types and constants
export { PRODUCT_KNOWLEDGE, PRODUCT_FLOWS, getLanguagePairingInfo };
export type { 
  GenieProductId, 
  UniversalJourneyState, 
  FlowGuidance, 
  GenerationContext,
  SuggestedAction 
};
