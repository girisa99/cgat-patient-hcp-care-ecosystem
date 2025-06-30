
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';

const ReportsPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Reports"
        subtitle="View and generate system reports"
      >
        <p>Reports content will be implemented here.</p>
      </PageContainer>
    </MainLayout>
  );
};

export default ReportsPage;
