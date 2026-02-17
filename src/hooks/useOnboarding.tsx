
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
// Removed broken import

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
  const onboardingData = [];
  const isLoading = false;
  const error = null;
  const refetch = () => {};

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
