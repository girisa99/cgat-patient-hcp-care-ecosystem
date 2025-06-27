
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RefreshCw } from 'lucide-react';

const VerificationLoadingState: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Running Comprehensive Verification...
        </CardTitle>
        <CardDescription>
          Testing admin module stability, UI/UX patterns, security, and performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={75} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Analyzing: Core verification, UI/UX validation, database health, security compliance...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationLoadingState;
