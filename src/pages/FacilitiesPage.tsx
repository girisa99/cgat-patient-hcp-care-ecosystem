
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';

const FacilitiesPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Facilities"
        subtitle="Manage healthcare facilities and locations"
      >
        <p>Facilities management content will be implemented here.</p>
      </PageContainer>
    </MainLayout>
  );
};

export default FacilitiesPage;
