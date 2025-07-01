
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { useOnboardingData } from './onboarding/useOnboardingData';

/**
 * Consolidated Onboarding Hook - Using Universal Template
 */
export const useOnboarding = () => {
  const config = {
    tableName: 'profiles' as const, // Using profiles as base table for now
    moduleName: 'Onboarding',
    requiredFields: ['name'],
    customValidation: (data: any) => {
      return !!(data.name);
    }
  };

  const templateResult = useTypeSafeModuleTemplate(config);
  const { data: onboardingData, isLoading, error, refetch } = useOnboardingData();

  return {
    // Core data
    onboardingWorkflows: onboardingData || [],
    isLoading,
    error,
    refetch,
    
    // Template access
    template: templateResult,
    
    // Metadata
    meta: {
      ...templateResult.meta,
      workflowCount: onboardingData?.length || 0,
      dataSource: 'onboarding workflows',
      consolidationStatus: 'CONSOLIDATED',
      templateVersion: '2.0'
    }
  };
};
