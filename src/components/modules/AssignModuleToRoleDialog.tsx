
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModules } from '@/hooks/useModules';

interface AssignModuleToRoleDialogProps {
  module: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AssignModuleToRoleDialog: React.FC<AssignModuleToRoleDialogProps> = ({ module, open, onOpenChange }) => {
  const { assignModuleToRole } = useModules();
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    { id: 'superAdmin', name: 'Super Admin' },
    { id: 'admin', name: 'Admin' },
    { id: 'moderator', name: 'Moderator' },
    { id: 'user', name: 'User' },
    { id: 'patientCaregiver', name: 'Patient Caregiver' },
    { id: 'healthcareProvider', name: 'Healthcare Provider' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && module) {
      assignModuleToRole({ roleId: selectedRole, moduleId: module.id });
      onOpenChange(false);
      setSelectedRole('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Module to Role</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Module</Label>
            <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
              {module?.name}
            </div>
          </div>
          
          <div>
            <Label htmlFor="role">Select Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={!selectedRole}>
              Assign to Role
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignModuleToRoleDialog;
