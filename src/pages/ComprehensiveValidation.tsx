
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ComprehensiveValidationDashboard } from '@/components/validation/ComprehensiveValidationDashboard';

const ComprehensiveValidation: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Comprehensive System Validation"
        subtitle="Complete analysis of duplicates, dead code, mock data, and system redundancies"
        fluid
      >
        <ComprehensiveValidationDashboard />
      </PageContainer>
    </MainLayout>
  );
};

export default ComprehensiveValidation;
