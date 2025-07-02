
import React from 'react';
import { TestingModule } from '@/components/admin/Testing/TestingModule';
import { UnifiedPageWrapper } from '@/components/layout/UnifiedPageWrapper';
import { useUnifiedTestingData } from '@/hooks/useUnifiedTestingData';

const Testing: React.FC = () => {
  console.log('🧪 Testing Page - Single source of truth implementation');
  
  const { meta } = useUnifiedTestingData();
  
  return (
    <UnifiedPageWrapper
      title="Testing Suite Management"
      subtitle={`Comprehensive testing tools with single source architecture (Coverage: ${meta.overallCoverage}%)`}
      fluid
      showSystemStatus={true}
    >
      <div className="space-y-6">
        {/* Single Source Validation */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-emerald-900">🧪 Testing Suite - Single Source Implementation Active</h3>
          </div>
          <div className="text-sm text-emerald-700 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p><strong>Architecture:</strong> {meta.singleSourceEnforced ? '🔒 UNIFIED' : '❌ Fragmented'}</p>
              <p><strong>Integration:</strong> {meta.integrationValidated ? 'Validated' : 'Pending'}</p>
            </div>
            <div>
              <p><strong>Data Source:</strong> {meta.dataSource}</p>
              <p><strong>Test Suites:</strong> {meta.totalTestSuites}</p>
            </div>
            <div>
              <p><strong>Coverage:</strong> {meta.overallCoverage}%</p>
              <p><strong>Version:</strong> {meta.testingVersion}</p>
            </div>
            <div>
              <p><strong>Status:</strong> Production Ready</p>
              <p><strong>Last Sync:</strong> {new Date(meta.lastSyncAt).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Testing Module with all functionality */}
        <TestingModule />
      </div>
    </UnifiedPageWrapper>
  );
};

export default Testing;
