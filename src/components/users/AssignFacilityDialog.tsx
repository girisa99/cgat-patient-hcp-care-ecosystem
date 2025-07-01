
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserMutations } from '@/hooks/users/useUserMutations';
import { useFacilities } from '@/hooks/useFacilities';

interface AssignFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const AssignFacilityDialog: React.FC<AssignFacilityDialogProps> = ({ open, onOpenChange, userId, userName }) => {
  const { assignFacility, isAssigningFacility } = useUserMutations();
  const { facilities } = useFacilities();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [accessLevel, setAccessLevel] = useState<'read' | 'write' | 'admin'>('read');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedFacilityId) return;

    try {
      await assignFacility({
        userId,
        facilityId: selectedFacilityId,
        accessLevel
      });
      
      onOpenChange(false);
      setSelectedFacilityId('');
      setAccessLevel('read');
    } catch (error) {
      console.error('Failed to assign facility:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Facility</DialogTitle>
          <DialogDescription>
            Assign facility access to {userName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facility">Select Facility</Label>
            <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a facility" />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name} - {facility.facility_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_level">Access Level</Label>
            <Select value={accessLevel} onValueChange={(value: 'read' | 'write' | 'admin') => setAccessLevel(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read Only</SelectItem>
                <SelectItem value="write">Read & Write</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAssigningFacility || !selectedFacilityId}>
              {isAssigningFacility ? 'Assigning...' : 'Assign Facility'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignFacilityDialog;
