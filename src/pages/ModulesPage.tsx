
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';

const ModulesPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Modules"
        subtitle="Manage system modules and configurations"
      >
        <p>Modules management content will be implemented here.</p>
      </PageContainer>
    </MainLayout>
  );
};

export default ModulesPage;
