
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FacilitiesList from '@/components/facilities/FacilitiesList';
import CreateFacilityDialog from '@/components/facilities/CreateFacilityDialog';

const Facilities = () => {
  const [createFacilityOpen, setCreateFacilityOpen] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  const handleEditFacility = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    // TODO: Implement edit facility dialog
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Facilities Management</h2>
        <p className="text-muted-foreground">
          Manage healthcare facilities and locations
        </p>
      </div>
      
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
    </div>
  );
};

export default Facilities;
