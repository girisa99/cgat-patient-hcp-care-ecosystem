
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';

const TherapiesPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Therapies & Services"
        subtitle="Manage available therapies and treatment options"
      >
        <p>Therapies and services content will be implemented here.</p>
      </PageContainer>
    </MainLayout>
  );
};

export default TherapiesPage;
