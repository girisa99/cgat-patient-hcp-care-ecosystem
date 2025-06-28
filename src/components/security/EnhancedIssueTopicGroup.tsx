
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { Issue } from './IssuesDataProcessor';
import { CodeFix } from '@/utils/verification/ImprovedRealCodeFixHandler';
import ImprovedRealIssueActionButton from './ImprovedRealIssueActionButton';

interface EnhancedIssueTopicGroupProps {
  topic: string;
  issues: Issue[];
  icon: LucideIcon;
  onIssueFixed: (issue: Issue, fix: CodeFix) => void;
}

const EnhancedIssueTopicGroup: React.FC<EnhancedIssueTopicGroupProps> = ({
  topic,
  issues,
  icon: Icon,
  onIssueFixed
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {topic} ({issues.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getSeverityColor(issue.severity)}>
                    {issue.severity}
                  </Badge>
                  <span className="text-sm font-medium">{issue.type}</span>
                </div>
                <p className="text-sm text-muted-foreground">{issue.message}</p>
                <p className="text-xs text-muted-foreground mt-1">Source: {issue.source}</p>
              </div>
              <div className="ml-4">
                <ImprovedRealIssueActionButton
                  issue={issue}
                  onIssueFixed={onIssueFixed}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedIssueTopicGroup;
