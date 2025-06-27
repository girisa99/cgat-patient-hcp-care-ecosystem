
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Wrench, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { automatedFixHandler, FixableIssue } from '@/utils/verification/AutomatedFixHandler';

interface Issue {
  type: string;
  message: string;
  source: string;
  severity: string;
}

interface IssueActionButtonProps {
  issue: Issue;
  onAction: (issue: Issue, actionType: 'run' | 'fix') => Promise<void>;
}

const IssueActionButton: React.FC<IssueActionButtonProps> = ({ issue, onAction }) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = React.useState(false);
  const [isFixing, setIsFixing] = React.useState(false);

  const handleAction = async (actionType: 'run' | 'fix') => {
    if (actionType === 'fix') {
      await handleAutomatedFix();
    } else {
      await handleTestRun();
    }
  };

  const handleAutomatedFix = async () => {
    setIsFixing(true);
    try {
      // Convert issue to FixableIssue format
      const fixableIssues = automatedFixHandler.getAvailableFixes([issue]);
      const fixableIssue = fixableIssues[0];

      if (!fixableIssue) {
        throw new Error('No automated fix available for this issue type');
      }

      console.log('🔧 Applying automated fix for:', fixableIssue.type);
      
      const result = await automatedFixHandler.applyFix(fixableIssue);

      if (result.success) {
        toast({
          title: "🔧 Fix Applied Successfully",
          description: result.fixApplied || `Successfully fixed ${issue.type}`,
          variant: "default",
        });

        if (result.auditLogId) {
          console.log(`📋 Fix logged to audit with ID: ${result.auditLogId}`);
        }

        if (result.requiresUserAction && result.nextSteps) {
          toast({
            title: "📋 Additional Steps Required",
            description: result.nextSteps.join(', '),
            variant: "default",
          });
        }

        // Call the original onAction to update parent state
        await onAction(issue, 'fix');
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('❌ Automated fix failed:', error);
      toast({
        title: "❌ Fix Failed",
        description: `Failed to apply automated fix: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleTestRun = async () => {
    setIsRunning(true);
    try {
      await onAction(issue, 'run');
      toast({
        title: "✅ Test Complete",
        description: `Successfully executed test for ${issue.type}`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "❌ Test Failed",
        description: `Failed to execute test: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getActionButtons = () => {
    if (issue.severity === 'critical' || issue.type.includes('Security')) {
      return (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleAction('fix')}
          disabled={isFixing || isRunning}
          className="flex items-center gap-1"
        >
          {isFixing ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Fixing...
            </>
          ) : (
            <>
              <Wrench className="h-3 w-3" />
              Fix Now
            </>
          )}
        </Button>
      );
    }

    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('run')}
          disabled={isRunning || isFixing}
          className="flex items-center gap-1"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              Test
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() => handleAction('fix')}
          disabled={isFixing || isRunning}
          className="flex items-center gap-1"
        >
          {isFixing ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Fixing...
            </>
          ) : (
            <>
              <Wrench className="h-3 w-3" />
              Fix
            </>
          )}
        </Button>
      </div>
    );
  };

  return getActionButtons();
};

export default IssueActionButton;
