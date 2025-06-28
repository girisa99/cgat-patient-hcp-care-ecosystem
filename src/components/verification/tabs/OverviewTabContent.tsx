
import React from 'react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import { TabSyncData } from '@/hooks/useTabSynchronization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertTriangle, TrendingUp, Shield } from 'lucide-react';

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
            System Overview & Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

          {/* System Health Details */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">System Health Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationResult.stabilityReport?.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <span className="text-gray-700">{report}</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Passed Checks */}
          {verificationResult.passedChecks && verificationResult.passedChecks.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Passed Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {verificationResult.passedChecks.map((check, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">{check}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Failed Checks */}
          {verificationResult.failedChecks && verificationResult.failedChecks.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Failed Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {verificationResult.failedChecks.map((check, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-red-700">{check}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTabContent;
