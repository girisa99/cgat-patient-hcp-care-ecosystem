
import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
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
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'superAdmin', label: 'Super Administrator' },
  { value: 'healthcareProvider', label: 'Healthcare Provider' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'caseManager', label: 'Case Manager' },
  { value: 'onboardingTeam', label: 'Onboarding Team' },
  { value: 'patientCaregiver', label: 'Patient/Caregiver' },
];

const AssignRoleDialog: React.FC<AssignRoleDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const { assignRole, isAssigningRole } = useUsers();
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !selectedRole) {
      return;
    }

    assignRole({ userId, roleName: selectedRole });
    setSelectedRole('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Role to {userName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="role">Select Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: UserRole) => setSelectedRole(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role to assign" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
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
            <Button type="submit" disabled={isAssigningRole || !selectedRole}>
              {isAssigningRole ? 'Assigning...' : 'Assign Role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignRoleDialog;
