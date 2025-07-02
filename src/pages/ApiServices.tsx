
import React from 'react';
import { ApiServicesModule } from '@/components/admin/ApiServices/ApiServicesModule';
import { UnifiedPageWrapper } from '@/components/layout/UnifiedPageWrapper';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';

const ApiServices: React.FC = () => {
  console.log('🚀 API Services Page - Unified implementation with single source of truth');
  
  const { apiServices } = useUnifiedPageData();
  
  return (
    <UnifiedPageWrapper
      title="API Services Management"
      subtitle={`Comprehensive API management with real data (${apiServices.data.length} integrations from ${apiServices.meta.dataSource})`}
      fluid
      showSystemStatus={true}
    >
      <div className="space-y-6">
        {/* API Services Module with all functionality */}
        <ApiServicesModule />
      </div>
    </UnifiedPageWrapper>
  );
};

export default ApiServices;
