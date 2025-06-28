
import React from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { TabSyncData } from '@/hooks/useTabSynchronization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface SecurityPerformanceTabContentProps {
  verificationSummary?: VerificationSummary;
  syncData: TabSyncData;
}

const SecurityPerformanceTabContent: React.FC<SecurityPerformanceTabContentProps> = ({
  verificationSummary,
  syncData
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg border">
              <div className="text-2xl font-bold text-red-600">{syncData.criticalCount}</div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{syncData.highCount}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{syncData.totalFixedCount}</div>
              <div className="text-sm text-gray-600">Total Fixed</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{syncData.securityIssuesCount}</div>
              <div className="text-sm text-gray-600">Security Issues</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPerformanceTabContent;
