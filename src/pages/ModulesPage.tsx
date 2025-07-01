
import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import { ModulesManagement } from '@/components/modules/ModulesManagement';

const ModulesPage: React.FC = () => {
  return (
    <UnifiedDashboardLayout>
      <ModulesManagement />
    </UnifiedDashboardLayout>
  );
};

export default ModulesPage;
