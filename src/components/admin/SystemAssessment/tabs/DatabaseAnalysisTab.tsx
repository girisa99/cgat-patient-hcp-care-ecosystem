
/**
 * Database Analysis Tab Component
 * Displays database table utilization and optimization opportunities
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';
import { TableUtilizationAssessment } from '@/utils/assessment/types/AssessmentTypes';

interface DatabaseAnalysisTabProps {
  tableUtilization: TableUtilizationAssessment;
}

export const DatabaseAnalysisTab: React.FC<DatabaseAnalysisTabProps> = ({
  tableUtilization
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Table Analysis</CardTitle>
        <CardDescription>Review of table utilization and optimization opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Essential Tables ({tableUtilization.essentialTables.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tableUtilization.essentialTables.map((table, index) => (
                <Card key={index} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{table.name}</h5>
                      <p className="text-sm text-muted-foreground">{table.purpose}</p>
                    </div>
                    <Badge variant={table.isActive ? 'default' : 'secondary'}>
                      {table.recordCount} records
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Tables for Review ({tableUtilization.unnecessaryTables.length})</h4>
            <div className="space-y-3">
              {tableUtilization.unnecessaryTables.map((table, index) => (
                <Alert key={index}>
                  <Database className="h-4 w-4" />
                  <AlertTitle>{table.name} ({table.recordCount} records)</AlertTitle>
                  <AlertDescription>
                    {table.reason}
                    {table.canDelete && (
                      <Badge variant="destructive" className="ml-2">Can be removed</Badge>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
