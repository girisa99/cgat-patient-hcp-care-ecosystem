
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { PatientManagementTable } from '@/components/patients/PatientManagementTable';

const Patients: React.FC = () => {
  console.log('🏥 Patients page - Using existing working components and relationships');
  
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  
  if (!hasAccess('/patients')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Patient Management.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Patient Management">
      <PatientManagementTable />
    </AppLayout>
  );
};

export default Patients;
