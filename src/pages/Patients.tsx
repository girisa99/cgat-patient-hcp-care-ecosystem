
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Search, Users, Activity, UserCheck, Clock } from 'lucide-react';
import { usePatientsPage } from '@/hooks/usePatientsPage';

const Patients: React.FC = () => {
  const { hasAccess } = useRoleBasedNavigation();
  const patientsData = usePatientsPage();
  const [searchTerm, setSearchTerm] = useState('');

  if (!hasAccess('/patients')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Patients.</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const filteredPatients = patientsData.searchPatients(searchTerm);

  return (
    <AppLayout title="Patient Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
            <p className="text-muted-foreground">
              Manage patient records and information - Real Database Integration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Real Data Active
            </Badge>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
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
              <div className="text-2xl font-bold">{patientsData.patientStats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">
                From database records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientsData.patientStats.activePatients}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Patients</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientsData.patientStats.inactivePatients}</div>
              <p className="text-xs text-muted-foreground">
                Inactive status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Patients</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientsData.patientStats.recentPatients}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Patients</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[250px]"
                />
              </div>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Patients ({filteredPatients.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {patientsData.isLoading ? (
                  <div className="text-center p-8">Loading patients from database...</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPatients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">
                              {patient.firstName} {patient.lastName}
                            </TableCell>
                            <TableCell>{patient.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {patient.user_roles[0]?.role?.name || 'Patient'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={patient.isActive ? "default" : "secondary"}>
                                {patient.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Patients ({patientsData.patientStats.activePatients})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.filter(p => p.isActive).map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </TableCell>
                          <TableCell>{patient.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {patient.user_roles[0]?.role?.name || 'Patient'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inactive Patients ({patientsData.patientStats.inactivePatients})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.filter(p => !p.isActive).map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </TableCell>
                          <TableCell>{patient.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {patient.user_roles[0]?.role?.name || 'Patient'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Activate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data Source Information */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Data Source: {patientsData.meta.dataSource}</span>
              <span>Hook Version: {patientsData.meta.hookVersion}</span>
              <span>Real Data Only: ✅</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Patients;
