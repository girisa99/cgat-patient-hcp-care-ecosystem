
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

// Simple roles data - in a real app, this would come from a hook
const roles = [
  { id: '1', name: 'superAdmin', description: 'Super Administrator' },
  { id: '2', name: 'caseManager', description: 'Case Manager' },
  { id: '3', name: 'onboardingTeam', description: 'Onboarding Team' },
  { id: '4', name: 'healthcareProvider', description: 'Healthcare Provider' },
  { id: '5', name: 'nurse', description: 'Nurse' },
  { id: '6', name: 'patientCaregiver', description: 'Patient/Caregiver' }
];

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName?: string;
}

const AssignRoleDialog: React.FC<AssignRoleDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const { assignRole, isAssigningRole } = useUnifiedUserManagement();
  const [selectedRole, setSelectedRole] = React.useState<string>('');

  const handleAssign = async () => {
    if (!userId || !selectedRole) return;

    try {
      await assignRole({ userId, roleName: selectedRole as UserRole });
      setSelectedRole('');
      onOpenChange(false);
    } catch (error) {
      console.error('Role assignment error:', error);
    }
  };

  const handleClose = () => {
    setSelectedRole('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assign Role{userName ? ` to ${userName}` : ''}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="role">Select Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    <div>
                      <div className="font-medium">{role.name}</div>
                      {role.description && (
                        <div className="text-sm text-gray-500">{role.description}</div>
                      )}
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
              disabled={!selectedRole || isAssigningRole}
            >
              {isAssigningRole ? 'Assigning...' : 'Assign Role'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignRoleDialog;
