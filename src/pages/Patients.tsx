
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Activity, UserCheck, Calendar, Search, Filter, Download } from 'lucide-react';
import { PatientsList } from '@/components/admin/PatientManagement/PatientsList';
import { PatientViewDialog } from '@/components/admin/PatientManagement/PatientViewDialog';
import { PatientEditDialog } from '@/components/admin/PatientManagement/PatientEditDialog';
import CreatePatientDialog from '@/components/patients/CreatePatientDialog';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { useToast } from '@/hooks/use-toast';

const Patients = () => {
  const { users, isLoading, getPatients, searchUsers, meta } = useUnifiedUserManagement();
  const { toast } = useToast();
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get patients from unified user management
  const patients = getPatients();
  
  // Filter patients based on search
  const filteredPatients = searchUsers(searchQuery).filter(user => 
    user.user_roles.some(userRole => userRole.roles.name === 'patientCaregiver')
  );

  const handleCreatePatient = () => {
    console.log('🆕 Opening create patient dialog');
    setCreateDialogOpen(true);
  };

  const handleViewPatient = (patientId: string) => {
    console.log('👁️ Patients page: Opening view dialog for patient:', patientId);
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setViewDialogOpen(true);
    } else {
      toast({
        title: "Patient Not Found",
        description: "Could not find the selected patient.",
        variant: "destructive",
      });
    }
  };

  const handleEditPatient = (patientId: string) => {
    console.log('✏️ Patients page: Opening edit dialog for patient:', patientId);
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setEditDialogOpen(true);
    } else {
      toast({
        title: "Patient Not Found",
        description: "Could not find the selected patient.",
        variant: "destructive",
      });
    }
  };

  const handleDeactivatePatient = (patientId: string, patientName: string) => {
    console.log('🚫 Patients page: Deactivating patient:', patientId, patientName);
    
    // Show confirmation toast for now - in a real app this would open a confirmation dialog
    toast({
      title: "Deactivate Patient",
      description: `Are you sure you want to deactivate ${patientName}? This feature will be implemented in the next update.`,
    });
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedPatient(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedPatient(null);
  };

  // Calculate stats from real data
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
        subtitle={`Manage patient records (${patients.length} patients from ${meta.dataSource})`}
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
              <PatientsList 
                patients={filteredPatients}
                onView={handleViewPatient}
                onEdit={handleEditPatient}
                onDeactivate={handleDeactivatePatient}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Data Source Debug */}
          <div className="text-xs text-gray-500 text-center">
            Data Source: {meta.dataSource} • {patients.length} patients loaded via unified system
          </div>
        </div>

        {/* Dialogs */}
        <CreatePatientDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        {selectedPatient && (
          <>
            <PatientViewDialog
              patient={selectedPatient}
              open={viewDialogOpen}
              onClose={handleCloseViewDialog}
            />

            <PatientEditDialog
              patient={selectedPatient}
              open={editDialogOpen}
              onClose={handleCloseEditDialog}
            />
          </>
        )}
      </PageContainer>
    </MainLayout>
  );
};

export default Patients;
