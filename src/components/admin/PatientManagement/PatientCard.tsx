
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
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Patient
            </Badge>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(patient.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(patient.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDeactivate(patient.id, patientName)}
                disabled={isDeactivating}
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
