/**
 * Stability Hook - Following Stability Framework Structure
 * Uses useTypeSafeModuleTemplate for consistency
 */

import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

const stabilityConfig = {
  tableName: 'active_issues',
  moduleName: 'Stability',
  requiredFields: ['issue_type', 'issue_message'],
  customValidation: (data: any) => {
    return data.issue_type && data.issue_message;
  }
};

export const useStability = () => {
  const templateResult = useTypeSafeModuleTemplate(stabilityConfig);

  return {
    ...templateResult,
    // Add any stability-specific methods here if needed
    meta: {
      ...templateResult.meta,
      moduleType: 'stability',
      description: 'Stability monitoring and issue management'
    }
  };
};