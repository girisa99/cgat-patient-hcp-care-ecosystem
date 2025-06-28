
import React from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { ProcessedIssuesData } from '@/types/issuesTypes';
import { TabSyncData } from '@/hooks/useTabSynchronization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import ConsolidatedMetricsDisplay from '@/components/verification/ConsolidatedMetricsDisplay';
import IssuesTab from '@/components/security/IssuesTab';

interface EnhancedIssuesTabContentProps {
  verificationSummary?: VerificationSummary;
  processedData: ProcessedIssuesData;
  syncData: TabSyncData;
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const EnhancedIssuesTabContent: React.FC<EnhancedIssuesTabContentProps> = ({
  verificationSummary,
  processedData,
  syncData,
  onReRunVerification,
  isReRunning = false
}) => {
  return (
    <div className="space-y-6">
      {/* Synchronized Status Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className={`h-5 w-5 text-blue-600 ${isReRunning ? 'animate-spin' : ''}`} />
              <span className="text-blue-900">Issues Overview</span>
            </div>
            <Badge variant="outline" className="bg-white">
              Last update: {syncData.lastUpdateTime.toLocaleTimeString()}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Use Consolidated Metrics instead of duplicate sections */}
      <ConsolidatedMetricsDisplay syncData={syncData} />

      {/* Backend Fix Detection Status */}
      {syncData.backendFixedCount > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              Backend Fixes Automatically Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 text-sm">
              {syncData.backendFixedCount} issues were automatically resolved by backend changes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Critical Issues Alert */}
      {syncData.criticalCount > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Critical Issues Require Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 text-sm">
              {syncData.criticalCount} critical issues detected that require immediate attention.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Issues Tab - Now uses consolidated metrics internally */}
      <IssuesTab 
        verificationSummary={verificationSummary}
        onReRunVerification={onReRunVerification}
        isReRunning={isReRunning}
      />
    </div>
  );
};

export default EnhancedIssuesTabContent;
