
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Issue } from './IssuesDataProcessor';
import { CodeFix } from '@/utils/verification/ImprovedRealCodeFixHandler';
import ImprovedRealIssueActionButton from './ImprovedRealIssueActionButton';

interface EnhancedIssueTopicGroupProps {
  topic: string;
  issues: Issue[];
  icon?: React.ComponentType<{ className?: string }>;
  onIssueFixed: (issue: Issue, fix: CodeFix) => void;
}

const EnhancedIssueTopicGroup: React.FC<EnhancedIssueTopicGroupProps> = ({
  topic,
  issues,
  icon: Icon,
  onIssueFixed
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  if (issues.length === 0) return null;

  const criticalCount = issues.filter(issue => issue.severity === 'critical').length;
  const highCount = issues.filter(issue => issue.severity === 'high').length;
  const mediumCount = issues.filter(issue => issue.severity === 'medium').length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            <span>{topic}</span>
            <Badge variant="outline" className="ml-2">
              {issues.length}
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </CardTitle>
        {isExpanded && (
          <div className="flex gap-2 mt-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} Critical
              </Badge>
            )}
            {highCount > 0 && (
              <Badge variant="destructive" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                {highCount} High
              </Badge>
            )}
            {mediumCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {mediumCount} Medium
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={
                        issue.severity === 'critical' ? 'destructive' : 
                        issue.severity === 'high' ? 'destructive' : 
                        'secondary'
                      }
                      className={
                        issue.severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' : ''
                      }
                    >
                      {issue.severity}
                    </Badge>
                    <span className="text-sm font-medium">{issue.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{issue.message}</p>
                  <p className="text-xs text-gray-500">Source: {issue.source}</p>
                  {issue.status && (
                    <p className="text-xs text-blue-600 mt-1">Status: {issue.status}</p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <ImprovedRealIssueActionButton 
                    issue={issue} 
                    onIssueFixed={onIssueFixed}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default EnhancedIssueTopicGroup;
