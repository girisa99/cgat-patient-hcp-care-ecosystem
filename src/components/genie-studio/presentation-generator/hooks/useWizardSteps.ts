/**
 * useWizardSteps - Hook for 8-Step Wizard Navigation
 * 
 * Manages step state, validation, and navigation with:
 * - Cartesian-optimized context selection
 * - Mobile lite mode support
 * - Offline queue integration
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  StepId, 
  WizardContext, 
  StepValidation,
  getStep,
  getAllSteps,
  getVisibleSteps,
  getNextStep,
  getPreviousStep,
  getStepProgress,
  validateAllSteps,
  isStepAccessible,
  getMobileLiteSteps,
} from '../registry/stepRegistry';
import { DEFAULT_STEP_STATES, type WizardStepStates } from '../steps';

// ==========================================
// TYPES
// ==========================================

export interface UseWizardStepsOptions {
  initialStep?: StepId;
  isMobile?: boolean;
  isOffline?: boolean;
  globalTier?: 'free' | 'pro' | 'enterprise';
  liteMode?: boolean;
  onStepChange?: (step: StepId, direction: 'next' | 'prev' | 'jump') => void;
  onValidationError?: (step: StepId, errors: string[]) => void;
}

export interface UseWizardStepsReturn {
  // Current state
  currentStep: StepId;
  stepValues: WizardStepStates;
  
  // Navigation
  goToStep: (step: StepId) => boolean;
  nextStep: () => boolean;
  prevStep: () => boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  
  // Validation
  currentValidation: StepValidation;
  allValidations: Record<StepId, StepValidation>;
  isStepValid: (step: StepId) => boolean;
  
  // Progress
  progress: number;
  totalSteps: number;
  completedSteps: number;
  
  // Step info
  visibleSteps: ReturnType<typeof getVisibleSteps>;
  currentStepConfig: ReturnType<typeof getStep>;
  
  // State management
  updateStepValue: <K extends StepId>(step: K, value: WizardStepStates[K]) => void;
  resetStep: (step: StepId) => void;
  resetAll: () => void;
  
  // Context
  context: WizardContext;
  
  // Mobile
  isMobile: boolean;
  isLiteMode: boolean;
}

// ==========================================
// HOOK
// ==========================================

export function useWizardSteps(options: UseWizardStepsOptions = {}): UseWizardStepsReturn {
  const {
    initialStep = 'input',
    isMobile = false,
    isOffline = false,
    globalTier = 'pro',
    liteMode = false,
    onStepChange,
    onValidationError,
  } = options;

  // State
  const [currentStep, setCurrentStep] = useState<StepId>(initialStep);
  const [stepValues, setStepValues] = useState<WizardStepStates>(DEFAULT_STEP_STATES);

  // Context for validation and visibility
  const context: WizardContext = useMemo(() => ({
    currentStep,
    stepValues,
    globalTier,
    mode: 'auto',
    isMobile: isMobile || liteMode,
    isOffline,
  }), [currentStep, stepValues, globalTier, isMobile, liteMode, isOffline]);

  // Visible steps based on context
  const visibleSteps = useMemo(() => {
    if (liteMode) {
      return getMobileLiteSteps();
    }
    return getVisibleSteps(context);
  }, [context, liteMode]);

  // Current step config
  const currentStepConfig = useMemo(() => getStep(currentStep), [currentStep]);

  // All validations
  const allValidations = useMemo(() => validateAllSteps(context), [context]);

  // Current step validation
  const currentValidation = useMemo(() => 
    allValidations[currentStep] || { isValid: true, errors: [], warnings: [] },
    [allValidations, currentStep]
  );

  // Check if step is valid
  const isStepValid = useCallback((step: StepId) => {
    return allValidations[step]?.isValid ?? true;
  }, [allValidations]);

  // Progress calculation
  const { progress, completedSteps } = useMemo(() => {
    const completed = visibleSteps.filter(s => 
      isStepValid(s.metadata.id) && 
      visibleSteps.findIndex(v => v.metadata.id === s.metadata.id) < 
      visibleSteps.findIndex(v => v.metadata.id === currentStep)
    ).length;
    
    return {
      progress: getStepProgress(currentStep, context),
      completedSteps: completed,
    };
  }, [visibleSteps, currentStep, context, isStepValid]);

  // Navigation: go to specific step
  const goToStep = useCallback((step: StepId): boolean => {
    if (!isStepAccessible(step, context)) {
      const stepConfig = getStep(step);
      if (stepConfig?.metadata.requiredSteps) {
        onValidationError?.(step, [`Complete ${stepConfig.metadata.requiredSteps.join(', ')} first`]);
      }
      return false;
    }

    setCurrentStep(step);
    onStepChange?.(step, 'jump');
    return true;
  }, [context, onStepChange, onValidationError]);

  // Navigation: next step
  const nextStep = useCallback((): boolean => {
    // Validate current step first
    if (!currentValidation.isValid) {
      onValidationError?.(currentStep, currentValidation.errors);
      return false;
    }

    const next = getNextStep(currentStep, context);
    if (!next) return false;

    setCurrentStep(next);
    onStepChange?.(next, 'next');
    return true;
  }, [currentStep, context, currentValidation, onStepChange, onValidationError]);

  // Navigation: previous step
  const prevStep = useCallback((): boolean => {
    const prev = getPreviousStep(currentStep, context);
    if (!prev) return false;

    setCurrentStep(prev);
    onStepChange?.(prev, 'prev');
    return true;
  }, [currentStep, context, onStepChange]);

  // Can navigate
  const canGoNext = useMemo(() => {
    if (!currentValidation.isValid) return false;
    return getNextStep(currentStep, context) !== null;
  }, [currentStep, context, currentValidation]);

  const canGoPrev = useMemo(() => {
    return getPreviousStep(currentStep, context) !== null;
  }, [currentStep, context]);

  // Update step value
  const updateStepValue = useCallback(<K extends StepId>(
    step: K, 
    value: WizardStepStates[K]
  ) => {
    setStepValues(prev => ({ ...prev, [step]: value }));
  }, []);

  // Reset step to default
  const resetStep = useCallback((step: StepId) => {
    setStepValues(prev => ({ ...prev, [step]: DEFAULT_STEP_STATES[step] }));
  }, []);

  // Reset all steps
  const resetAll = useCallback(() => {
    setStepValues(DEFAULT_STEP_STATES);
    setCurrentStep('input');
  }, []);

  return {
    // Current state
    currentStep,
    stepValues,
    
    // Navigation
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    
    // Validation
    currentValidation,
    allValidations,
    isStepValid,
    
    // Progress
    progress,
    totalSteps: visibleSteps.length,
    completedSteps,
    
    // Step info
    visibleSteps,
    currentStepConfig,
    
    // State management
    updateStepValue,
    resetStep,
    resetAll,
    
    // Context
    context,
    
    // Mobile
    isMobile,
    isLiteMode: liteMode,
  };
}

export default useWizardSteps;
