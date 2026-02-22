/**
 * StepWizard — Reusable responsive wizard system
 * 
 * Usage:
 * ```tsx
 * import { StepWizardProvider, StepWizard, TranscreationInput, useStepWizard } from '@/components/shared/step-wizard';
 * 
 * <StepWizardProvider config={{ steps: [...], direction: 'ltr' }}>
 *   <StepWizard>
 *     <StepOneContent />
 *     <StepTwoContent />
 *     <StepThreeContent />
 *   </StepWizard>
 * </StepWizardProvider>
 * ```
 */

export { StepWizardProvider, useStepWizard, type WizardStep, type WizardConfig } from './StepWizardContext';
export { StepWizard } from './StepWizard';
export { TranscreationInput } from './TranscreationInput';
