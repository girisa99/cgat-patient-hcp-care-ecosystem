
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw } from 'lucide-react';

interface NoIssuesStateProps {
  fixedCount: number;
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const NoIssuesState: React.FC<NoIssuesStateProps> = ({
  fixedCount,
  onReRunVerification,
  isReRunning = false
}) => {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-green-800">No Active Issues</h3>
          <p className="text-muted-foreground mb-4">
            All issues have been resolved! {fixedCount > 0 && `${fixedCount} issues fixed.`}
          </p>
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
      </CardContent>
    </Card>
  );
};

export default NoIssuesState;
