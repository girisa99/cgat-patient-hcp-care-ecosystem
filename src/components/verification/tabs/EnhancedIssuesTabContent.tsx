
import React from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { ProcessedIssuesData } from '@/types/issuesTypes';
import { TabSyncData } from '@/hooks/useTabSynchronization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
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
              <span className="text-blue-900">Real-time Issue Tracking</span>
            </div>
            <Badge variant="outline" className="bg-white">
              Synchronized: {syncData.lastUpdateTime.toLocaleTimeString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-red-600">{syncData.totalActiveCount}</div>
              <div className="text-sm text-gray-600">Active Issues</div>
              {processedData.newIssues.length > 0 && (
                <div className="flex items-center justify-center mt-1">
                  <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-xs text-red-500">+{processedData.newIssues.length} new</span>
                </div>
              )}
            </div>

            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{syncData.totalFixedCount}</div>
              <div className="text-sm text-gray-600">Fixed Issues</div>
              {processedData.resolvedIssues.length > 0 && (
                <div className="flex items-center justify-center mt-1">
                  <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+{processedData.resolvedIssues.length} resolved</span>
                </div>
              )}
            </div>

            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{syncData.realFixesApplied}</div>
              <div className="text-sm text-gray-600">Real Fixes Applied</div>
            </div>

            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{syncData.backendFixedCount}</div>
              <div className="text-sm text-gray-600">Auto-Detected</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              {syncData.backendFixedCount} issues were automatically resolved by backend changes and 
              moved to the Fixed Issues tab. These don't require manual "Apply Real Fix" actions.
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
              Critical Security Issues Require Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 text-sm">
              {syncData.criticalCount} critical issues detected. These require immediate attention 
              and may block system functionality until resolved.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Issues Tab - Now Synchronized */}
      <IssuesTab 
        verificationSummary={verificationSummary}
        onReRunVerification={onReRunVerification}
        isReRunning={isReRunning}
      />
    </div>
  );
};

export default EnhancedIssuesTabContent;
