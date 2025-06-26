
import React from 'react';
import { UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientCard } from './PatientCard';
import { Progress } from '@/components/ui/progress';

interface PatientsListProps {
  patients: any[];
  onView: (patientId: string) => void;
  onEdit: (patientId: string) => void;
  onDeactivate: (patientId: string, patientName: string) => void;
  isDeactivating: boolean;
  isLoading: boolean;
  searchTerm: string;
  onBulkDeactivate?: (selectedPatients: string[]) => void;
  isBulkProcessing?: boolean;
  bulkProgress?: number;
  isMobileApp?: boolean;
  isOnline?: boolean;
}

export const PatientsList: React.FC<PatientsListProps> = ({
  patients,
  onView,
  onEdit,
  onDeactivate,
  isDeactivating,
  isLoading,
  searchTerm,
  onBulkDeactivate,
  isBulkProcessing = false,
  bulkProgress = 0,
  isMobileApp = false,
  isOnline = true
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Registered Patients ({patients.length})
          {isMobileApp && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Mobile
            </span>
          )}
          {!isOnline && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Offline
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isBulkProcessing && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Processing bulk operation...</span>
              <span>{Math.round(bulkProgress)}%</span>
            </div>
            <Progress value={bulkProgress} className="w-full" />
          </div>
        )}
        
        <div className="space-y-4">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onView={onView}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
              isDeactivating={isDeactivating}
            />
          ))}
        </div>
        
        {patients.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
