
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ApiServicesModule } from '@/components/admin/ApiServices/ApiServicesModule';

const ApiServicesPage: React.FC = () => {
  console.log('🚀 ApiServicesPage: Using consolidated real data architecture');
  
  return (
    <MainLayout>
      <PageContainer
        title="API Services Management"
        subtitle="Comprehensive API management with real data from integrated database sources"
        fluid
      >
        <div className="p-6">
          <ApiServicesModule />
        </div>
      </PageContainer>
    </MainLayout>
  );
};

console.log('✅ ApiServicesPage: Real data architecture implementation complete');

export default ApiServicesPage;
