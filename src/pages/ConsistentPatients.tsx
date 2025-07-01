
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Activity } from 'lucide-react';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { UserEmailStatus } from '@/components/users/UserEmailStatus';

const ConsistentPatients = () => {
  const { users, isLoading, error, getPatients, meta } = useUnifiedUserManagement();
  
  const patients = getPatients();

  console.log('📊 ConsistentPatients - Data:', {
    totalUsers: users.length,
    patients: patients.length,
    isLoading,
    error: error?.message,
    meta
  });

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer title="Patients" subtitle="Loading patient data...">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading patients from unified data source...</p>
            </CardContent>
          </Card>
        </PageContainer>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <PageContainer title="Patients" subtitle="Error loading patient data">
          <Card>
            <CardContent className="p-8 text-center text-red-600">
              <p>Error loading patients: {error.message}</p>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-left">
                <h4 className="font-semibold text-yellow-800">System Info:</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Source: {meta.dataSource}
                </p>
                <p className="text-sm text-yellow-700">
                  Version: {meta.version}
                </p>
              </div>
            </CardContent>
          </Card>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Patients"
        subtitle={`Unified patient management system (${patients.length} patients)`}
        fluid
      >
        {/* Data Source Information */}
        <Card className="mb-6 border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-900 text-lg">
              <UserCheck className="h-5 w-5" />
              Patient Data Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-800 space-y-1">
              <p><strong>Data Source:</strong> {meta.dataSource}</p>
              <div className="flex gap-4">
                <span><strong>Total Patients:</strong> {patients.length}</span>
                <span><strong>All Users:</strong> {meta.totalUsers}</span>
                <span><strong>Staff:</strong> {meta.staffCount}</span>
                <span><strong>Admins:</strong> {meta.adminCount}</span>
              </div>
              <p className="text-xs"><strong>Version:</strong> {meta.version} | <strong>Last Updated:</strong> {new Date(meta.lastFetched).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Patient Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">
                Active patient records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter(p => p.email_confirmed_at).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Email verified patients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter(p => {
                  const createdAt = new Date(p.created_at);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return createdAt > thirtyDaysAgo;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {patients.length > 0 ? (
              <div className="space-y-4">
                {patients.map((patient) => (
                  <div key={patient.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                        {patient.phone && (
                          <p className="text-sm text-gray-500">{patient.phone}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {patient.user_roles.map((userRole, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {userRole.roles.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <UserEmailStatus user={patient} />
                        <div className="text-xs text-gray-500">
                          Joined: {new Date(patient.created_at).toLocaleDateString()}
                        </div>
                        {patient.facilities && (
                          <Badge variant="secondary" className="text-xs">
                            {patient.facilities.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No patients found in the system.</p>
                <p className="text-sm mt-1">Patients will appear here when they register.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </MainLayout>
  );
};

export default ConsistentPatients;
