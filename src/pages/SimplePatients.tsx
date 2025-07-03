import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import { usePatients } from '@/hooks/usePatients';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Badge } from '@/components/ui/badge';

const SimplePatients: React.FC = () => {
  console.log('🏥 Simple Patients page rendering');
  const { patients, isLoading, error, getPatientStats } = usePatients();
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

  const stats = getPatientStats();

  return (
    <AppLayout title="Patient Management">
      <div className="space-y-6">
        {/* Patient Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Patients</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
              <div className="text-sm text-muted-foreground">Verified Patients</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.withFacilities}</div>
              <div className="text-sm text-muted-foreground">With Facilities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.recent}</div>
              <div className="text-sm text-muted-foreground">Recent Additions</div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Patient Management
              <Badge variant="outline">{patients.length} patients</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading patients...</p>
            ) : error ? (
              <p className="text-red-600">Error: {String(error)}</p>
            ) : (
              <div className="space-y-4">
                <p>Managing {patients.length} patients across all facilities.</p>
                
                {/* Patient List Preview */}
                <div className="space-y-2">
                  {patients.slice(0, 5).map((patient: any) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                        <div className="text-sm text-muted-foreground">ID: {patient.patient_id}</div>
                      </div>
                      <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                        {patient.status}
                      </Badge>
                    </div>
                  ))}
                  {patients.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      And {patients.length - 5} more patients...
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SimplePatients;