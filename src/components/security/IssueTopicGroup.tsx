
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Database, 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  PlayCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import IssueActionButton from './IssueActionButton';
import { automatedFixHandler } from '@/utils/verification/AutomatedFixHandler';

interface Issue {
  type: string;
  message: string;
  source: string;
  severity: string;
}

interface IssueTopicGroupProps {
  topic: string;
  issues: Issue[];
  icon: React.ComponentType<any>;
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
  const { toast } = useToast();
  const [isBulkFixing, setIsBulkFixing] = React.useState(false);
  const [isBulkTesting, setIsBulkTesting] = React.useState(false);

  const criticalIssues = issues.filter(issue => issue.severity === 'critical');
  const highIssues = issues.filter(issue => issue.severity === 'high');

  const handleBulkFix = async () => {
    setIsBulkFixing(true);
    try {
      console.log(`🔧 Starting bulk fix for ${issues.length} ${topic} issues`);
      
      // Convert issues to fixable format
      const fixableIssues = automatedFixHandler.getAvailableFixes(issues);
      
      // Apply fixes with sequential mode for critical issues, parallel for others
      const mode = criticalIssues.length > 0 ? 'sequential' : 'parallel';
      const result = await automatedFixHandler.applyBulkFixes(fixableIssues, mode);

      toast({
        title: "🔧 Bulk Fix Complete",
        description: `Fixed ${result.successfulFixes}/${result.totalIssues} issues. ${result.auditLogIds.length} entries logged to audit.`,
        variant: result.failedFixes === 0 ? "default" : "destructive",
      });

      // Update parent state
      await onBulkAction(issues, 'fix');

      console.log(`✅ Bulk fix complete: ${result.successfulFixes} successful, ${result.failedFixes} failed`);
    } catch (error) {
      console.error('❌ Bulk fix failed:', error);
      toast({
        title: "❌ Bulk Fix Failed",
        description: `Failed to apply bulk fixes: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsBulkFixing(false);
    }
  };

  const handleBulkTest = async () => {
    setIsBulkTesting(true);
    try {
      await onBulkAction(issues, 'run');
      toast({
        title: "✅ Bulk Test Complete",
        description: `Successfully tested ${issues.length} ${topic} issues`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "❌ Bulk Test Failed",
        description: `Failed to run bulk tests: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsBulkTesting(false);
    }
  };

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle>{topic}</CardTitle>
            <Badge variant="outline">{issues.length} issues</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkTest}
              disabled={isBulkTesting || isBulkFixing}
              className="flex items-center gap-1"
            >
              {isBulkTesting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Testing All...
                </>
              ) : (
                <>
                  <PlayCircle className="h-3 w-3" />
                  Test All
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="default"
              onClick={handleBulkFix}
              disabled={isBulkFixing || isBulkTesting}
              className="flex items-center gap-1"
            >
              {isBulkFixing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Fixing All...
                </>
              ) : (
                <>
                  <Wrench className="h-3 w-3" />
                  Fix All ({issues.length})
                </>
              )}
            </Button>
          </div>
        </div>
        
        <CardDescription>
          {criticalIssues.length > 0 && (
            <span className="text-red-600 font-medium">
              {criticalIssues.length} critical, 
            </span>
          )}
          {highIssues.length > 0 && (
            <span className="text-orange-600 font-medium">
              {' '}{highIssues.length} high priority issues
            </span>
          )}
          {criticalIssues.length === 0 && highIssues.length === 0 && (
            <span className="text-green-600">No critical issues</span>
          )}
        </CardDescription>
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
                <IssueActionButton
                  issue={issue}
                  onAction={onIssueAction}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueTopicGroup;
