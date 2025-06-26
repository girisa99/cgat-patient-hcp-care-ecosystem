
import React from 'react';
import { UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientCard } from './PatientCard';

interface PatientsListProps {
  patients: any[];
  onView: (patientId: string) => void;
  onEdit: (patientId: string) => void;
  onDeactivate: (patientId: string, patientName: string) => void;
  isDeactivating: boolean;
  isLoading: boolean;
  searchTerm: string;
}

export const PatientsList: React.FC<PatientsListProps> = ({
  patients,
  onView,
  onEdit,
  onDeactivate,
  isDeactivating,
  isLoading,
  searchTerm
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Registered Patients ({patients.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
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
