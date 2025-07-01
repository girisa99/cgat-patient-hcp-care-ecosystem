
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, UserX, Mail, CheckCircle } from 'lucide-react';
import { UserWithRoles } from '@/types/userManagement';

interface PatientsListProps {
  patients: UserWithRoles[];
  onEditPatient: (patient: UserWithRoles) => void;
  onView?: (patient: UserWithRoles) => void;
  onEdit?: (patient: UserWithRoles) => void;
  onDeactivate?: (patient: UserWithRoles) => void;
  isDeactivating?: boolean;
  isLoading?: boolean;
  searchTerm?: string;
}

const PatientsList: React.FC<PatientsListProps> = ({
  patients,
  onEditPatient,
  onView,
  onEdit,
  onDeactivate,
  isDeactivating = false,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading patients...</p>
        </CardContent>
      </Card>
    );
  }

  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No patients found.</p>
        </CardContent>
      </Card>
    );
  }

  const handleView = (patient: UserWithRoles) => {
    console.log('👁️ Viewing patient:', patient.id, patient.email);
    if (onView) onView(patient);
    else console.log('View patient:', patient);
  };

  const handleEdit = (patient: UserWithRoles) => {
    console.log('✏️ Editing patient:', patient.id, patient.email);
    if (onEdit) onEdit(patient);
    else onEditPatient(patient);
  };

  const handleDeactivate = (patient: UserWithRoles) => {
    console.log('🚫 Deactivating patient:', patient.id, patient.email);
    if (onDeactivate) onDeactivate(patient);
    else console.log('Deactivate patient:', patient);
  };

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <Card key={patient.id} className="border hover:border-blue-200 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {patient.first_name || patient.last_name 
                    ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
                    : patient.email
                  }
                </CardTitle>
                <p className="text-sm text-muted-foreground">{patient.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {patient.email_confirmed_at ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Mail className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{patient.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Facility</p>
                <p className="font-medium">
                  {patient.facilities?.name || 'Not assigned'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {patient.user_roles?.map((userRole, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {userRole.roles.name}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(patient)}
                  className="h-8 px-3"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(patient)}
                  className="h-8 px-3"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeactivate(patient)}
                  disabled={isDeactivating}
                  className="h-8 px-3 text-red-600 hover:bg-red-50 border-red-200"
                >
                  <UserX className="h-3 w-3 mr-1" />
                  Deactivate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PatientsList;
