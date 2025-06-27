
/**
 * System Assessment Empty State Component
 * Displays when no assessment has been run yet
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface SystemAssessmentEmptyStateProps {
  onRunAssessment: () => void;
}

export const SystemAssessmentEmptyState: React.FC<SystemAssessmentEmptyStateProps> = ({
  onRunAssessment
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Assessment</CardTitle>
        <CardDescription>Run assessment to analyze system health</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onRunAssessment}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Run Assessment
        </Button>
      </CardContent>
    </Card>
  );
};
