
import React from 'react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { UnifiedTestingTab } from '../components/UnifiedTestingTab';
import { FileText, Code } from 'lucide-react';

interface UnitTestingTabProps {
  testingData: any;
  runTestSuite?: (testType: string) => Promise<any>;
  isLoading?: boolean;
}

export const UnitTestingTab: React.FC<UnitTestingTabProps> = ({ 
  testingData, 
  runTestSuite,
  isLoading = false 
}) => {
  const unitTests = testingData.unitTests || { total: 0, passed: 0, failed: 0, skipped: 0, coverage: 0 };

  const additionalActions = (
    <EnhancedButton variant="outline" disabled>
      <FileText className="h-4 w-4 mr-2" />
      View Reports
    </EnhancedButton>
  );

  return (
    <UnifiedTestingTab
      title="Unit Tests"
      description="Individual component validation and testing"
      testType="unit"
      icon={Code}
      testMetrics={unitTests}
      runTestSuite={runTestSuite}
      isLoading={isLoading}
      additionalActions={additionalActions}
    />
  );
};
