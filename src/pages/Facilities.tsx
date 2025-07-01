
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import FacilitiesList from '@/components/facilities/FacilitiesList';
import CreateFacilityDialog from '@/components/facilities/CreateFacilityDialog';
import EditFacilityDialog from '@/components/facilities/EditFacilityDialog';
import { useFacilities } from '@/hooks/useFacilities';

const Facilities = () => {
  const { facilities, isLoading } = useFacilities();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);

  const handleCreateFacility = () => {
    setCreateDialogOpen(true);
  };

  const handleEditFacility = (facility: any) => {
    setSelectedFacility(facility);
    setEditDialogOpen(true);
  };

  // Calculate stats
  const totalFacilities = facilities?.length || 0;
  const activeFacilities = facilities?.filter(f => f.is_active).length || 0;
  const inactiveFacilities = totalFacilities - activeFacilities;
  const treatmentFacilities = facilities?.filter(f => f.facility_type === 'treatmentFacility').length || 0;

  const headerActions = (
    <Button onClick={handleCreateFacility}>
      <Plus className="h-4 w-4 mr-2" />
      Add Facility
    </Button>
  );

  return (
    <MainLayout>
      <PageContainer
        title="Facilities Management"
        subtitle="Manage healthcare facilities and their information"
        headerActions={headerActions}
      >
        <div className="space-y-6">
          {/* Stats Grid */}
          <AdminStatsGrid columns={4}>
            <StatCard
              title="Total Facilities"
              value={totalFacilities}
              icon={Building2}
              description="All registered facilities"
            />
            <StatCard
              title="Active Facilities"
              value={activeFacilities}
              icon={CheckCircle}
              description="Currently active facilities"
            />
            <StatCard
              title="Inactive Facilities"
              value={inactiveFacilities}
              icon={AlertCircle}
              description="Inactive facilities"
            />
            <StatCard
              title="Treatment Centers"
              value={treatmentFacilities}
              icon={Settings}
              description="Treatment facility type"
            />
          </AdminStatsGrid>

          {/* Facilities List */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <FacilitiesList 
                facilities={facilities || []}
                onEditFacility={handleEditFacility}
              />
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <CreateFacilityDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        {selectedFacility && (
          <EditFacilityDialog
            facility={selectedFacility}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        )}
      </PageContainer>
    </MainLayout>
  );
};

export default Facilities;
