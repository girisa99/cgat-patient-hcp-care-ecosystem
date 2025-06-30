
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { PatientsList } from '@/components/admin/PatientManagement/PatientsList';
import { usePatients } from '@/hooks/patients';

const PatientsPage: React.FC = () => {
  const { patients, isLoading } = usePatients();

  return (
    <MainLayout>
      <PageContainer
        title="Patients"
        subtitle="Manage patient records and healthcare information"
      >
        <PatientsList 
          patients={patients || []}
          onView={() => {}}
          onEdit={() => {}}
          onDeactivate={() => {}}
          isDeactivating={false}
          isLoading={isLoading}
          searchTerm=""
        />
      </PageContainer>
    </MainLayout>
  );
};

export default PatientsPage;
