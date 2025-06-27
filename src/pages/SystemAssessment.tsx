
import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import { PageContent } from '@/components/layout/PageContent';
import SystemAssessmentDashboard from '@/components/admin/SystemAssessment/SystemAssessmentDashboard';

const SystemAssessment = () => {
  return (
    <UnifiedDashboardLayout>
      <PageContent
        title="System Assessment"
        subtitle="Comprehensive analysis of system health and performance"
        maxWidth="full"
        padding="md"
      >
        <SystemAssessmentDashboard />
      </PageContent>
    </UnifiedDashboardLayout>
  );
};

export default SystemAssessment;
