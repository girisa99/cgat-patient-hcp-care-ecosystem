/**
 * Facilities Hook - Following Stability Framework Structure
 * Uses useTypeSafeModuleTemplate for consistency
 */

import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

const facilitiesConfig = {
  tableName: 'facilities',
  moduleName: 'Facilities',
  requiredFields: ['name', 'facility_type'],
  customValidation: (data: any) => {
    return data.name && data.facility_type;
  }
};

export const useFacilities = () => {
  const templateResult = useTypeSafeModuleTemplate(facilitiesConfig);

  return {
    ...templateResult,
    // Add any facility-specific methods here if needed
    meta: {
      ...templateResult.meta,
      moduleType: 'facilities',
      description: 'Healthcare facilities management'
    }
  };
};