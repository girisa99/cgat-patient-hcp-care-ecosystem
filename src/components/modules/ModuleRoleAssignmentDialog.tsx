
import React, { useState } from 'react';
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
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  const { modules, assignModuleToRole, isAssigningToRole } = useModules();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedModuleId || !selectedRole) return;
    
    assignModuleToRole({
      roleId: selectedRole,
      moduleId: selectedModuleId
    });
    
    onOpenChange(false);
    setSelectedModuleId('');
    setSelectedRole('');
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

          <div className="space-y-2">
            <Label htmlFor="module-role">Module</Label>
            <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a module" />
              </SelectTrigger>
              <SelectContent>
                {modules?.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{module.name}</span>
                      <span className="text-xs text-gray-500">
                        {module.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              disabled={!selectedModuleId || !selectedRole || isAssigningToRole}
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
