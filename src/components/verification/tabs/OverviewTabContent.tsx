
import React from 'react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import { TabSyncData } from '@/hooks/useTabSynchronization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface OverviewTabContentProps {
  verificationResult: AdminModuleVerificationResult;
  fixedCount: number;
  syncData: TabSyncData;
}

const OverviewTabContent: React.FC<OverviewTabContentProps> = ({
  verificationResult,
  fixedCount,
  syncData
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <div className="text-3xl font-bold text-blue-600">{verificationResult.overallStabilityScore}/100</div>
              <div className="text-sm text-gray-600">Overall Score</div>
              <Badge variant={verificationResult.overallStabilityScore >= 80 ? "default" : "destructive"} className="mt-2">
                {verificationResult.overallStabilityScore >= 80 ? "Stable" : "Needs Work"}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <div className="text-3xl font-bold text-green-600">{syncData.totalFixedCount}</div>
              <div className="text-sm text-gray-600">Total Fixed</div>
              <Badge variant="default" className="mt-2 bg-green-600">Complete</Badge>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border">
              <div className="text-3xl font-bold text-red-600">{syncData.totalActiveCount}</div>
              <div className="text-sm text-gray-600">Active Issues</div>
              <Badge variant="destructive" className="mt-2">Pending</Badge>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border">
              <div className="text-3xl font-bold text-purple-600">{syncData.criticalCount}</div>
              <div className="text-sm text-gray-600">Critical Issues</div>
              <Badge variant="destructive" className="mt-2">High Priority</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTabContent;
