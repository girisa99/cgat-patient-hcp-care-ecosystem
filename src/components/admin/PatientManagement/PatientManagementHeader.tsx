
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PatientManagementHeaderProps {
  meta: {
    dataSource: string;
    patientCount: number;
    focusArea: string;
  };
}

export const PatientManagementHeader: React.FC<PatientManagementHeaderProps> = ({ meta }) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patient Management</h2>
          <p className="text-muted-foreground">
            View and manage patient records across all facilities
          </p>
        </div>
      </div>

      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <AlertTriangle className="h-5 w-5" />
            ✅ Using Unified Data Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-green-800">
            <p><strong>Data Source:</strong> {meta.dataSource}</p>
            <p><strong>Total Patients:</strong> {meta.patientCount}</p>
            <p><strong>Focus Area:</strong> {meta.focusArea}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
