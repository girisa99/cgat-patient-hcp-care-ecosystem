
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type UserRole = Database['public']['Enums']['user_role'];

interface RemoveRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const RemoveRoleDialog: React.FC<RemoveRoleDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const { users } = useUsers();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');

  // Find current user to show current roles
  const currentUser = users?.find(u => u.id === userId);
  const currentRoles = currentUser?.user_roles || [];

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Removing role:', roleName, 'from user:', userId);
      
      // Get the role ID
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError || !role) {
        throw new Error(`Role '${roleName}' not found`);
      }

      // Remove the role from the user
      const { error: removeError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', role.id);

      if (removeError) {
        throw new Error(removeError.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Role Removed",
        description: "User role has been removed successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Remove role error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !selectedRole) {
      return;
    }

    console.log('🔄 Attempting to remove role:', selectedRole, 'from user:', userId);
    removeRoleMutation.mutate({ userId, roleName: selectedRole });
    setSelectedRole('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Role from {userName}</DialogTitle>
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
        
        {currentRoles.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="role">Select Role to Remove</Label>
              <Select
                value={selectedRole}
                onValueChange={(value: UserRole) => setSelectedRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role to remove" />
                </SelectTrigger>
                <SelectContent>
                  {currentRoles.map((ur, index) => (
                    <SelectItem 
                      key={index} 
                      value={ur.roles.name}
                    >
                      {ur.roles.name}
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
              <Button 
                type="submit" 
                disabled={removeRoleMutation.isPending || !selectedRole}
                variant="destructive"
              >
                {removeRoleMutation.isPending ? 'Removing...' : 'Remove Role'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">This user has no roles to remove.</p>
            <Button
              onClick={() => onOpenChange(false)}
              className="mt-3"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RemoveRoleDialog;
