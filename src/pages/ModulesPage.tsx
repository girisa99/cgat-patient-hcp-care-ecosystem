
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ModuleList } from '@/components/modules/ModuleList';
import { useModules } from '@/hooks/useModules';

const ModulesPage: React.FC = () => {
  const { modules, isLoading } = useModules();

  return (
    <MainLayout>
      <PageContainer
        title="Modules"
        subtitle="Manage system modules and configurations"
      >
        <ModuleList modules={modules || []} isLoading={isLoading} />
      </PageContainer>
    </MainLayout>
  );
};

export default ModulesPage;
