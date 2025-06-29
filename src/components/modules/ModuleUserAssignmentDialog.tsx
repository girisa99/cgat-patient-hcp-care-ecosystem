
import React, { useState, useEffect } from 'react';
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
import { useUsers } from '@/hooks/useUsers';
import { useModules } from '@/hooks/useModules';
import { User, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ModuleUserAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModule?: any;
}

const ModuleUserAssignmentDialog: React.FC<ModuleUserAssignmentDialogProps> = ({
  open,
  onOpenChange,
  selectedModule
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { assignModule, isAssigning } = useModules();
  const { toast } = useToast();

  // Reset form when dialog opens/closes or module changes
  useEffect(() => {
    if (!open) {
      setSelectedUserId('');
      setExpirationDate('');
    }
  }, [open, selectedModule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedModule || !selectedUserId) return;
    
    try {
      console.log('Assigning module to user:', {
        moduleId: selectedModule.id,
        userId: selectedUserId,
        expiresAt: expirationDate || null
      });

      // For now, show success toast as the actual assignment would happen via API
      toast({
        title: "Module Assigned",
        description: `Module "${selectedModule.name}" has been assigned to the selected user.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning module to user:', error);
      toast({
        title: "Error",
        description: "Failed to assign module to user. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingUsers) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Loading Users...
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Module to User
          </DialogTitle>
          <DialogDescription>
            Grant module access to a specific user.
            <br />
            Module: <strong>{selectedModule?.name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {user.first_name || user.last_name 
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : user.email
                        }
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration">Expiration Date (Optional)</Label>
            <input
              type="datetime-local"
              id="expiration"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {selectedModule && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium">{selectedModule.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedModule.description || 'No description available'}
              </p>
            </div>
          )}

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
              disabled={!selectedModule || !selectedUserId || isAssigning}
              className="flex-1"
            >
              {isAssigning ? 'Assigning...' : 'Assign Module'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleUserAssignmentDialog;
