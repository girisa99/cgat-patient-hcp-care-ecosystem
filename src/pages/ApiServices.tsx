
import React from 'react';
import { ApiServicesModule } from '@/components/admin/ApiServices/ApiServicesModule';
import { UnifiedPageWrapper } from '@/components/layout/UnifiedPageWrapper';
import { useApiServicesLocked } from '@/hooks/useApiServicesLocked';

const ApiServices: React.FC = () => {
  console.log('🔒 API Services Page - Focused on API management only (testing moved to dedicated suite)');
  
  const { integrations, meta } = useApiServicesLocked();
  
  return (
    <UnifiedPageWrapper
      title="API Services Management"
      subtitle={`API-focused management system (${integrations.length} integrations from ${meta.dataSource})`}
      fluid
      showSystemStatus={true}
    >
      <div className="space-y-6">
        {/* Single Source of Truth Validation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-blue-900">🔒 API Services - Single Source of Truth</h3>
          </div>
          <div className="text-sm text-blue-700 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p><strong>Hook Pattern:</strong> {meta.lockedPatternEnforced ? '🔒 LOCKED' : '❌ Unlocked'}</p>
              <p><strong>Implementation:</strong> {meta.implementationLocked ? 'Secured' : 'Open'}</p>
            </div>
            <div>
              <p><strong>Single Source:</strong> {meta.singleSourceValidated ? '✅ Validated' : '❌ Invalid'}</p>
              <p><strong>Data Integrity:</strong> Maintained</p>
            </div>
            <div>
              <p><strong>Focus:</strong> API Management Only</p>
              <p><strong>Testing Services:</strong> Moved to dedicated suite</p>
            </div>
            <div>
              <p><strong>Version:</strong> {meta.hookVersion}</p>
              <p><strong>Status:</strong> Production Ready</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded-md">
            <p className="text-blue-800 font-medium">
              ⚡ Testing services have been moved to the dedicated "Testing Services Suite" in the main navigation to eliminate redundancy.
            </p>
          </div>
        </div>

        {/* API Services Module with focused functionality */}
        <ApiServicesModule />
      </div>
    </UnifiedPageWrapper>
  );
};

export default ApiServices;
