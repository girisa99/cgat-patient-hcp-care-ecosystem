import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMasterData } from '@/hooks/useMasterData';

interface FacilityAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  onAssignFacility: (userId: string, facilityId: string) => void;
}

export const FacilityAssignmentDialog: React.FC<FacilityAssignmentDialogProps> = ({
  open,
  onOpenChange,
  selectedUser,
  onAssignFacility
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const { facilities } = useMasterData();

  const handleAssignFacility = () => {
    if (selectedUser && selectedFacilityId) {
      onAssignFacility(selectedUser.id, selectedFacilityId);
      setSelectedFacilityId('');
      onOpenChange(false);
    }
  };

  const activeFacilities = facilities.filter(f => f.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assign Facility to {selectedUser?.firstName} {selectedUser?.lastName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>User Information</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium">{selectedUser?.firstName} {selectedUser?.lastName}</div>
              <div className="text-sm text-muted-foreground">{selectedUser?.email}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facility-select">Select Facility</Label>
            <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a facility to assign" />
              </SelectTrigger>
              <SelectContent>
                {activeFacilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{facility.name}</span>
                      <span className="text-sm text-muted-foreground capitalize">
                        {facility.facility_type.replace('_', ' ')}
                      </span>
                      {facility.address && (
                        <span className="text-xs text-muted-foreground">{facility.address}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Available Facilities</Label>
            <div className="flex flex-wrap gap-2">
              {activeFacilities.map((facility) => (
                <Badge key={facility.id} variant="outline" className="text-xs">
                  {facility.name}
                  <span className="ml-1 text-muted-foreground">
                    ({facility.facility_type.replace('_', ' ')})
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            onClick={handleAssignFacility} 
            disabled={!selectedFacilityId}
          >
            Assign Facility
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};