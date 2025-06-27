
/**
 * Real-time Sync Tab Component
 * Displays real-time synchronization status across system modules
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { RealTimeSyncAssessment } from '@/utils/assessment/types/AssessmentTypes';

interface RealTimeSyncTabProps {
  realTimeSyncStatus: RealTimeSyncAssessment;
}

export const RealTimeSyncTab: React.FC<RealTimeSyncTabProps> = ({
  realTimeSyncStatus
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Real-time Sync Status
        </CardTitle>
        <CardDescription>Analysis of real-time synchronization across system modules</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(realTimeSyncStatus).map(([module, status]: [string, any]) => (
            <Card key={module} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium capitalize">{module.replace(/([A-Z])/g, ' $1').trim()}</h5>
                <Badge variant={status.realTimeUpdates ? 'default' : 'secondary'}>
                  {status.syncStatus || (status.hasRealTimeSync ? 'Active' : 'Inactive')}
                </Badge>
              </div>
              {status.issues && status.issues.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Issues:</p>
                  <ul className="list-disc list-inside">
                    {status.issues.map((issue: string, idx: number) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
