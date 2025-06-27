
/**
 * System Assessment Error State Component
 * Displays error state with retry option
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SystemAssessmentErrorStateProps {
  onRetry: () => void;
}

export const SystemAssessmentErrorState: React.FC<SystemAssessmentErrorStateProps> = ({
  onRetry
}) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Assessment Failed</AlertTitle>
      <AlertDescription>
        Failed to run system assessment. Please try again.
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="ml-2"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
};
