
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Database, Code, Eye } from 'lucide-react';
import { UnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { ProcessedIssuesData } from '@/types/issuesTypes';

interface ConsolidatedOverallFixedTabProps {
  metrics: UnifiedMetrics;
  processedData: ProcessedIssuesData;
}

const ConsolidatedOverallFixedTab: React.FC<ConsolidatedOverallFixedTabProps> = ({
  metrics,
  processedData
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Overall Fixed Issues Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-green-600 mb-2">{metrics.totalFixedIssues}</div>
          <div className="text-lg font-medium text-green-800">Total Issues Fixed</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{metrics.realFixesApplied}</div>
            <div className="text-sm text-blue-800">Real Fixes Applied</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{metrics.backendFixedCount}</div>
            <div className="text-sm text-purple-800">Auto-Detected</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium mb-2">Fixed by Category</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-red-50 rounded border">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                <span className="text-sm">Security</span>
              </div>
              <Badge className="bg-red-600">{metrics.securityFixed}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded border">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm">UI/UX</span>
              </div>
              <Badge className="bg-blue-600">{metrics.uiuxFixed}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50 rounded border">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-600" />
                <span className="text-sm">Database</span>
              </div>
              <Badge className="bg-green-600">{metrics.databaseFixed}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-purple-50 rounded border">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Code Quality</span>
              </div>
              <Badge className="bg-purple-600">{metrics.codeQualityFixed}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedOverallFixedTab;
