
import React from 'react';
import { UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientCard } from './PatientCard';
import { Progress } from '@/components/ui/progress';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';

interface PatientsListProps {
  patients?: any[];
  onView?: (patientId: string) => void;
  onEdit?: (patientId: string) => void;
  onDeactivate?: (patientId: string, patientName: string) => void;
  isDeactivating?: boolean;
  isLoading?: boolean;
  searchTerm?: string;
  onBulkDeactivate?: (selectedPatients: string[]) => void;
  isBulkProcessing?: boolean;
  bulkProgress?: number;
  isMobileApp?: boolean;
  isOnline?: boolean;
}

export const PatientsList: React.FC<PatientsListProps> = ({
  patients: propPatients,
  onView,
  onEdit,
  onDeactivate,
  isDeactivating = false,
  isLoading: propIsLoading,
  searchTerm = '',
  onBulkDeactivate,
  isBulkProcessing = false,
  bulkProgress = 0,
  isMobileApp = false,
  isOnline = true
}) => {
  // Use hook data if no props provided (single source of truth)
  const { users, isLoading: hookIsLoading, getPatients } = useUnifiedUserManagement();
  
  // Get patients from unified user management - single source of truth
  const patients = propPatients || getPatients();
  
  const isLoading = propIsLoading !== undefined ? propIsLoading : hookIsLoading;

  // Ensure patients is always an array
  const safePatients = Array.isArray(patients) ? patients : [];

  const handleView = (patientId: string) => {
    console.log('👁️ Viewing patient:', patientId);
    if (onView) {
      onView(patientId);
    } else {
      // Default view action - could open a patient details modal/page
      console.log('View patient details for:', patientId);
    }
  };

  const handleEdit = (patientId: string) => {
    console.log('✏️ Editing patient:', patientId);
    if (onEdit) {
      onEdit(patientId);
    } else {
      // Default edit action - could open an edit form
      console.log('Edit patient details for:', patientId);
    }
  };

  const handleDeactivate = (patientId: string, patientName: string) => {
    console.log('🚫 Deactivating patient:', patientId, patientName);
    if (onDeactivate) {
      onDeactivate(patientId, patientName);
    } else {
      // Default deactivate action - could show confirmation dialog
      console.log('Deactivate patient:', patientId, patientName);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Loading Patients...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Registered Patients ({safePatients.length})
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
          {safePatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onView={handleView}
              onEdit={handleEdit}
              onDeactivate={handleDeactivate}
              isDeactivating={isDeactivating}
            />
          ))}
        </div>
        
        {safePatients.length === 0 && !isLoading && (
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

export default PatientsList;
