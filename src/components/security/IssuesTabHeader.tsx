
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface IssuesTabHeaderProps {
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const IssuesTabHeader: React.FC<IssuesTabHeaderProps> = ({
  onReRunVerification,
  isReRunning = false
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">Issues Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Issues identified by the verification system, categorized by topic
        </p>
      </div>
      <Button onClick={onReRunVerification} disabled={isReRunning} variant="outline">
        {isReRunning ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Re-Running...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-Run Verification
          </>
        )}
      </Button>
    </div>
  );
};

export default IssuesTabHeader;
