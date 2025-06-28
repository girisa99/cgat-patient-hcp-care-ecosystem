
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { UnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { ProcessedIssuesData } from '@/types/issuesTypes';

interface ConsolidatedActiveVsFixedTabProps {
  metrics: UnifiedMetrics;
  processedData: ProcessedIssuesData;
  onUpdate: () => void;
}

const ConsolidatedActiveVsFixedTab: React.FC<ConsolidatedActiveVsFixedTabProps> = ({
  metrics,
  processedData,
  onUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Active vs Fixed Issues Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Issues Summary */}
          <div className="space-y-4">
            <h3 className="font-medium text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Active Issues ({metrics.totalActiveIssues})
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-sm">Critical</span>
                <Badge variant="destructive">{metrics.criticalCount}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="text-sm">High</span>
                <Badge className="bg-orange-600">{metrics.highCount}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <span className="text-sm">Medium</span>
                <Badge className="bg-yellow-600">{metrics.mediumCount}</Badge>
              </div>
            </div>
          </div>

          {/* Fixed Issues Summary */}
          <div className="space-y-4">
            <h3 className="font-medium text-green-800 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Fixed Issues ({metrics.totalFixedIssues})
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm">Real Fixes</span>
                <Badge className="bg-green-600">{metrics.realFixesApplied}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-sm">Backend Auto-Detected</span>
                <Badge className="bg-blue-600">{metrics.backendFixedCount}</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedActiveVsFixedTab;
