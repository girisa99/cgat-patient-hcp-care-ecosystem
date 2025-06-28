
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, CheckCircle, AlertTriangle } from 'lucide-react';
import { UnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { Issue } from '@/types/issuesTypes';

interface CodeQualityTabProps {
  metrics: UnifiedMetrics;
  issues: Issue[];
  onUpdate: () => void;
}

const CodeQualityTab: React.FC<CodeQualityTabProps> = ({ metrics, issues, onUpdate }) => {
  const codeQualityFixes = [
    { name: 'Code Quality Improvements', key: 'code_quality_improved', implemented: localStorage.getItem('code_quality_improved') === 'true' },
    { name: 'Performance Optimizations', key: 'performance_optimized', implemented: localStorage.getItem('performance_optimized') === 'true' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-purple-600" />
          Code Quality Issues & Improvements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Code Quality Issues */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-purple-600" />
              Active Code Quality Issues ({metrics.codeQualityActive})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {issues.length > 0 ? (
                issues.map((issue, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{issue.type}</span>
                      <Badge className="bg-purple-600 text-xs">{issue.severity}</Badge>
                    </div>
                    <p className="text-sm text-gray-700">{issue.message}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: {issue.source}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-green-600">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">No Active Code Quality Issues</p>
                </div>
              )}
            </div>
          </div>

          {/* Code Quality Fixes Status */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Code Quality Improvements Applied ({metrics.codeQualityFixed})
            </h4>
            <div className="space-y-2">
              {codeQualityFixes.map((fix) => (
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

export default CodeQualityTab;
