
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { useConsolidatedPatients } from '@/hooks/patients/useConsolidatedPatients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, Building2, Activity, AlertTriangle } from 'lucide-react';

const Patients: React.FC = () => {
  const { patients, isLoading, error, getPatientStats, refetch } = useConsolidatedPatients();
  const stats = getPatientStats();

  console.log('🏥 Patients page - Using consolidated data:', { 
    patients: patients?.length, 
    isLoading, 
    error: error?.message,
    dataSource: 'existing unified architecture'
  });

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer title="Patients" subtitle="Loading patient data from existing system...">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading patients...</p>
            </div>
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <PageContainer title="Patients" subtitle="Error loading patient data">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Patients</h3>
                <p className="text-red-600 mb-4">Error: {error.message}</p>
                <p className="text-sm text-gray-500 mb-4">
                  This usually indicates a database connection issue or missing user roles data.
                </p>
                <div className="space-x-2">
                  <Button onClick={() => refetch()} variant="outline">
                    Try Again
                  </Button>
                  <Button onClick={() => window.location.href = '/users'} variant="outline">
                    Check Users Page
                  </Button>
                </div>
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
        subtitle="Patient data from existing unified architecture"
        headerActions={
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Data Source Indicator */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-800 font-medium">
                Using Existing Consolidated Data Architecture
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  From existing system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">With Facilities</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.withFacilities}</div>
                <p className="text-xs text-muted-foreground">
                  Assigned to facilities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recently Added</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentlyAdded}</div>
                <p className="text-xs text-muted-foreground">
                  In the last 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Records</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Patients List */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Records ({patients.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              {patients && patients.length > 0 ? (
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div key={patient.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">
                            {patient.first_name} {patient.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">{patient.email}</p>
                          {patient.phone && (
                            <p className="text-sm text-gray-600">{patient.phone}</p>
                          )}
                          {patient.facilities && (
                            <p className="text-sm text-blue-600">
                              Facility: {patient.facilities.name}
                            </p>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Roles: {patient.user_roles?.map(ur => ur.roles?.name).join(', ') || 'No roles'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No patients found in existing system</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Data comes from existing profiles table with patientCaregiver role
                  </p>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First Patient
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Patients;
