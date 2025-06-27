
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, PlayCircle, Settings } from 'lucide-react';
import IssueActionButton from './IssueActionButton';

interface Issue {
  type: string;
  message: string;
  source: string;
  severity: string;
}

interface IssueTopicGroupProps {
  topic: string;
  issues: Issue[];
  icon: React.ComponentType<{ className?: string }>;
  onIssueAction: (issue: Issue, actionType: 'run' | 'fix') => Promise<void>;
  onBulkAction: (issues: Issue[], actionType: 'run' | 'fix') => Promise<void>;
}

const IssueTopicGroup: React.FC<IssueTopicGroupProps> = ({
  topic,
  issues,
  icon: Icon,
  onIssueAction,
  onBulkAction
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isBulkRunning, setIsBulkRunning] = React.useState(false);

  const criticalCount = issues.filter(issue => issue.severity === 'critical').length;
  const highCount = issues.filter(issue => issue.severity === 'high').length;

  const handleBulkAction = async (actionType: 'run' | 'fix') => {
    setIsBulkRunning(true);
    try {
      await onBulkAction(issues, actionType);
    } finally {
      setIsBulkRunning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Icon className="h-5 w-5" />
                <span>{topic}</span>
                <Badge variant="outline" className="ml-2">
                  {issues.length} issues
                </Badge>
                {criticalCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {criticalCount} critical
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBulkAction('run');
                  }}
                  disabled={isBulkRunning}
                  className="flex items-center gap-1"
                >
                  <PlayCircle className="h-3 w-3" />
                  Test All
                </Button>
                <Button
                  size="sm"
                  variant={criticalCount > 0 ? "destructive" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBulkAction('fix');
                  }}
                  disabled={isBulkRunning}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  {isBulkRunning ? 'Fixing...' : 'Fix All'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(issue.severity) as any}>
                        {issue.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {issue.source}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.message}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <IssueActionButton
                      issue={issue}
                      onAction={onIssueAction}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default IssueTopicGroup;
