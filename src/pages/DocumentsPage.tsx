
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';

const DocumentsPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Documents"
        subtitle="Manage documents and file storage"
      >
        <p>Documents management content will be implemented here.</p>
      </PageContainer>
    </MainLayout>
  );
};

export default DocumentsPage;
