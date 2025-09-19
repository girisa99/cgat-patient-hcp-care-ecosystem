
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { EnhancedPatientDashboard } from '@/components/patients/EnhancedPatientDashboard';

const PatientPage: React.FC = () => {
  console.log('🏥 Patient page - Enhanced with real-time enrollment tracking');
  
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
      <EnhancedPatientDashboard />
    </AppLayout>
  );
};

export default PatientPage;
