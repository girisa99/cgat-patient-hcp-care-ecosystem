/**
 * Wizard Ecosystem Integration Hook
 * 
 * Lightweight wrapper to integrate ecosystem tracking into the presentation wizard.
 * Wire this into PresentationWizard to track steps, generations, and feedback.
 */

import { useCallback, useRef } from 'react';
import { useEcosystemIntegration, GenieProduct } from './useEcosystemIntegration';

interface WizardEcosystemOptions {
  product?: GenieProduct;
  industry?: string;
  language?: string;
}

export function useWizardEcosystemIntegration(options: WizardEcosystemOptions = {}) {
  const { product = 'deck', industry, language } = options;
  const lastTrackedStep = useRef<number>(-1);

  const ecosystem = useEcosystemIntegration({
    product,
    tier: 2,
    industry,
    language,
  });

  // Track wizard step completion (debounced to prevent duplicate tracking)
  const onStepComplete = useCallback(async (step: number, stepName: string, selections?: any) => {
    if (step === lastTrackedStep.current) return;
    lastTrackedStep.current = step;
    await ecosystem.trackWizardStep(step, stepName, selections);
  }, [ecosystem]);

  // Track generation start
  const onGenerationStart = useCallback(async (config?: any) => {
    await ecosystem.trackGenerationStart(config);
  }, [ecosystem]);

  // Track generation complete
  const onGenerationComplete = useCallback(async (success: boolean, outputType?: string, duration?: number) => {
    await ecosystem.trackGenerationComplete({
      success,
      outputType: outputType || 'presentation',
      duration: duration || 0,
      confidenceScore: success ? 0.9 : 0.5,
    });
  }, [ecosystem]);

  // Track generation error
  const onGenerationError = useCallback(async (error: Error | string) => {
    await ecosystem.trackGenerationFailed(error);
  }, [ecosystem]);

  // Submit user feedback
  const onFeedback = useCallback(async (rating: 1 | 2 | 3 | 4 | 5, comment?: string, outputId?: string) => {
    await ecosystem.submitFeedback({
      type: rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'detailed',
      outputId: outputId || 'wizard-output',
      rating,
      comment,
    });
  }, [ecosystem]);

  // Track editor actions
  const onEditorAction = useCallback(async (action: string, elementId?: string) => {
    await ecosystem.trackEditorAction(action, elementId);
  }, [ecosystem]);

  return {
    // Step tracking
    onStepComplete,
    
    // Generation tracking
    onGenerationStart,
    onGenerationComplete,
    onGenerationError,
    
    // Feedback
    onFeedback,
    
    // Editor
    onEditorAction,
    
    // Beta awards access
    betaAwards: ecosystem.betaAwards,
    
    // Context
    isAuthenticated: ecosystem.isAuthenticated,
    userId: ecosystem.userId,
  };
}

export default useWizardEcosystemIntegration;
