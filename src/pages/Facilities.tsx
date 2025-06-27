
import React, { useState } from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import FacilitiesList from '@/components/facilities/FacilitiesList';
import CreateFacilityDialog from '@/components/facilities/CreateFacilityDialog';
import EditFacilityDialog from '@/components/facilities/EditFacilityDialog';
import { useFacilities } from '@/hooks/useFacilities';

const Facilities = () => {
  const { facilities, isLoading } = useFacilities();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  const handleCreateFacility = () => {
    setCreateDialogOpen(true);
  };

  const handleEditFacility = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    setEditDialogOpen(true);
  };

  const selectedFacility = selectedFacilityId 
    ? facilities?.find(f => f.id === selectedFacilityId) 
    : null;

  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
          <p className="text-muted-foreground">
            Manage healthcare facilities and their information
          </p>
        </div>
        
        <FacilitiesList 
          onCreateFacility={handleCreateFacility}
          onEditFacility={handleEditFacility}
        />

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
      </div>
    </StandardizedDashboardLayout>
  );
};

export default Facilities;
