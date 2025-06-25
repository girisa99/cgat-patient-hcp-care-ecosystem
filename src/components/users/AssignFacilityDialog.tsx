
import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useFacilities } from '@/hooks/useFacilities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AssignFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const accessLevels = [
  { value: 'read', label: 'Read Only' },
  { value: 'write', label: 'Read & Write' },
  { value: 'admin', label: 'Administrator' },
] as const;

const AssignFacilityDialog: React.FC<AssignFacilityDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const { assignFacility, isAssigningFacility } = useUsers();
  const { facilities } = useFacilities();
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<'read' | 'write' | 'admin'>('read');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !selectedFacility) {
      return;
    }

    assignFacility({ 
      userId, 
      facilityId: selectedFacility, 
      accessLevel: selectedAccessLevel 
    });
    
    setSelectedFacility('');
    setSelectedAccessLevel('read');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Facility Access to {userName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="facility">Select Facility</Label>
            <Select
              value={selectedFacility}
              onValueChange={setSelectedFacility}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a facility" />
              </SelectTrigger>
              <SelectContent>
                {facilities?.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name} ({facility.facility_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="access_level">Access Level</Label>
            <Select
              value={selectedAccessLevel}
              onValueChange={(value: 'read' | 'write' | 'admin') => setSelectedAccessLevel(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accessLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isAssigningFacility || !selectedFacility}>
              {isAssigningFacility ? 'Assigning...' : 'Assign Access'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignFacilityDialog;
