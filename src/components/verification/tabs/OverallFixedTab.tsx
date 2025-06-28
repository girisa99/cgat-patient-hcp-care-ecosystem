
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { UnifiedMetrics } from '@/hooks/useUnifiedMetrics';

interface OverallFixedTabProps {
  metrics: UnifiedMetrics;
}

const OverallFixedTab: React.FC<OverallFixedTabProps> = ({ metrics }) => {
  const totalFixed = metrics.criticalFixed + metrics.highFixed + metrics.mediumFixed + metrics.lowFixed;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Overall Fixed Issues Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Summary */}
          <div className="space-y-4">
            <div className="text-center p-6 bg-green-50 rounded-lg border">
              <div className="text-4xl font-bold text-green-600 mb-2">{metrics.totalFixedIssues}</div>
              <div className="text-lg font-medium text-green-800">Total Issues Fixed</div>
              <div className="text-sm text-gray-600 mt-1">All time cumulative</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-3 bg-blue-50 rounded border">
                <div className="text-xl font-bold text-blue-600">{metrics.realFixesApplied}</div>
                <div className="text-xs text-gray-600">Manual Fixes</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded border">
                <div className="text-xl font-bold text-purple-600">{metrics.backendFixedCount}</div>
                <div className="text-xs text-gray-600">Auto-Detected</div>
              </div>
            </div>
          </div>

          {/* By Severity Breakdown */}
          <div>
            <Tabs defaultValue="critical" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="critical">Critical</TabsTrigger>
                <TabsTrigger value="high">High</TabsTrigger>
                <TabsTrigger value="medium">Medium</TabsTrigger>
                <TabsTrigger value="low">Low</TabsTrigger>
              </TabsList>

              <TabsContent value="critical" className="mt-4">
                <div className="text-center p-6 bg-red-50 rounded-lg border">
                  <div className="text-3xl font-bold text-red-600 mb-2">{metrics.criticalFixed}</div>
                  <div className="text-lg font-medium text-red-800">Critical Issues Fixed</div>
                  <Badge variant="destructive" className="mt-2">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Highest Priority
                  </Badge>
                </div>
              </TabsContent>

              <TabsContent value="high" className="mt-4">
                <div className="text-center p-6 bg-orange-50 rounded-lg border">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{metrics.highFixed}</div>
                  <div className="text-lg font-medium text-orange-800">High Priority Issues Fixed</div>
                  <Badge className="bg-orange-600 mt-2">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    High Impact
                  </Badge>
                </div>
              </TabsContent>

              <TabsContent value="medium" className="mt-4">
                <div className="text-center p-6 bg-yellow-50 rounded-lg border">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">{metrics.mediumFixed}</div>
                  <div className="text-lg font-medium text-yellow-800">Medium Priority Issues Fixed</div>
                  <Badge className="bg-yellow-600 mt-2">Medium Impact</Badge>
                </div>
              </TabsContent>

              <TabsContent value="low" className="mt-4">
                <div className="text-center p-6 bg-gray-50 rounded-lg border">
                  <div className="text-3xl font-bold text-gray-600 mb-2">{metrics.lowFixed}</div>
                  <div className="text-lg font-medium text-gray-800">Low Priority Issues Fixed</div>
                  <Badge variant="outline" className="mt-2">Low Impact</Badge>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverallFixedTab;
