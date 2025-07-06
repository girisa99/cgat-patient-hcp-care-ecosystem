
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, UserCheck, Database } from 'lucide-react';
import { usePatientsPage } from '@/hooks/usePatientsPage';

const SimplePatients: React.FC = () => {
  const { patients, isLoading, patientStats } = usePatientsPage();
  
  console.log('👥 Simple Patients - Real Database Integration');

  return (
    <AppLayout title="Simple Patients">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Simple Patients View</h1>
            <p className="text-muted-foreground">
              Simplified patient overview - Real database integration
            </p>
          </div>
          <Badge variant="default" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            Real Data Active
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientStats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">
                From database
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientStats.activePatients}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Patients</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientStats.recentPatients || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle>All Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center p-8">Loading patients from database...</div>
            ) : (
              <div className="space-y-4">
                {patients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">{patient.first_name} {patient.last_name}</h3>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                      <p className="text-xs text-gray-500">
                        Patient | 
                        Created: {new Date(patient.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={patient.is_active ? "default" : "secondary"}>
                      {patient.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
                {patients.length === 0 && (
                  <div className="text-center p-8 text-gray-500">
                    No patients found in database
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Source Information */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Data Source: Real Database (Supabase)</span>
              <span>Total Records: {patients.length}</span>
              <span>No Mock Data: ✅</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SimplePatients;
