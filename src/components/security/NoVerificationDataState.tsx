
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw, PlayCircle } from 'lucide-react';

interface NoVerificationDataStateProps {
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const NoVerificationDataState: React.FC<NoVerificationDataStateProps> = ({
  onReRunVerification,
  isReRunning = false
}) => {
  const handleReRunVerification = () => {
    if (onReRunVerification) {
      onReRunVerification();
    }
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Verification Data</h3>
          <p className="text-muted-foreground mb-4">Run a security scan to see identified issues</p>
          <Button onClick={handleReRunVerification} disabled={isReRunning}>
            {isReRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Run Verification
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoVerificationDataState;
