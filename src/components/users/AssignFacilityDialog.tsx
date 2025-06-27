
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/hooks/useUsers';
import { useFacilities } from '@/hooks/useFacilities';

interface AssignFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const AssignFacilityDialog: React.FC<AssignFacilityDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const { assignFacility, isAssigningFacility } = useUsers();
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
      
      setSelectedFacilityId('');
      setAccessLevel('read');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to assign facility:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Assign Facility to {userName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facility">Select Facility</Label>
            <Select
              value={selectedFacilityId}
              onValueChange={setSelectedFacilityId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a facility to assign" />
              </SelectTrigger>
              <SelectContent>
                {facilities?.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_level">Access Level</Label>
            <Select
              value={accessLevel}
              onValueChange={(value: 'read' | 'write' | 'admin') => setAccessLevel(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read Only</SelectItem>
                <SelectItem value="write">Read & Write</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAssigningFacility}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isAssigningFacility || !selectedFacilityId}
            >
              {isAssigningFacility ? 'Assigning...' : 'Assign Facility'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignFacilityDialog;
