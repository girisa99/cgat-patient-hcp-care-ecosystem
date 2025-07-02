
import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import { ModulesManagement } from '@/components/modules/ModulesManagement';
import { useModulesPage } from '@/hooks/useModulesPage';

const ModulesPage: React.FC = () => {
  console.log('🔒 Modules Page - LOCKED VERSION active with hook version: locked-v1.0.0');
  
  // Use locked hook to ensure stability
  const { meta } = useModulesPage();
  
  console.log('📊 Modules Page Meta:', meta);

  return (
    <UnifiedDashboardLayout>
      <ModulesManagement />
    </UnifiedDashboardLayout>
  );
};

export default ModulesPage;
