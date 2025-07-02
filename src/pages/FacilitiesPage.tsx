
import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import { FacilitiesManagement } from '@/components/facilities/FacilitiesManagement';
import { useFacilitiesPage } from '@/hooks/useFacilitiesPage';

const FacilitiesPage: React.FC = () => {
  console.log('🔒 Facilities Page - LOCKED VERSION active with hook version: locked-v1.0.0');
  
  // Use locked hook to ensure stability
  const { meta } = useFacilitiesPage();
  
  console.log('📊 Facilities Page Meta:', meta);

  return (
    <UnifiedDashboardLayout>
      <FacilitiesManagement />
    </UnifiedDashboardLayout>
  );
};

export default FacilitiesPage;
