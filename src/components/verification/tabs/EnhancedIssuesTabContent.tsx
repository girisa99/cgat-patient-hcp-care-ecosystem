
import React from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { ProcessedIssuesData } from '@/types/issuesTypes';
import { TabSyncData } from '@/hooks/useTabSynchronization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import IssuesTab from '@/components/security/IssuesTab';

interface EnhancedIssuesTabContentProps {
  verificationSummary?: VerificationSummary;
  processedData: ProcessedIssuesData;
  syncData: TabSyncData;
}

const EnhancedIssuesTabContent: React.FC<EnhancedIssuesTabContentProps> = ({
  verificationSummary,
  processedData,
  syncData
}) => {
  return (
    <div className="space-y-6">
      {/* Only show alerts if there are actual issues */}
      {syncData.backendFixedCount > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              Backend Fixes Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 text-sm">
              {syncData.backendFixedCount} issues were automatically resolved.
            </p>
          </CardContent>
        </Card>
      )}

      {syncData.criticalCount > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Critical Issues Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 text-sm">
              {syncData.criticalCount} critical issues require immediate attention.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-5 w-5" />
            Issues Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{syncData.totalActiveCount}</div>
              <div className="text-sm text-gray-600">Active Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncData.totalFixedCount}</div>
              <div className="text-sm text-gray-600">Fixed Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{syncData.criticalCount}</div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{syncData.securityIssuesCount}</div>
              <div className="text-sm text-gray-600">Security</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <IssuesTab 
        verificationSummary={verificationSummary}
      />
    </div>
  );
};

export default EnhancedIssuesTabContent;
