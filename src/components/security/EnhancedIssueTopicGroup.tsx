
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
  icon?: LucideIcon;
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

  const getStatusBadge = (issue: Issue) => {
    if (issue.status === 'new') {
      return <Badge variant="destructive" className="text-xs">NEW</Badge>;
    }
    if (issue.status === 'reappeared') {
      return <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">REAPPEARED</Badge>;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {Icon && <Icon className="h-5 w-5" />}
          {topic}
          <Badge variant="outline" className="ml-auto">
            {issues.length} issue{issues.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <div 
              key={`${issue.type}-${index}`}
              className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)} space-y-2`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{issue.type}</h4>
                    {getStatusBadge(issue)}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSeverityColor(issue.severity)}`}
                    >
                      {issue.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm opacity-90">{issue.message}</p>
                  <p className="text-xs opacity-75">Source: {issue.source}</p>
                </div>
                <div className="flex-shrink-0">
                  <ImprovedRealIssueActionButton
                    issue={issue}
                    onIssueFixed={onIssueFixed}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedIssueTopicGroup;
