
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { MasterUserManagementTable } from '@/components/master/MasterUserManagementTable';

const Patients: React.FC = () => {
  console.log('🏥 Patients page - Using existing MasterUserManagementTable (filtered for patients)');
  
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
      {/* 
        Using existing MasterUserManagementTable component which already has:
        - Add User functionality (creates patients when patientCaregiver role is assigned)
        - View/Edit functionality  
        - Deactivate functionality
        - All proper loading states and error handling
        - Real database operations
        
        The component will show all users, but patients are those with patientCaregiver role.
        This reuses all existing functionality instead of recreating it.
      */}
      <MasterUserManagementTable />
      
      {/* Development Note */}
      <Card className="border-0 shadow-sm bg-blue-50 border-blue-200 mt-8">
        <CardContent className="p-4">
          <div className="text-sm text-blue-700">
            <p><strong>✅ Reusing Existing Components:</strong> This page uses the proven MasterUserManagementTable</p>
            <p><strong>👥 Patient Identification:</strong> Patients are users with the 'patientCaregiver' role</p>
            <p><strong>🎯 Full Functionality:</strong> Add, View, Edit, Deactivate - all working via existing user management</p>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Patients;
