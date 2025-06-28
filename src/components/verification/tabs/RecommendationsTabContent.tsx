
import React from 'react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import { TabSyncData } from '@/hooks/useTabSynchronization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';

interface RecommendationsTabContentProps {
  verificationResult: AdminModuleVerificationResult;
  fixedCount: number;
  syncData: TabSyncData;
}

const RecommendationsTabContent: React.FC<RecommendationsTabContentProps> = ({
  verificationResult,
  fixedCount,
  syncData
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            System Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{syncData.totalFixedCount}</div>
              <div className="text-sm text-gray-600">Completed Actions</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{syncData.totalActiveCount}</div>
              <div className="text-sm text-gray-600">Pending Actions</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{verificationResult.overallStabilityScore}%</div>
              <div className="text-sm text-gray-600">System Health</div>
            </div>
          </div>

          <div className="space-y-4">
            {verificationResult.recommendations?.map((recommendation, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationsTabContent;
