
import React from 'react';
import { UnifiedPageWrapper } from '@/components/layout/UnifiedPageWrapper';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';

const Index: React.FC = () => {
  return (
    <UnifiedPageWrapper
      title="Healthcare Management Dashboard"
      subtitle="Unified system overview with consolidated data sources - Single Source of Truth"
      fluid
      showSystemStatus={true}
    >
      <UnifiedDashboard />
    </UnifiedPageWrapper>
  );
};

export default Index;
