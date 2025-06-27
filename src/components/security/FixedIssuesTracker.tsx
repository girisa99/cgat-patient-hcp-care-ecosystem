
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Wrench } from 'lucide-react';

interface FixedIssue {
  id: string;
  type: string;
  message: string;
  source: string;
  severity: string;
  fixedAt: string;
  fixMethod: 'automatic' | 'manual';
}

interface FixedIssuesTrackerProps {
  fixedIssues: FixedIssue[];
  totalFixesApplied: number;
}

const FixedIssuesTracker: React.FC<FixedIssuesTrackerProps> = ({
  fixedIssues,
  totalFixesApplied
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFixMethodIcon = (method: string) => {
    return method === 'automatic' ? 
      <Wrench className="h-3 w-3 text-green-600" /> : 
      <CheckCircle className="h-3 w-3 text-blue-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Fixed Issues ({totalFixesApplied})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {fixedIssues.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No issues have been fixed yet
          </div>
        ) : (
          <div className="space-y-3">
            {fixedIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                    <span className="text-sm font-medium">{issue.type}</span>
                    {getFixMethodIcon(issue.fixMethod)}
                  </div>
                  <p className="text-sm text-muted-foreground">{issue.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Fixed: {new Date(issue.fixedAt).toLocaleString()}</span>
                    <span>• Source: {issue.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FixedIssuesTracker;
