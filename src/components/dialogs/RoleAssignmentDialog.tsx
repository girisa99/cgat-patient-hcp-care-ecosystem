/**
 * Role Assignment Dialog Component
 * Handles role assignment/removal for users with proper RBAC integration
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Users, AlertTriangle } from 'lucide-react';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { useMasterToast } from '@/hooks/useMasterToast';
import type { UserWithRoles } from '@/types/userManagement';

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRoles | null;
}

export const RoleAssignmentDialog: React.FC<RoleAssignmentDialogProps> = ({
  open,
  onOpenChange,
  user
}) => {
  const { roles } = useMasterData();
  const { assignRole, removeRole, isAssigningRole, isRemovingRole } = useMasterUserManagement();
  const { showSuccess, showError } = useMasterToast();
  
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current user roles
  const currentRoleIds = user?.user_roles?.map(ur => ur.role.name) || [];

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleAssignRoles = async () => {
    if (!user || selectedRoles.length === 0) {
      showError('Role Assignment', 'Please select at least one role');
      return;
    }

    setIsProcessing(true);
    
    try {
      for (const roleId of selectedRoles) {
        if (!currentRoleIds.includes(roleId)) {
          await assignRole(user.id, roleId);
        }
      }
      
      showSuccess('Roles Assigned', `Successfully assigned ${selectedRoles.length} role(s) to ${user.first_name} ${user.last_name}`);
      onOpenChange(false);
      setSelectedRoles([]);
    } catch (error) {
      showError('Assignment Failed', 'Failed to assign roles');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!user) return;

    try {
      await removeRole(user.id, roleId);
      showSuccess('Role Removed', `Successfully removed role from ${user.first_name} ${user.last_name}`);
    } catch (error) {
      showError('Removal Failed', 'Failed to remove role');
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Roles - {user.first_name} {user.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Roles */}
          <div>
            <Label className="text-sm font-medium">Current Roles</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {currentRoleIds.length > 0 ? (
                currentRoleIds.map((roleName) => (
                  <Badge key={roleName} variant="default" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {roleName}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveRole(roleName)}
                      disabled={isRemovingRole}
                    >
                      ×
                    </Button>
                  </Badge>
                ))
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">No roles assigned</span>
                </div>
              )}
            </div>
          </div>

          {/* Available Roles */}
          <div>
            <Label className="text-sm font-medium">Available Roles</Label>
            <ScrollArea className="h-48 w-full border rounded-md p-4 mt-2">
              <div className="space-y-3">
                {roles.map((role) => {
                  const isCurrentRole = currentRoleIds.includes(role.name);
                  const isSelected = selectedRoles.includes(role.name);
                  
                  return (
                    <div 
                      key={role.id} 
                      className={`flex items-center space-x-3 p-2 rounded-lg border ${
                        isCurrentRole ? 'bg-green-50 border-green-200' : 'bg-background'
                      }`}
                    >
                      <Checkbox
                        id={role.id}
                        checked={isSelected}
                        onCheckedChange={() => handleRoleToggle(role.name)}
                        disabled={isCurrentRole}
                      />
                      <div className="flex-1">
                        <Label htmlFor={role.id} className="text-sm font-medium cursor-pointer">
                          {role.name}
                        </Label>
                        {role.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {role.description}
                          </p>
                        )}
                      </div>
                      {isCurrentRole && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignRoles}
              disabled={selectedRoles.length === 0 || isProcessing || isAssigningRole}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              {isProcessing ? 'Assigning...' : `Assign ${selectedRoles.length} Role(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};