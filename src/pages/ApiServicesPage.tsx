
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ApiServicesModule } from '@/components/admin/ApiServices/ApiServicesModule';

const ApiServicesPage: React.FC = () => {
  console.log('🚀 ApiServicesPage: Component rendering started');
  
  return (
    <MainLayout>
      <PageContainer
        title="API Services"
        subtitle="Comprehensive API management for internal APIs, external integrations, publishing, and developer tools"
        fluid
      >
        <div className="p-6">
          <ApiServicesModule />
        </div>
      </PageContainer>
    </MainLayout>
  );
};

console.log('✅ ApiServicesPage: Component defined successfully');

export default ApiServicesPage;
