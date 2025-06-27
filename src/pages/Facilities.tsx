
import React, { useState } from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FacilitiesList from '@/components/facilities/FacilitiesList';
import CreateFacilityDialog from '@/components/facilities/CreateFacilityDialog';
import EditFacilityDialog from '@/components/facilities/EditFacilityDialog';
import { useFacilities } from '@/hooks/useFacilities';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

const Facilities = () => {
  const { facilities } = useFacilities();
  const [createFacilityOpen, setCreateFacilityOpen] = useState(false);
  const [editFacilityOpen, setEditFacilityOpen] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  const selectedFacility = facilities?.find(f => f.id === selectedFacilityId) || null;

  const handleEditFacility = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    setEditFacilityOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditFacilityOpen(false);
    setSelectedFacilityId(null);
  };

  const headerActions = (
    <Button onClick={() => setCreateFacilityOpen(true)}>
      <Building2 className="w-4 h-4 mr-2" />
      Create Facility
    </Button>
  );

  return (
    <StandardizedDashboardLayout
      showPageHeader={true}
      pageTitle="Facilities Management"
      pageSubtitle="Manage healthcare facilities and locations"
      headerActions={headerActions}
    >
      <Card>
        <CardHeader>
          <CardTitle>Healthcare Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <FacilitiesList
            onCreateFacility={() => setCreateFacilityOpen(true)}
            onEditFacility={handleEditFacility}
          />
        </CardContent>
      </Card>

      <CreateFacilityDialog
        open={createFacilityOpen}
        onOpenChange={setCreateFacilityOpen}
      />

      <EditFacilityDialog
        open={editFacilityOpen}
        onOpenChange={handleCloseEditDialog}
        facility={selectedFacility}
      />
    </StandardizedDashboardLayout>
  );
};

export default Facilities;
