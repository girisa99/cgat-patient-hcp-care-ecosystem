
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Plus, Heart } from 'lucide-react';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterAuth } from '@/hooks/useMasterAuth';

const Patients: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, userRoles } = useMasterAuth();
  const { 
    users, 
    isLoading, 
    error, 
    refreshData, 
    searchUsers,
    stats
  } = useMasterData();
  
  const [searchQuery, setSearchQuery] = React.useState('');

  console.log('🏥 Patients Page - Master Data Integration');

  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-muted-foreground">Loading patients...</div>
        </div>
      </div>
    );
  }

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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600">Error loading patients: {error.message}</div>
            <Button onClick={refreshData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter for patients only
  const patients = users.filter(user => 
    user.user_roles.some(ur => ur.role.name === 'patientCaregiver')
  );

  const filteredPatients = patients.filter(patient =>
    patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
        <p className="text-muted-foreground">
          Manage patient data and care coordination
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
          <div className="text-sm text-blue-600">Total Patients</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{patients.length}</div>
          <div className="text-sm text-green-600">Active Patients</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.totalFacilities}</div>
          <div className="text-sm text-purple-600">Facilities</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{userRoles.length}</div>
          <div className="text-sm text-orange-600">Your Roles</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Patient Registry ({filteredPatients.length} patients)
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
              <Button
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
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
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No patients found</p>
                {searchQuery && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
                {patients.length === 0 && (
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
                      <div className="flex gap-1 mt-1">
                        {patient.user_roles.map((ur, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {ur.role.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Registered: {new Date(patient.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Active</Badge>
                      <Button variant="outline" size="sm">
                        View Chart
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Patients;
