
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { UnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { Issue } from '@/types/issuesTypes';

interface DatabaseTabProps {
  metrics: UnifiedMetrics;
  issues: Issue[];
  onUpdate: () => void;
}

const DatabaseTab: React.FC<DatabaseTabProps> = ({ metrics, issues, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600" />
          Database Issues & Optimizations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Database Issues */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Active Database Issues ({metrics.databaseActive})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {issues.length > 0 ? (
                issues.map((issue, index) => (
                  <div key={index} className="p-3 bg-yellow-50 rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{issue.type}</span>
                      <Badge className="bg-yellow-600 text-xs">{issue.severity}</Badge>
                    </div>
                    <p className="text-sm text-gray-700">{issue.message}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: {issue.source}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-green-600">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">No Active Database Issues</p>
                </div>
              )}
            </div>
          </div>

          {/* Database Optimizations */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Database Optimizations ({metrics.databaseFixed})
            </h4>
            <div className="text-center py-6 text-gray-500">
              <Database className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Database optimizations will be tracked here</p>
              <p className="text-sm">When database fixes are implemented</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseTab;
