
import React from 'react';
import { FixedIssue } from '@/hooks/useFixedIssuesTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import ConsolidatedMetricsDisplay from '@/components/verification/ConsolidatedMetricsDisplay';
import FixedIssuesTracker from '@/components/security/FixedIssuesTracker';
import { TabSyncData } from '@/hooks/useTabSynchronization';

interface FixedTabContentProps {
  fixedIssues: FixedIssue[];
  totalFixesApplied: number;
  backendFixedCount?: number;
  realFixesApplied?: number;
}

const FixedTabContent: React.FC<FixedTabContentProps> = ({
  fixedIssues,
  totalFixesApplied,
  backendFixedCount = 0,
  realFixesApplied = 0
}) => {
  const syncData: TabSyncData = {
    activeIssues: [],
    fixedIssues: fixedIssues,
    totalActiveCount: 0,
    totalFixedCount: totalFixesApplied,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    securityIssuesCount: 0,
    backendFixedCount: backendFixedCount,
    realFixesApplied: realFixesApplied,
    lastUpdateTime: new Date()
  };

  return (
    <div className="space-y-6">
      <ConsolidatedMetricsDisplay syncData={syncData} showDetailed={true} />

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <RefreshCw className="h-4 w-4" />
            Real-time Synchronization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 text-sm">
            Automatically synchronized with backend changes and manual fixes. Updates in real-time.
          </p>
        </CardContent>
      </Card>

      <FixedIssuesTracker 
        fixedIssues={fixedIssues} 
        totalFixesApplied={totalFixesApplied}
      />
    </div>
  );
};

export default FixedTabContent;
