
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Eye, Database, Code } from 'lucide-react';
import { UnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { ProcessedIssuesData } from '@/types/issuesTypes';

interface FixedIssuesTabProps {
  metrics: UnifiedMetrics;
  processedData: ProcessedIssuesData;
}

const FixedIssuesTab: React.FC<FixedIssuesTabProps> = ({
  metrics,
  processedData
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Fixed Issues ({metrics.totalFixedIssues})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded border">
              <div className="text-2xl font-bold text-green-600">{metrics.realFixesApplied}</div>
              <div className="text-xs text-gray-600">Real Fixes Applied</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded border">
              <div className="text-2xl font-bold text-blue-600">{metrics.backendFixedCount}</div>
              <div className="text-xs text-gray-600">Backend Auto-Fixed</div>
            </div>
          </div>

          {/* By Category */}
          <div>
            <h4 className="font-medium mb-2">Fixed by Category</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded border">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Security</span>
                </div>
                <Badge className="bg-green-600">{metrics.securityFixed}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded border">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="text-sm">UI/UX</span>
                </div>
                <Badge className="bg-green-600">{metrics.uiuxFixed}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded border">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge className="bg-green-600">{metrics.databaseFixed}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded border">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Code Quality</span>
                </div>
                <Badge className="bg-green-600">{metrics.codeQualityFixed}</Badge>
              </div>
            </div>
          </div>

          {/* Recent Fixes */}
          {processedData.backendFixedIssues && processedData.backendFixedIssues.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recent Backend Fixes</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {processedData.backendFixedIssues.slice(0, 5).map((issue, index) => (
                  <div key={index} className="text-xs p-2 bg-green-50 rounded border">
                    <span className="font-medium">{issue.type}</span>
                    <p className="text-gray-600 truncate">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FixedIssuesTab;
