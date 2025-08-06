import React from 'react';

const DeploymentManagement: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Deployment Management Moved</h2>
        <p className="text-muted-foreground mb-4">
          Deployment management is now part of the Agents page.
        </p>
        <a 
          href="/agents" 
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Go to Agents → Deployment Management
        </a>
      </div>
    </div>
  );
};

export default DeploymentManagement;