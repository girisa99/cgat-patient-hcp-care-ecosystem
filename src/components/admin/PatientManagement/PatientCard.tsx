
import React from 'react';
import { Eye, Edit, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PatientCardProps {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    created_at: string;
    facilities?: {
      name: string;
    } | null;
  };
  onView: (patientId: string) => void;
  onEdit: (patientId: string) => void;
  onDeactivate: (patientId: string, patientName: string) => void;
  isDeactivating: boolean;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onView,
  onEdit,
  onDeactivate,
  isDeactivating
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">
            {patient.first_name} {patient.last_name}
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
            <span>{patient.email}</span>
            {patient.phone && (
              <>
                <span className="hidden sm:inline">•</span>
                <span>{patient.phone}</span>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
            <span>
              Facility: {patient.facilities?.name || 'Not assigned'}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Registered: {formatDate(patient.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Active
          </span>
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
              onClick={() => onView(patient.id)}
            >
              <Eye className="h-3 w-3" />
              <span>View</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
              onClick={() => onEdit(patient.id)}
            >
              <Edit className="h-3 w-3" />
              <span>Edit</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              onClick={() => onDeactivate(
                patient.id, 
                `${patient.first_name} ${patient.last_name}`
              )}
              disabled={isDeactivating}
            >
              <UserX className="h-3 w-3" />
              <span>Deactivate</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
