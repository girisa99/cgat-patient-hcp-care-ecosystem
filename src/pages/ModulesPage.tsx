
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ModuleList } from '@/components/modules/ModuleList';
import { useModules } from '@/hooks/useModules';

const ModulesPage: React.FC = () => {
  const { modules, isLoading } = useModules();

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer
          title="Modules"
          subtitle="Manage system modules and configurations"
        >
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading modules...</p>
            </div>
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Modules"
        subtitle="Manage system modules and configurations"
      >
        <ModuleList 
          modules={modules || []} 
          onAssignUsers={() => {}}
          onAssignRoles={() => {}}
          onDeleteModule={() => {}}
        />
      </PageContainer>
    </MainLayout>
  );
};

export default ModulesPage;
