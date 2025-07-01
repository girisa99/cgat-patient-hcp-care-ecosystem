
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, UserX } from 'lucide-react';

interface PatientCardProps {
  patient: any;
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
  const patientName = patient.first_name && patient.last_name 
    ? `${patient.first_name} ${patient.last_name}`
    : patient.email || 'Unknown Patient';

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('👁️ PatientCard: View button clicked for patient:', patient.id);
    onView(patient.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('✏️ PatientCard: Edit button clicked for patient:', patient.id);
    onEdit(patient.id);
  };

  const handleDeactivate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🚫 PatientCard: Deactivate button clicked for patient:', patient.id);
    onDeactivate(patient.id, patientName);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-medium">{patientName}</h3>
                <p className="text-sm text-muted-foreground">{patient.email}</p>
                {patient.phone && (
                  <p className="text-sm text-muted-foreground">{patient.phone}</p>
                )}
                {patient.facilities && (
                  <p className="text-sm text-blue-600">{patient.facilities.name}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Patient
            </Badge>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleView}
                title="View Patient Details"
                className="h-8 px-3"
                type="button"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
                title="Edit Patient"
                className="h-8 px-3"
                type="button"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeactivate}
                disabled={isDeactivating}
                title="Deactivate Patient"
                className="h-8 px-3 text-red-600 hover:bg-red-50 border-red-200"
                type="button"
              >
                <UserX className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
