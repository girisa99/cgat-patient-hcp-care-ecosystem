
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, Search, Filter, Eye, Edit, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useConsistentPatients } from '@/hooks/useConsistentPatients';
import { useToast } from '@/hooks/use-toast';

const ConsistentPatients = () => {
  const { patients, isLoading, error, deactivatePatient, isDeactivating } = useConsistentPatients();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter patients based on search term
  const filteredPatients = patients?.filter(patient =>
    patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  ) || [];

  const handleViewPatient = (patientId: string) => {
    toast({
      title: "View Patient",
      description: "Patient details view would open here.",
    });
    console.log('View patient:', patientId);
  };

  const handleEditPatient = (patientId: string) => {
    toast({
      title: "Edit Patient",
      description: "Patient edit form would open here.",
    });
    console.log('Edit patient:', patientId);
  };

  const handleDeactivatePatient = (patientId: string, patientName: string) => {
    if (window.confirm(`Are you sure you want to deactivate ${patientName}?`)) {
      deactivatePatient(patientId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Patient Management</h2>
            <p className="text-muted-foreground">Loading patient records...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading patients...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Patient Management</h2>
            <p className="text-muted-foreground text-red-600">
              Error loading patient records: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patient Management (Unified)</h2>
          <p className="text-muted-foreground">
            View and manage patient records using unified data source
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search patients by name, email, or phone..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter by Facility</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Registered Patients ({filteredPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">
                      {patient.first_name} {patient.last_name}
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                      <span>{patient.email}</span>
                      {patient.phone && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>{patient.phone}</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Facility: {patient.facilities?.name || 'Not assigned'}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>Registered: {formatDate(patient.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-1"
                        onClick={() => handleViewPatient(patient.id)}
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-1"
                        onClick={() => handleEditPatient(patient.id)}
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        onClick={() => handleDeactivatePatient(
                          patient.id, 
                          `${patient.first_name} ${patient.last_name}`
                        )}
                        disabled={isDeactivating}
                      >
                        <UserX className="h-3 w-3" />
                        <span>Deactivate</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredPatients.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsistentPatients;
