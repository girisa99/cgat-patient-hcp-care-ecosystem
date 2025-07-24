
import { useEffect, useRef } from 'react';
import { useMasterOnboarding } from './useMasterOnboarding';
import { TreatmentCenterOnboarding, OnboardingStep } from '@/types/onboarding';
import { useToast } from './use-toast';

interface UseAutoSaveProps {
  data: Partial<TreatmentCenterOnboarding>;
  currentStep: number;
  applicationId?: string;
  enabled?: boolean;
}

export const useAutoSave = ({ 
  data, 
  currentStep, 
  applicationId, 
  enabled = true 
}: UseAutoSaveProps) => {
  const { createApplication, updateApplication, isCreating, isUpdating } = useMasterOnboarding();
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  const saveProgress = async () => {
    if (!enabled) return;

    const currentDataString = JSON.stringify({ data, currentStep });
    
    // Don't save if nothing has changed
    if (currentDataString === lastSavedRef.current) return;

    try {
      const currentStepName = getCurrentStepName(currentStep);
      const completedSteps = getCompletedSteps(currentStep);
      
      const saveData: Partial<TreatmentCenterOnboarding> = {
        ...data,
        workflow: {
          ...data.workflow,
          current_step: currentStepName,
          completed_steps: completedSteps,
          notes: data.workflow?.notes || []
        }
      };

      if (applicationId) {
        await updateApplication({ id: applicationId, updates: saveData });
      } else {
        await createApplication(saveData);
      }

      lastSavedRef.current = currentDataString;
      console.log('Progress auto-saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast({
        title: "Auto-save Failed",
        description: "Your progress couldn't be saved automatically. Please save manually.",
        variant: "destructive",
      });
    }
  };

  // Auto-save with debouncing
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (3 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress();
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, currentStep, enabled]);

  // Manual save function
  const manualSave = async () => {
    await saveProgress();
    toast({
      title: "Progress Saved",
      description: "Your application progress has been saved successfully.",
    });
  };

  return {
    manualSave,
    isSaving: isCreating || isUpdating,
  };
};

const getCurrentStepName = (stepIndex: number): OnboardingStep => {
  const steps: OnboardingStep[] = [
    'company_info',
    'business_classification', 
    'contacts',
    'ownership',
    'references',
    'payment_banking',
    'licenses',
    'documents',
    'authorizations',
    'review'
  ];
  return steps[stepIndex] || 'company_info';
};

const getCompletedSteps = (currentStepIndex: number): OnboardingStep[] => {
  const steps: OnboardingStep[] = [
    'company_info',
    'business_classification',
    'contacts',
    'ownership', 
    'references',
    'payment_banking',
    'licenses',
    'documents',
    'authorizations',
    'review'
  ];
  return steps.slice(0, currentStepIndex);
};
