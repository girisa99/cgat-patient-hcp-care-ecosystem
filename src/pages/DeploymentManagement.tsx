import React from 'react';
import { DeploymentManagementInterface } from '@/components/deployment/DeploymentManagementInterface';

const DeploymentManagement: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <DeploymentManagementInterface />
    </div>
  );
};

export default DeploymentManagement;