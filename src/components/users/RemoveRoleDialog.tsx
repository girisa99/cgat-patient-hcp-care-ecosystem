
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUsers } from '@/hooks/useUsers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isRemoving, setIsRemoving] = useState(false);

  const currentUser = users?.find(u => u.id === userId);
  const userRoles = currentUser?.user_roles || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !selectedRoleId) return;

    setIsRemoving(true);
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', selectedRoleId);

      if (error) {
        throw error;
      }

      toast({
        title: "Role Removed",
        description: "User role has been removed successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedRoleId('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to remove role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (!currentUser || userRoles.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Remove Role from {userName}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This user has no roles assigned to remove.
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Remove Role from {userName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Current Roles:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {userRoles.map((userRole, index) => (
                <Badge key={index} variant="secondary">
                  {userRole.roles.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Select Role to Remove</Label>
              <Select
                value={selectedRoleId}
                onValueChange={setSelectedRoleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role to remove" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((userRole, index) => (
                    <SelectItem key={index} value={userRole.roles.id || userRole.role_id}>
                      {userRole.roles.name}
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
                disabled={isRemoving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isRemoving || !selectedRoleId}
                variant="destructive"
              >
                {isRemoving ? 'Removing...' : 'Remove Role'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveRoleDialog;
