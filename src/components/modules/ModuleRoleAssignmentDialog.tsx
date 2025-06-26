
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useModules } from '@/hooks/useModules';
import { Shield } from 'lucide-react';

interface ModuleRoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModule?: any;
}

const roles = [
  { value: 'superAdmin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'onboardingTeam', label: 'Onboarding Team' },
  { value: 'clinician', label: 'Clinician' },
  { value: 'user', label: 'User' }
];

const ModuleRoleAssignmentDialog: React.FC<ModuleRoleAssignmentDialogProps> = ({
  open,
  onOpenChange,
  selectedModule
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  const { assignModuleToRole, isAssigningToRole } = useModules();

  // Reset form when dialog opens/closes or module changes
  useEffect(() => {
    if (!open) {
      setSelectedRole('');
    }
  }, [open, selectedModule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedModule || !selectedRole) return;
    
    await assignModuleToRole({
      roleId: selectedRole,
      moduleId: selectedModule.id
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assign Module to Role
          </DialogTitle>
          <DialogDescription>
            Grant module access to all users with a specific role.
            <br />
            Module: <strong>{selectedModule?.name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedModule && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium">{selectedModule.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedModule.description || 'No description available'}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedModule || !selectedRole || isAssigningToRole}
              className="flex-1"
            >
              {isAssigningToRole ? 'Assigning...' : 'Assign Module'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleRoleAssignmentDialog;
