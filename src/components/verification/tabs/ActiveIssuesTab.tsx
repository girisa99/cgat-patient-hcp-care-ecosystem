
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bug, Shield, Database, Code, Eye } from 'lucide-react';
import { UnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { ProcessedIssuesData } from '@/types/issuesTypes';

interface ActiveIssuesTabProps {
  metrics: UnifiedMetrics;
  processedData: ProcessedIssuesData;
  onUpdate: () => void;
}

const ActiveIssuesTab: React.FC<ActiveIssuesTabProps> = ({
  metrics,
  processedData,
  onUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-red-600" />
          Active Issues ({metrics.totalActiveIssues})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* By Severity */}
          <div>
            <h4 className="font-medium mb-2">By Severity</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 bg-red-50 rounded border">
                <span className="text-sm">Critical</span>
                <Badge variant="destructive">{metrics.criticalActive}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded border">
                <span className="text-sm">High</span>
                <Badge className="bg-orange-600">{metrics.highActive}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border">
                <span className="text-sm">Medium</span>
                <Badge className="bg-yellow-600">{metrics.mediumActive}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <span className="text-sm">Low</span>
                <Badge variant="outline">{metrics.lowActive}</Badge>
              </div>
            </div>
          </div>

          {/* By Category */}
          <div>
            <h4 className="font-medium mb-2">By Category</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-red-50 rounded border">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Security</span>
                </div>
                <Badge variant="destructive">{metrics.securityActive}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded border">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">UI/UX</span>
                </div>
                <Badge className="bg-blue-600">{metrics.uiuxActive}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded border">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge className="bg-green-600">{metrics.databaseActive}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded border">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Code Quality</span>
                </div>
                <Badge className="bg-purple-600">{metrics.codeQualityActive}</Badge>
              </div>
            </div>
          </div>

          {metrics.totalActiveIssues === 0 && (
            <div className="text-center py-6 text-green-600">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="font-medium">No Active Issues</p>
              <p className="text-sm text-gray-600">All issues have been resolved!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveIssuesTab;
