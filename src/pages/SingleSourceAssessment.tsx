
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { SingleSourceAssessmentDashboard } from '@/components/admin/Assessment/SingleSourceAssessmentDashboard';

const SingleSourceAssessment: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Single Source Assessment"
        subtitle="Comprehensive analysis of system consolidation, data integrity, and code quality"
        fluid
      >
        <SingleSourceAssessmentDashboard />
      </PageContainer>
    </MainLayout>
  );
};

export default SingleSourceAssessment;
