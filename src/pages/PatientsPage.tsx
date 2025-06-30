
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';

const PatientsPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Patients"
        subtitle="Manage patient records and healthcare information"
      >
        <p>Patients management content will be implemented here.</p>
      </PageContainer>
    </MainLayout>
  );
};

export default PatientsPage;
