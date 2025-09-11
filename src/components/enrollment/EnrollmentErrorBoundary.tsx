/**
 * ENROLLMENT ERROR BOUNDARY
 * Specialized error boundary for AI enrollment components
 */
import React from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface EnrollmentErrorFallbackProps {
  error: Error;
  retry: () => void;
  onBack?: () => void;
}

const EnrollmentErrorFallback: React.FC<EnrollmentErrorFallbackProps> = ({ 
  error, 
  retry, 
  onBack 
}) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle className="text-destructive">AI Assistant Temporarily Unavailable</CardTitle>
          <p className="text-muted-foreground">
            There was an issue loading the AI enrollment assistant. This might be due to:
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Network connectivity issues</li>
            <li>• AI service temporarily offline</li>
            <li>• Browser compatibility issues</li>
          </ul>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">What you can do:</h4>
            <div className="space-y-2 text-sm">
              <p>1. Try refreshing the AI assistant</p>
              <p>2. Use the traditional form method instead</p>
              <p>3. Contact support if the issue persists</p>
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            {onBack && (
              <Button 
                variant="outline" 
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Options
              </Button>
            )}
            
            <Button 
              onClick={retry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-2 bg-muted rounded text-xs">
              <summary className="cursor-pointer">Technical Details (Dev Mode)</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface EnrollmentErrorBoundaryProps {
  children: React.ReactNode;
  onBack?: () => void;
}

export const EnrollmentErrorBoundary: React.FC<EnrollmentErrorBoundaryProps> = ({ 
  children, 
  onBack 
}) => {
  return (
    <ErrorBoundary
      fallbackComponent={({ error, retry }) => (
        <EnrollmentErrorFallback 
          error={error} 
          retry={retry} 
          onBack={onBack}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};