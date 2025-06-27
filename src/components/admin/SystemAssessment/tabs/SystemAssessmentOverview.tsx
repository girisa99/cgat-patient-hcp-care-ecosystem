
/**
 * System Assessment Overview Component
 * Displays executive summary and key metrics
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { AssessmentReport } from '@/utils/assessment/types/AssessmentTypes';

interface SystemAssessmentOverviewProps {
  assessmentReport: AssessmentReport;
  totalTablesReviewed: number;
  unnecessaryTablesCount: number;
  emptyTablesCount: number;
  hasCriticalFindings: boolean;
}

export const SystemAssessmentOverview: React.FC<SystemAssessmentOverviewProps> = ({
  assessmentReport,
  totalTablesReviewed,
  unnecessaryTablesCount,
  emptyTablesCount,
  hasCriticalFindings
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          System Overview
        </CardTitle>
        <CardDescription>
          Key metrics and health indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="text-sm font-medium">Tables Reviewed</span>
              </div>
              <div className="mt-2 text-2xl font-bold">{totalTablesReviewed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Unnecessary Tables</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-orange-600">{unnecessaryTablesCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Empty Tables</span>
              </div>
              <div className="mt-2 text-2xl font-bold">{emptyTablesCount}</div>
            </CardContent>
          </Card>
        </div>

        {hasCriticalFindings && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Findings Detected</AlertTitle>
            <AlertDescription>
              {assessmentReport.criticalFindings.length} critical issues require immediate attention.
            </AlertDescription>
          </Alert>
        )}

        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
            {assessmentReport.executiveSummary}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
