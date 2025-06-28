
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { Issue } from './IssuesDataProcessor';
import { CodeFix } from '@/utils/verification/RealCodeFixHandler';
import RealIssueActionButton from './RealIssueActionButton';

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
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTopicColor = (topic: string) => {
    switch (topic) {
      case 'Security Issues':
        return 'border-red-200 bg-red-50';
      case 'Database Issues':
        return 'border-blue-200 bg-blue-50';
      case 'Code Quality':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (issues.length === 0) return null;

  return (
    <Card className={`${getTopicColor(topic)} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {topic}
          <Badge variant="secondary" className="ml-auto">
            {issues.length} issues
          </Badge>
        </CardTitle>
        <CardDescription>
          Issues found in {topic.toLowerCase()} that can be automatically fixed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {issues.map((issue, index) => (
            <div
              key={`${issue.type}-${index}`}
              className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getSeverityColor(issue.severity)}>
                    {issue.severity.toUpperCase()}
                  </Badge>
                  <span className="font-medium text-sm text-gray-900">
                    {issue.type}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                  {issue.message}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Source: {issue.source}</span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <RealIssueActionButton
                  issue={issue}
                  onFixApplied={onIssueFixed}
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
