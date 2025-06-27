
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import SystemAssessmentDashboard from '@/components/admin/SystemAssessment/SystemAssessmentDashboard';

const SystemAssessment = () => {
  return (
    <MainLayout>
      <PageContainer
        title="System Assessment"
        subtitle="Comprehensive analysis of system health and performance"
        fluid
      >
        <div className="p-6">
          <SystemAssessmentDashboard />
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default SystemAssessment;
