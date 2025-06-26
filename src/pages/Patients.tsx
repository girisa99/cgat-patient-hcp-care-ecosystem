
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Patients = () => {
  // Mock patient data
  const patients = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      dateOfBirth: '1985-06-15',
      lastVisit: '2024-01-15',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 987-6543',
      dateOfBirth: '1978-03-22',
      lastVisit: '2024-01-10',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      phone: '(555) 456-7890',
      dateOfBirth: '1992-11-08',
      lastVisit: '2023-12-20',
      status: 'Inactive'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patient Management</h2>
          <p className="text-muted-foreground">
            Manage patient records and care coordination
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Patient</span>
        </Button>
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
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Patients ({patients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.map((patient) => (
              <div key={patient.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{patient.name}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                      <span>{patient.email}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{patient.phone}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      patient.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status}
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {patients.length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No patients found.</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Patient
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Patients;
