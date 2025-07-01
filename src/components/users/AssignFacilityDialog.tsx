
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { useFacilities } from '@/hooks/useFacilities';

interface AssignFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

const AssignFacilityDialog: React.FC<AssignFacilityDialogProps> = ({
  open,
  onOpenChange,
  userId
}) => {
  const { assignFacility, isAssigningFacility } = useUnifiedUserManagement();
  const { facilities, isLoading: facilitiesLoading } = useFacilities();
  const [selectedFacility, setSelectedFacility] = React.useState<string>('');

  const handleAssign = async () => {
    if (!userId || !selectedFacility) return;

    try {
      await assignFacility({ userId, facilityId: selectedFacility });
      setSelectedFacility('');
      onOpenChange(false);
    } catch (error) {
      console.error('Facility assignment error:', error);
    }
  };

  const handleClose = () => {
    setSelectedFacility('');
    onOpenChange(false);
  };

  if (facilitiesLoading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Facility</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="facility">Select Facility</Label>
            <Select value={selectedFacility} onValueChange={setSelectedFacility}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a facility" />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    <div>
                      <div className="font-medium">{facility.name}</div>
                      <div className="text-sm text-gray-500">{facility.facility_type}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedFacility || isAssigningFacility}
            >
              {isAssigningFacility ? 'Assigning...' : 'Assign Facility'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignFacilityDialog;
