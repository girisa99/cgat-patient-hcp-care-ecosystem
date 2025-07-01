
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataImportModule } from '@/components/admin/DataImportModule';

const DataImport: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Data Import & Management"
        subtitle="Import and manage real data from multiple sources using consolidated data import system"
        fluid
      >
        <DataImportModule />
      </PageContainer>
    </MainLayout>
  );
};

export default DataImport;
