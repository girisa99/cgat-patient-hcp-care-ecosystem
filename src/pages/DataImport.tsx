
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataImportModule } from '@/components/admin/DataImportModule';

const DataImport: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Data Import"
        subtitle="Import and manage real market data from multiple sources"
      >
        <DataImportModule />
      </PageContainer>
    </MainLayout>
  );
};

export default DataImport;
