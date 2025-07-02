
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ApiServicesModule } from '@/components/admin/ApiServices/ApiServicesModule';
import { useApiServicesPage } from '@/hooks/useApiServicesPage';

const ApiServices: React.FC = () => {
  console.log('🚀 API Services Page - Full functionality restored');
  
  const { meta } = useApiServicesPage();
  
  return (
    <MainLayout>
      <PageContainer
        title="API Services Management"
        subtitle="Comprehensive API management with real data from integrated database sources"
        fluid
      >
        {/* API Services Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-green-900">🔒 API Services Full Functionality Active</h3>
          </div>
          <div className="text-sm text-green-700">
            <p><strong>Total Integrations:</strong> {meta.totalIntegrations}</p>
            <p><strong>Data Source:</strong> {meta.dataSource}</p>
            <p><strong>Hook Version:</strong> {meta.hookVersion}</p>
            <p className="text-xs text-green-600 mt-1">Single Source Validated: {meta.singleSourceValidated ? '✅' : '❌'}</p>
          </div>
        </div>

        <ApiServicesModule />
      </PageContainer>
    </MainLayout>
  );
};

export default ApiServices;
