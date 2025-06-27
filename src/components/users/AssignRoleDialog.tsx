
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/hooks/useUsers';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const AssignRoleDialog: React.FC<AssignRoleDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const { assignRole, isAssigningRole } = useUsers();
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');

  const roles: { value: UserRole; label: string }[] = [
    { value: 'superAdmin', label: 'Super Admin' },
    { value: 'onboardingTeam', label: 'Onboarding Team' },
    { value: 'caseManager', label: 'Case Manager' },
    { value: 'patientCaregiver', label: 'Patient Caregiver' },
    { value: 'healthcareProvider', label: 'Healthcare Provider' },
    { value: 'nurse', label: 'Nurse' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !selectedRole) return;

    try {
      await assignRole({ userId, roleName: selectedRole });
      setSelectedRole('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Assign Role to {userName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: UserRole) => setSelectedRole(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a role to assign" />
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
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAssigningRole}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isAssigningRole || !selectedRole}
            >
              {isAssigningRole ? 'Assigning...' : 'Assign Role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignRoleDialog;
