
/**
 * Critical Findings Tab Component
 * Displays critical issues that require immediate attention
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface CriticalFindingsTabProps {
  criticalFindings: string[];
}

export const CriticalFindingsTab: React.FC<CriticalFindingsTabProps> = ({
  criticalFindings
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Critical Findings
        </CardTitle>
        <CardDescription>Issues that require immediate attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {criticalFindings.map((finding, index) => (
            <Alert key={index} variant="destructive">
              <AlertDescription>{finding}</AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
