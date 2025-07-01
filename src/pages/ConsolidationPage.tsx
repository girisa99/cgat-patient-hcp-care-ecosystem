
/**
 * Consolidation Page - Dedicated page for codebase consolidation analysis
 */

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ConsolidationDashboard from '@/components/consolidation/ConsolidationDashboard';

const ConsolidationPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Codebase Consolidation"
        subtitle="Comprehensive analysis and validation of single source of truth architecture"
        fluid
      >
        <ConsolidationDashboard />
      </PageContainer>
    </MainLayout>
  );
};

export default ConsolidationPage;
