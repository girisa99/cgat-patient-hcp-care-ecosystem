
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';

const ServicesPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Service Selection"
        subtitle="Select and configure healthcare services"
      >
        <p>Service selection content will be implemented here.</p>
      </PageContainer>
    </MainLayout>
  );
};

export default ServicesPage;
