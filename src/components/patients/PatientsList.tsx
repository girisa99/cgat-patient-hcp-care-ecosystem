
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Phone, Mail, Building2 } from 'lucide-react';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  facilities?: {
    name: string;
    facility_type: string;
  } | null;
  user_roles: Array<{
    roles: {
      name: string;
    };
  }>;
}

interface PatientsListProps {
  patients: Patient[];
  onEditPatient: (patient: Patient) => void;
}

const PatientsList: React.FC<PatientsListProps> = ({ patients, onEditPatient }) => {
  if (patients.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No patients found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <div key={patient.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-lg">
                  {patient.first_name} {patient.last_name}
                </h3>
                <Badge variant="outline">
                  {patient.user_roles[0]?.roles?.name || 'Patient'}
                </Badge>
              </div>
              
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {patient.email}
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {patient.phone}
                  </div>
                )}
                {patient.facilities && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    {patient.facilities.name} ({patient.facilities.facility_type})
                  </div>
                )}
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                Added: {new Date(patient.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditPatient(patient)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientsList;
