/**
 * StepWizardContext — Reusable wizard state management
 * Supports RTL, transcreation-aware inputs, and responsive layout switching.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface WizardStep {
  id: string;
  label: string;
  /** Transcreated label for the active region (shown alongside English) */
  localLabel?: string;
  description?: string;
  localDescription?: string;
  icon?: React.ReactNode;
  /** AI-generated thumbnail path */
  thumbnail?: string;
  /** Whether this step is optional */
  optional?: boolean;
  /** Validation function — return true if step is complete */
  validate?: () => boolean;
}

export interface WizardConfig {
  steps: WizardStep[];
  /** Current region's language direction */
  direction?: 'ltr' | 'rtl';
  /** Active locale code (e.g. 'ar-SA', 'ja-JP') */
  locale?: string;
  /** Called when wizard completes */
  onComplete?: () => void;
  /** Called on step change */
  onStepChange?: (stepIndex: number) => void;
  /** Allow free navigation to completed steps */
  allowJumpBack?: boolean;
}

interface StepWizardContextValue {
  // State
  steps: WizardStep[];
  currentStep: number;
  direction: 'ltr' | 'rtl';
  locale: string;
  completedSteps: Set<number>;
  
  // Navigation
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  
  // Status
  progress: number; // 0-100
  isComplete: boolean;
  markStepComplete: (index: number) => void;
  markStepIncomplete: (index: number) => void;
}

const StepWizardContext = createContext<StepWizardContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export const StepWizardProvider: React.FC<{
  config: WizardConfig;
  initialStep?: number;
  children: React.ReactNode;
}> = ({ config, initialStep = 0, children }) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  const { steps, direction = 'ltr', locale = 'en', onComplete, onStepChange, allowJumpBack = true } = config;

  const goToStep = useCallback((index: number) => {
    if (index < 0 || index >= steps.length) return;
    // Allow jump back to completed steps, or to the next uncompleted step
    if (allowJumpBack || index <= currentStep || completedSteps.has(index - 1)) {
      setCurrentStep(index);
      onStepChange?.(index);
    }
  }, [steps.length, currentStep, completedSteps, allowJumpBack, onStepChange]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
      onStepChange?.(currentStep + 1);
    } else {
      // Last step — mark complete
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      onComplete?.();
    }
  }, [currentStep, steps.length, onStepChange, onComplete]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      onStepChange?.(currentStep - 1);
    }
  }, [currentStep, onStepChange]);

  const markStepComplete = useCallback((index: number) => {
    setCompletedSteps(prev => new Set([...prev, index]));
  }, []);

  const markStepIncomplete = useCallback((index: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }, []);

  const value = useMemo<StepWizardContextValue>(() => ({
    steps,
    currentStep,
    direction,
    locale,
    completedSteps,
    goToStep,
    nextStep,
    prevStep,
    canGoNext: currentStep < steps.length - 1,
    canGoPrev: currentStep > 0,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    progress: steps.length > 0 ? Math.round((completedSteps.size / steps.length) * 100) : 0,
    isComplete: completedSteps.size === steps.length,
    markStepComplete,
    markStepIncomplete,
  }), [steps, currentStep, direction, locale, completedSteps, goToStep, nextStep, prevStep, markStepComplete, markStepIncomplete]);

  return (
    <StepWizardContext.Provider value={value}>
      {children}
    </StepWizardContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useStepWizard = (): StepWizardContextValue => {
  const ctx = useContext(StepWizardContext);
  if (!ctx) throw new Error('useStepWizard must be used within StepWizardProvider');
  return ctx;
};
