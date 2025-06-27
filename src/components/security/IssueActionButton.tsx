
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const handleAction = async (actionType: 'run' | 'fix') => {
    setIsRunning(true);
    try {
      await onAction(issue, actionType);
      toast({
        title: `${actionType === 'run' ? 'Test' : 'Fix'} Complete`,
        description: `Successfully ${actionType === 'run' ? 'executed test for' : 'applied fix to'} ${issue.type}`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: `${actionType === 'run' ? 'Test' : 'Fix'} Failed`,
        description: `Failed to ${actionType} issue: ${error}`,
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
          disabled={isRunning}
          className="flex items-center gap-1"
        >
          <Wrench className="h-3 w-3" />
          {isRunning ? 'Fixing...' : 'Fix Now'}
        </Button>
      );
    }

    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('run')}
          disabled={isRunning}
          className="flex items-center gap-1"
        >
          <Play className="h-3 w-3" />
          Test
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() => handleAction('fix')}
          disabled={isRunning}
          className="flex items-center gap-1"
        >
          <Wrench className="h-3 w-3" />
          Fix
        </Button>
      </div>
    );
  };

  return getActionButtons();
};

export default IssueActionButton;
