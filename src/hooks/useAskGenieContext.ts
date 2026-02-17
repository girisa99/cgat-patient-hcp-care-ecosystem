/**
 * USE ASK GENIE CONTEXT
 * 
 * Hook for integrating Ask Genie's context-aware guidance system.
 * Connects to the context service and provides React-friendly interface.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  askGenieContextService, 
  UserJourneyState, 
  FlowGuidance,
  GENIE_DECK_KNOWLEDGE,
  DECK_FLOWS
} from '@/services/askGenieContextService';
import { detectCountryFromIP, LANGUAGE_VOICE_PAIRINGS } from '@/hooks/useAskGenieVoice';

interface UseAskGenieContextOptions {
  product: string;
  onContextChange?: (context: Record<string, any>) => void;
}

interface UseAskGenieContextReturn {
  // Journey state
  journeyState: UserJourneyState | null;
  currentGuidance: FlowGuidance | null;
  
  // Actions
  initializeJourney: () => void;
  startFlow: (flowId: string) => void;
  advanceStep: () => void;
  addContext: (key: string, value: any, type?: 'goal' | 'preference' | 'selection' | 'navigation') => void;
  
  // Guidance
  generateGuidance: (message: string) => {
    response: string;
    suggestedActions: string[];
    shouldStartFlow?: string;
    contextToFeed?: Record<string, any>;
  };
  
  // Product knowledge
  getProductOverview: (detail?: 'brief' | 'full' | 'architecture') => string;
  getWelcomeMessage: () => string;
  getLanguageRecommendation: (language: string) => string;
  
  // Flow helpers
  availableFlows: typeof DECK_FLOWS;
  productKnowledge: typeof GENIE_DECK_KNOWLEDGE;
  
  // Deviation detection
  checkDeviation: (action: string) => { isDeviating: boolean; warning?: string };
  
  // User language
  userLanguage: string;
  userCountry: string;
}

export const useAskGenieContext = (options: UseAskGenieContextOptions): UseAskGenieContextReturn => {
  const { product, onContextChange } = options;
  
  const [journeyState, setJourneyState] = useState<UserJourneyState | null>(null);
  const [currentGuidance, setCurrentGuidance] = useState<FlowGuidance | null>(null);
  const [userLanguage, setUserLanguage] = useState('en');
  const [userCountry, setUserCountry] = useState('US');
  
  // Initialize journey on mount
  useEffect(() => {
    const state = askGenieContextService.initializeJourney(product);
    setJourneyState(state);
    
    // Set up context change listener
    if (onContextChange) {
      askGenieContextService.setContextChangeListener(onContextChange);
    }
    
    // Detect user location and language
    detectCountryFromIP().then(({ country, language }) => {
      setUserCountry(country);
      setUserLanguage(language);
    });
  }, [product, onContextChange]);
  
  // Initialize journey
  const initializeJourney = useCallback(() => {
    const state = askGenieContextService.initializeJourney(product);
    setJourneyState(state);
    setCurrentGuidance(null);
  }, [product]);
  
  // Start a flow
  const startFlow = useCallback((flowId: string) => {
    const guidance = askGenieContextService.startFlow(flowId);
    setCurrentGuidance(guidance);
    setJourneyState(prev => prev ? { ...prev, currentFlow: flowId } : null);
  }, []);
  
  // Advance step
  const advanceStep = useCallback(() => {
    askGenieContextService.advanceStep();
    const guidance = askGenieContextService.getCurrentGuidance();
    setCurrentGuidance(guidance);
  }, []);
  
  // Add context
  const addContext = useCallback((
    key: string, 
    value: any, 
    type: 'goal' | 'preference' | 'selection' | 'navigation' = 'selection'
  ) => {
    askGenieContextService.addContext({ type, key, value });
    
    // Update local state
    setJourneyState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        selectedOptions: { ...prev.selectedOptions, [key]: value }
      };
    });
  }, []);
  
  // Generate guidance
  const generateGuidance = useCallback((message: string) => {
    const result = askGenieContextService.generateContextualGuidance(message);
    
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
  const getProductOverview = useCallback((detail: 'brief' | 'full' | 'architecture' = 'brief') => {
    return askGenieContextService.getProductOverview(detail);
  }, []);
  
  // Welcome message
  const getWelcomeMessage = useCallback(() => {
    return askGenieContextService.getWelcomeMessage(product, userLanguage);
  }, [product, userLanguage]);
  
  // Language recommendation
  const getLanguageRecommendation = useCallback((language: string) => {
    return askGenieContextService.getLanguageRecommendation(language);
  }, []);
  
  // Check deviation
  const checkDeviation = useCallback((action: string) => {
    return askGenieContextService.checkDeviation(action);
  }, []);
  
  return {
    journeyState,
    currentGuidance,
    initializeJourney,
    startFlow,
    advanceStep,
    addContext,
    generateGuidance,
    getProductOverview,
    getWelcomeMessage,
    getLanguageRecommendation,
    availableFlows: DECK_FLOWS,
    productKnowledge: GENIE_DECK_KNOWLEDGE,
    checkDeviation,
    userLanguage,
    userCountry
  };
};

export { GENIE_DECK_KNOWLEDGE, DECK_FLOWS };
