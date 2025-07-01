
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useUsers } from '@/hooks/useUsers';

interface RemoveRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const RemoveRoleDialog: React.FC<RemoveRoleDialogProps> = ({ open, onOpenChange, userId, userName }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { users } = useUsers();
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId && open) {
      const user = users.find(u => u.id === userId);
      setUserRoles(user?.user_roles || []);
    }
  }, [userId, users, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedRoleId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', selectedRoleId);

      if (error) throw error;

      toast({
        title: "Role Removed",
        description: `Role has been removed from ${userName}`,
      });

      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
      setSelectedRoleId('');
    } catch (error: any) {
      console.error('Failed to remove role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove Role</DialogTitle>
          <DialogDescription>
            Remove a role from {userName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Select Role to Remove</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role to remove" />
              </SelectTrigger>
              <SelectContent>
                {userRoles.map((userRole, index) => (
                  <SelectItem key={index} value={userRole.role_id || index.toString()}>
                    {userRole.roles?.name || 'Unknown Role'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {userRoles.length === 0 && (
            <p className="text-sm text-gray-500">This user has no roles assigned.</p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !selectedRoleId}
              variant="destructive"
            >
              {isLoading ? 'Removing...' : 'Remove Role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveRoleDialog;
