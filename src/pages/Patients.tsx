
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Activity, UserCheck, Calendar, Search, Filter, Download } from 'lucide-react';
import PatientsList from '@/components/patients/PatientsList';
import CreatePatientDialog from '@/components/patients/CreatePatientDialog';
import EditPatientDialog from '@/components/patients/EditPatientDialog';
import { usePatients } from '@/hooks/usePatients';

const Patients = () => {
  const { patients, isLoading, meta } = usePatients();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreatePatient = () => {
    setCreateDialogOpen(true);
  };

  const handleEditPatient = (patient: any) => {
    setSelectedPatient(patient);
    setEditDialogOpen(true);
  };

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => 
    patient.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total: patients.length,
    active: patients.filter(p => p.created_at).length,
    withFacilities: patients.filter(p => p.facilities).length,
    recentlyAdded: patients.filter(p => {
      const createdDate = new Date(p.created_at || '');
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length
  };

  const headerActions = (
    <Button onClick={handleCreatePatient}>
      <Plus className="h-4 w-4 mr-2" />
      Add Patient
    </Button>
  );

  return (
    <MainLayout>
      <PageContainer
        title="Patients Management"
        subtitle={`Manage patient records and information (${patients.length} patients from ${meta.dataSource})`}
        headerActions={headerActions}
      >
        <div className="space-y-6">
          {/* Data Source Indicator */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-800 font-medium">
                Real Database: {meta.dataSource}
              </span>
            </div>
            <div className="mt-2 text-xs text-green-700">
              Found: {patients.length} patients with patientCaregiver role
            </div>
          </div>

          {/* Stats Grid */}
          <AdminStatsGrid columns={4}>
            <StatCard
              title="Total Patients"
              value={stats.total}
              icon={Users}
              description="All registered patients"
            />
            <StatCard
              title="Active Patients"
              value={stats.active}
              icon={Activity}
              description="Currently active"
            />
            <StatCard
              title="With Facilities"
              value={stats.withFacilities}
              icon={UserCheck}
              description="Assigned to facilities"
            />
            <StatCard
              title="Recently Added"
              value={stats.recentlyAdded}
              icon={Calendar}
              description="Added this week"
            />
          </AdminStatsGrid>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Patients List */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading patients...</p>
                </div>
              ) : (
                <PatientsList 
                  patients={filteredPatients}
                  onEditPatient={handleEditPatient}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <CreatePatientDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        {selectedPatient && (
          <EditPatientDialog
            patient={selectedPatient}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        )}
      </PageContainer>
    </MainLayout>
  );
};

export default Patients;
