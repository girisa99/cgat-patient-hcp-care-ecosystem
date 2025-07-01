import React from 'react';
import { DeveloperUtilities } from '../DeveloperUtilities';
import DeveloperPortal from '../DeveloperPortal';

export const DeveloperTabContent: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Functional Developer Utilities */}
      <DeveloperUtilities />
      
      {/* Existing Developer Portal */}
      <DeveloperPortal />
    </div>
  );
};
