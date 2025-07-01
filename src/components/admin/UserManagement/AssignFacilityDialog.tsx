
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { useRealFacilities } from '@/hooks/useRealFacilities';
import { Building } from 'lucide-react';

interface AssignFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

export const AssignFacilityDialog: React.FC<AssignFacilityDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = React.useState<string>('');
  const { assignFacility, isAssigningFacility } = useUnifiedUserManagement();
  
  // Use real facilities data - single source of truth
  const { facilities, isLoading: facilitiesLoading } = useRealFacilities();

  const handleAssign = () => {
    if (!userId || !selectedFacilityId) return;

    console.log('🏢 Assigning facility:', selectedFacilityId, 'to user:', userId);
    assignFacility(
      { userId, facilityId: selectedFacilityId },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedFacilityId('');
        }
      }
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedFacilityId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Assign Facility to {userName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Facility</label>
            <Select
              value={selectedFacilityId}
              onValueChange={setSelectedFacilityId}
              disabled={facilitiesLoading || isAssigningFacility}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder={
                    facilitiesLoading 
                      ? "Loading facilities..." 
                      : "Choose a facility"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    <div>
                      <div className="font-medium">{facility.name}</div>
                      <div className="text-sm text-gray-500 capitalize">
                        {facility.facility_type.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {facilities.length === 0 && !facilitiesLoading && (
              <p className="text-sm text-gray-500 mt-1">
                No facilities available. Please create facilities first.
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedFacilityId || isAssigningFacility || facilitiesLoading}
            >
              {isAssigningFacility ? 'Assigning...' : 'Assign Facility'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
