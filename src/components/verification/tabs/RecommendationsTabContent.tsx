
import React from 'react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import { TabSyncData } from '@/hooks/useTabSynchronization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Lightbulb, CheckCircle, AlertTriangle, Target } from 'lucide-react';

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
            System Recommendations & Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{syncData.totalFixedCount}</div>
              <div className="text-sm text-gray-600">Completed Actions</div>
              <Badge variant="default" className="mt-2 bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Done
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{syncData.totalActiveCount}</div>
              <div className="text-sm text-gray-600">Pending Actions</div>
              <Badge variant="destructive" className="mt-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{verificationResult.overallStabilityScore}%</div>
              <div className="text-sm text-gray-600">System Health</div>
              <Badge variant={verificationResult.overallStabilityScore >= 80 ? "default" : "destructive"} className="mt-2">
                {verificationResult.overallStabilityScore >= 80 ? "Healthy" : "Needs Work"}
              </Badge>
            </div>
          </div>

          {/* Priority Recommendations */}
          <Card className="bg-blue-50 border-blue-200 mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Priority Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationResult.recommendations?.map((recommendation, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 flex-1">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Improvement Plan */}
          {verificationResult.improvementPlan && verificationResult.improvementPlan.length > 0 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Implementation Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {verificationResult.improvementPlan.map((plan, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-yellow-600">#{index + 1}</span>
                      </div>
                      <span className="text-gray-700">{plan}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Status Summary */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Action Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">{syncData.criticalCount}</div>
                  <div className="text-xs text-gray-600">Critical Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">{syncData.highCount}</div>
                  <div className="text-xs text-gray-600">High Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600">{syncData.mediumCount}</div>
                  <div className="text-xs text-gray-600">Medium Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{syncData.backendFixedCount}</div>
                  <div className="text-xs text-gray-600">Auto-Fixed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationsTabContent;
