
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserX, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface DeactivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
  userEmail: string;
}

const DeactivateUserDialog: React.FC<DeactivateUserDialogProps> = ({ 
  open, 
  onOpenChange, 
  userId, 
  userName, 
  userEmail 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDeactivate = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Update user profile to set as inactive
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Log the deactivation action
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'DEACTIVATE',
          table_name: 'profiles',
          record_id: userId,
          new_values: { 
            is_active: false, 
            deactivation_reason: reason,
            deactivated_by: (await supabase.auth.getUser()).data.user?.id
          }
        });

      toast({
        title: "User Deactivated",
        description: `${userName} has been deactivated successfully`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
      setReason('');
    } catch (error: any) {
      console.error('Failed to deactivate user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <UserX className="h-5 w-5" />
            Deactivate User Account
          </DialogTitle>
          <DialogDescription>
            Deactivate the account for {userName} ({userEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-800">Warning: Account Deactivation</p>
              <p className="text-red-700 mt-1">
                This action will prevent the user from logging in and accessing any system resources. 
                The account can be reactivated later if needed.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Deactivation</Label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for deactivating this user account..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>What happens when a user is deactivated:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>User will be immediately logged out of all sessions</li>
              <li>User cannot log in until account is reactivated</li>
              <li>All assigned roles and permissions remain intact</li>
              <li>User data and history are preserved</li>
              <li>Account can be reactivated by an administrator</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeactivate} 
            disabled={isLoading || !reason.trim()}
            variant="destructive"
          >
            {isLoading ? 'Deactivating...' : 'Deactivate User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeactivateUserDialog;
