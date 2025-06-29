
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import CoreFunctionalityVerification from '@/components/admin/CoreFunctionalityVerification';

const CoreVerification = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Core System Verification"
        subtitle="Verify that all core system functionalities are working correctly"
        fluid
      >
        <div className="p-6">
          <CoreFunctionalityVerification />
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default CoreVerification;
