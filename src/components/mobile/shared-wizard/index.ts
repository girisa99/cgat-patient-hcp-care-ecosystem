/**
 * Shared Mobile Components for Genie Ecosystem
 * 
 * Reusable mobile UI patterns used across Deck, Vibe, Spark, etc.
 */

// Re-export from presentation generator
export { MobileWizardLayout } from '@/components/genie-studio/presentation-generator/components/MobileWizardLayout';
export { useWizardSteps } from '@/components/genie-studio/presentation-generator/hooks/useWizardSteps';

// Re-export step components
export { 
  UnifiedInputStep,
  VoiceMusicStep,
  PublishingPanel,
  DEFAULT_STEP_STATES,
  type WizardStepStates,
  type PublishingState,
} from '@/components/genie-studio/presentation-generator/steps';

// Re-export registry
export {
  getStep,
  getAllSteps,
  getVisibleSteps,
  getMobileLiteSteps,
  MOBILE_LITE_STEPS,
  type StepId,
  type StepConfig,
} from '@/components/genie-studio/presentation-generator/registry/stepRegistry';
