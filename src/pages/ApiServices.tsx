
import React from 'react';
import { ApiIntegrationsManager } from '@/components/admin/ApiIntegrations/ApiIntegrationsManager';

const ApiServices: React.FC = () => {
  console.log('🔧 API Services page - Loading ApiIntegrationsManager');
  
  return (
    <div className="container mx-auto p-6">
      <ApiIntegrationsManager />
    </div>
  );
};

export default ApiServices;
