
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
import { Badge } from '@/components/ui/badge';

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
  const { assignRole, isAssigningRole, users } = useUsers();
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');

  // Find current user to show current roles
  const currentUser = users?.find(u => u.id === userId);
  const currentRoles = currentUser?.user_roles || [];
  
  console.log('🔍 AssignRoleDialog - Current user roles:', currentRoles);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !selectedRole) {
      console.log('❌ Missing required data for role assignment:', { userId, selectedRole });
      return;
    }

    console.log('🔄 Attempting to assign role:', selectedRole, 'to user:', userId);
    assignRole({ userId, roleName: selectedRole });
    setSelectedRole('');
    onOpenChange(false);
  };

  const hasRole = (roleName: UserRole) => {
    return currentRoles.some(ur => ur.roles.name === roleName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Role to {userName}</DialogTitle>
        </DialogHeader>
        
        {/* Show current roles */}
        {currentUser && (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Current Roles:</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {currentRoles.length > 0 ? (
                  currentRoles.map((ur, index) => (
                    <Badge key={index} variant="secondary">
                      {ur.roles.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No roles assigned</span>
                )}
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="role">Add New Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: UserRole) => setSelectedRole(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role to assign" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem 
                    key={role.value} 
                    value={role.value}
                    disabled={hasRole(role.value)}
                  >
                    {role.label} {hasRole(role.value) && '(Already assigned)'}
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
