
import React from 'react';
import { ApiIntegrationsManager } from '@/components/admin/ApiIntegrations/ApiIntegrationsManager';

const ApiServices: React.FC = () => {
  console.log('🔧 API Services page - Using comprehensive ApiIntegrationsManager');
  
  return <ApiIntegrationsManager />;
};

export default ApiServices;
