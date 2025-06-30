
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { FacilitiesList } from '@/components/facilities/FacilitiesList';
import { useFacilities } from '@/hooks/useFacilities';

const FacilitiesPage: React.FC = () => {
  const { facilities, isLoading } = useFacilities();

  return (
    <MainLayout>
      <PageContainer
        title="Facilities"
        subtitle="Manage healthcare facilities and locations"
      >
        <FacilitiesList facilities={facilities || []} isLoading={isLoading} />
      </PageContainer>
    </MainLayout>
  );
};

export default FacilitiesPage;
