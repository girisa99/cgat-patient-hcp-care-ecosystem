
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { UnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { Issue } from '@/types/issuesTypes';

interface UIUXTabProps {
  metrics: UnifiedMetrics;
  issues: Issue[];
  onUpdate: () => void;
}

const UIUXTab: React.FC<UIUXTabProps> = ({ metrics, issues, onUpdate }) => {
  const uiuxFixes = [
    { name: 'UI/UX Improvements', key: 'uiux_improvements_applied', implemented: localStorage.getItem('uiux_improvements_applied') === 'true' },
    { name: 'Accessibility Standards', key: 'accessibility_enhanced', implemented: localStorage.getItem('accessibility_enhanced') === 'true' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          UI/UX Issues & Improvements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active UI/UX Issues */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Active UI/UX Issues ({metrics.uiuxActive})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {issues.length > 0 ? (
                issues.map((issue, index) => (
                  <div key={index} className="p-3 bg-orange-50 rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{issue.type}</span>
                      <Badge className="bg-orange-600 text-xs">{issue.severity}</Badge>
                    </div>
                    <p className="text-sm text-gray-700">{issue.message}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: {issue.source}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-green-600">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">No Active UI/UX Issues</p>
                </div>
              )}
            </div>
          </div>

          {/* UI/UX Fixes Status */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              UI/UX Improvements Applied ({metrics.uiuxFixed})
            </h4>
            <div className="space-y-2">
              {uiuxFixes.map((fix) => (
                <div key={fix.key} className={`p-3 rounded border ${
                  fix.implemented ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{fix.name}</span>
                    <Badge variant={fix.implemented ? "default" : "outline"} 
                           className={fix.implemented ? "bg-green-600" : ""}>
                      {fix.implemented ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Applied
                        </>
                      ) : (
                        'Pending'
                      )}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UIUXTab;
