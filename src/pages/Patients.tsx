import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HeartHandshake, Search, RefreshCw, Eye, Edit, UserPlus } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterData } from '@/hooks/useMasterData';

const Patients: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useMasterAuth();
  const { 
    patients, 
    isLoading, 
    error, 
    refreshData, 
    stats
  } = useMasterData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isViewPatientOpen, setIsViewPatientOpen] = useState(false);

  console.log('🏥 Patients Page - Master Data Integration (Patient-Specific)');

  const filteredPatients = patients.filter(patient => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      patient.first_name.toLowerCase().includes(query) ||
      patient.last_name.toLowerCase().includes(query) ||
      patient.email.toLowerCase().includes(query)
    );
  });

  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient);
    setIsViewPatientOpen(true);
  };

  const handleEditPatient = (patient: any) => {
    console.log('Editing patient:', patient.id);
    // Implement edit functionality
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-600" />
          <div className="text-muted-foreground">Loading patients...</div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Please log in to view patients</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">Error loading patients: {error.message}</div>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const patientStats = {
    totalPatients: patients.length,
    activePatients: patients.length, // All patients are considered active
    recentPatients: patients.filter(p => 
      new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
        <p className="text-muted-foreground">
          Manage patient records and healthcare information
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-pink-50 rounded-lg">
          <div className="text-2xl font-bold text-pink-600">{patientStats.totalPatients}</div>
          <div className="text-sm text-pink-600">Total Patients</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{patientStats.activePatients}</div>
          <div className="text-sm text-green-600">Active</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{patientStats.recentPatients}</div>
          <div className="text-sm text-blue-600">Recent (30 days)</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5" />
              Patient Records ({filteredPatients.length} patients)
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Patient
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search patients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Patients List */}
            {filteredPatients.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <HeartHandshake className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No patients found</p>
                {searchQuery && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
                {patients.length === 0 && !searchQuery && (
                  <p className="text-sm">No users with patient/caregiver roles found</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">
                          {patient.first_name} {patient.last_name}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Patient
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{patient.email}</div>
                      {patient.phone && (
                        <div className="text-sm text-muted-foreground">📞 {patient.phone}</div>
                      )}
                      <div className="flex gap-1 mt-1">
                        {patient.user_roles?.map((ur, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {ur.role?.name || 'Unknown Role'}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Registered: {new Date(patient.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Active</Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewPatient(patient)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPatient(patient)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Patient Dialog */}
      <Dialog open={isViewPatientOpen} onOpenChange={setIsViewPatientOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <div className="text-sm">{selectedPatient.first_name} {selectedPatient.last_name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="text-sm">{selectedPatient.email}</div>
                </div>
                {selectedPatient.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <div className="text-sm">{selectedPatient.phone}</div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                  <div className="text-sm">{new Date(selectedPatient.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Roles</label>
                <div className="flex gap-1 mt-1">
                  {selectedPatient.user_roles?.map((ur, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {ur.role?.name || 'Unknown Role'}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patients;
