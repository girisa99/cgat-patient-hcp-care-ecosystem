
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
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface ModuleRoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModule?: any;
}

const roles: Array<{ value: UserRole; label: string }> = [
  { value: 'superAdmin', label: 'Super Admin' },
  { value: 'healthcareProvider', label: 'Healthcare Provider' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'caseManager', label: 'Case Manager' },
  { value: 'onboardingTeam', label: 'Onboarding Team' },
  { value: 'patientCaregiver', label: 'Patient Caregiver' }
];

const ModuleRoleAssignmentDialog: React.FC<ModuleRoleAssignmentDialogProps> = ({
  open,
  onOpenChange,
  selectedModule
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  
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
      roleId: selectedRole as UserRole,
      moduleId: selectedModule.id
    });
    
    onOpenChange(false);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as UserRole);
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
            <Select value={selectedRole} onValueChange={handleRoleChange}>
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
