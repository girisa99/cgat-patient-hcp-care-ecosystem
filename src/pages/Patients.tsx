
import React, { useState } from 'react';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Activity, UserCheck, Calendar, Search, Filter, Download } from 'lucide-react';
import { PatientsList } from '@/components/admin/PatientManagement/PatientsList';
import { PatientViewDialog } from '@/components/admin/PatientManagement/PatientViewDialog';
import { PatientEditDialog } from '@/components/admin/PatientManagement/PatientEditDialog';
import CreatePatientDialog from '@/components/patients/CreatePatientDialog';
import { UnifiedPageWrapper } from '@/components/layout/UnifiedPageWrapper';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';
import { useToast } from '@/hooks/use-toast';

/**
 * Patients Page - UNIFIED IMPLEMENTATION
 * Uses single source of truth via UnifiedPageWrapper and useUnifiedPageData
 */
const Patients: React.FC = () => {
  const { users } = useUnifiedPageData();
  const { toast } = useToast();
  
  console.log('🎯 Patients Page - Unified Single Source Implementation');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get patients from unified source
  const patients = users.getPatients();
  const filteredPatients = users.searchUsers(searchQuery).filter(user =>
    user.user_roles?.some(ur => ur.roles.name === 'patientCaregiver')
  );

  const handleCreatePatient = () => {
    console.log('🆕 Opening create patient dialog');
    setCreateDialogOpen(true);
  };

  const handleViewPatient = (patientId: string) => {
    console.log('👁️ Opening view dialog for patient:', patientId);
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
    console.log('✏️ Opening edit dialog for patient:', patientId);
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setEditDialogOpen(true);
    }
  };

  const handleDeactivatePatient = (patientId: string, patientName: string) => {
    console.log('🚫 Deactivating patient:', patientId, patientName);
    toast({
      title: "Deactivate Patient",
      description: `Feature to deactivate ${patientName} will be implemented soon.`,
    });
  };

  // Calculate patient statistics from unified source
  const stats = {
    total: patients.length,
    active: patients.filter(p => p.last_sign_in_at).length,
    withFacilities: patients.filter(p => p.facility_id).length,
    recentlyAdded: patients.filter(p => {
      const createdAt = new Date(p.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt > weekAgo;
    }).length
  };

  const headerActions = (
    <Button onClick={handleCreatePatient}>
      <Plus className="h-4 w-4 mr-2" />
      Add Patient
    </Button>
  );

  return (
    <UnifiedPageWrapper
      title="Patients Management"
      subtitle={`Manage patient records (${patients.length} patients from ${users.meta.dataSource})`}
      headerActions={headerActions}
      fluid
    >
      <div className="space-y-6">
        {/* Stats Grid - Real Data from Single Source */}
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
            description="Recently active"
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
              isLoading={users.isLoading}
            />
          </CardContent>
        </Card>
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
            onClose={() => {
              setViewDialogOpen(false);
              setSelectedPatient(null);
            }}
          />

          <PatientEditDialog
            patient={selectedPatient}
            open={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedPatient(null);
            }}
          />
        </>
      )}
    </UnifiedPageWrapper>
  );
};

export default Patients;
